import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function fetchPaged(url: string, token: string): Promise<any[]> {
  let results: any[] = [];
  let nextPageToken: string | null = null;

  do {
    const response: Response = await fetch(
      `${url}${nextPageToken ? `&pageToken=${nextPageToken}` : ""}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!response.ok) break;

    const data: { courses?: any[]; courseWork?: any[]; nextPageToken?: string } = await response.json();
    results = results.concat(data.courses || data.courseWork || []);
    nextPageToken = data.nextPageToken ?? null;
  } while (nextPageToken);

  return results;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    // Fetch OAuth record
    const { data: tokenData, error: tokenError } = await supabase
      .from("google_oauth_tokens")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (tokenError || !tokenData) {
      throw new Error("Google Classroom not connected. Please connect first.");
    }

    let accessToken = tokenData.access_token;

    // Refresh token if expired
    if (new Date(tokenData.expires_at) <= new Date()) {
      const refreshRequest = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: Deno.env.get("GOOGLE_CLASSROOM_CLIENT_ID")!,
          client_secret: Deno.env.get("GOOGLE_CLASSROOM_CLIENT_SECRET")!,
          refresh_token: tokenData.refresh_token!,
          grant_type: "refresh_token",
        }),
      });

      const newTokens = await refreshRequest.json();

      if (!newTokens.access_token) {
        throw new Error("Failed to refresh Google token");
      }

      accessToken = newTokens.access_token;

      // Save refreshed token
      await supabase
        .from("google_oauth_tokens")
        .update({
          access_token: newTokens.access_token,
          expires_at: new Date(Date.now() + (newTokens.expires_in ?? 3600) * 1000).toISOString(),
        })
        .eq("user_id", user.id);
    }

    // Fetch All Courses
    const courses = await fetchPaged(
      "https://classroom.googleapis.com/v1/courses?courseStates=ACTIVE",
      accessToken
    );

    let totalAssignments = 0;
    let newAssignments = 0;

    for (const course of courses) {
      // Fetch assignments for course
      const assignments = await fetchPaged(
        `https://classroom.googleapis.com/v1/courses/${course.id}/courseWork?courseWorkStates=PUBLISHED`,
        accessToken
      );

      totalAssignments += assignments.length;

      for (const assignment of assignments) {
        // Check if already exists
        const { data: existing } = await supabase
          .from("tasks")
          .select("id")
          .eq("google_classroom_id", assignment.id)
          .eq("user_id", user.id)
          .maybeSingle();

        if (!existing) {
          // Convert due date
          const dueDate = assignment.dueDate
            ? new Date(
                assignment.dueDate.year,
                assignment.dueDate.month - 1,
                assignment.dueDate.day,
                assignment.dueTime?.hours ?? 23,
                assignment.dueTime?.minutes ?? 59
              ).toISOString()
            : null;

          const { error: insertError } = await supabase.from("tasks").insert({
            user_id: user.id,
            title: assignment.title,
            description: assignment.description ?? null,
            due_date: dueDate,
            priority: "medium",
            subject: course.name ?? "Google Classroom",
            category: "assignment",
            google_classroom_id: assignment.id,
            google_course_id: course.id,
            completed: false,
          });

          if (!insertError) {
            newAssignments++;
          }
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Synced ${newAssignments} new assignments from ${courses.length} courses`,
        totalAssignments,
        newAssignments,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Sync Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : `${error}` }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
