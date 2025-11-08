import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
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
    } = await supabaseClient.auth.getUser();

    if (!user) {
      throw new Error("Unauthorized");
    }

    // Get stored tokens
    const { data: tokenData, error: tokenError } = await supabaseClient
      .from("google_oauth_tokens")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (tokenError || !tokenData) {
      throw new Error("Google Classroom not connected. Please connect first.");
    }

    // Check if token is expired and refresh if needed
    let accessToken = tokenData.access_token;
    if (new Date(tokenData.expires_at) <= new Date()) {
      const clientId = Deno.env.get("GOOGLE_CLASSROOM_CLIENT_ID");
      const clientSecret = Deno.env.get("GOOGLE_CLASSROOM_CLIENT_SECRET");

      const refreshResponse = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: clientId!,
          client_secret: clientSecret!,
          refresh_token: tokenData.refresh_token!,
          grant_type: "refresh_token",
        }),
      });

      if (!refreshResponse.ok) {
        throw new Error("Failed to refresh token");
      }

      const newTokens = await refreshResponse.json();
      accessToken = newTokens.access_token;

      // Update stored token
      await supabaseClient
        .from("google_oauth_tokens")
        .update({
          access_token: newTokens.access_token,
          expires_at: new Date(Date.now() + newTokens.expires_in * 1000).toISOString(),
        })
        .eq("user_id", user.id);
    }

    // Fetch courses
    const coursesResponse = await fetch(
      "https://classroom.googleapis.com/v1/courses?courseStates=ACTIVE&teacherIsMe=false",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!coursesResponse.ok) {
      throw new Error("Failed to fetch courses");
    }

    const coursesData = await coursesResponse.json();
    const courses = coursesData.courses || [];

    let totalAssignments = 0;
    let newAssignments = 0;

    // Fetch coursework for each course
    for (const course of courses) {
      const courseworkResponse = await fetch(
        `https://classroom.googleapis.com/v1/courses/${course.id}/courseWork`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (!courseworkResponse.ok) continue;

      const courseworkData = await courseworkResponse.json();
      const assignments = courseworkData.courseWork || [];

      totalAssignments += assignments.length;

      // Sync each assignment to tasks table
      for (const assignment of assignments) {
        // Check if assignment already exists
        const { data: existingTask } = await supabaseClient
          .from("tasks")
          .select("id")
          .eq("google_classroom_id", assignment.id)
          .eq("user_id", user.id)
          .single();

        if (!existingTask) {
          const dueDate = assignment.dueDate
            ? new Date(
                assignment.dueDate.year,
                assignment.dueDate.month - 1,
                assignment.dueDate.day,
                assignment.dueTime?.hours || 23,
                assignment.dueTime?.minutes || 59
              ).toISOString()
            : null;

          const { error: insertError } = await supabaseClient.from("tasks").insert({
            user_id: user.id,
            title: assignment.title,
            description: assignment.description || null,
            due_date: dueDate,
            priority: "medium",
            subject: course.name,
            category: "assignment",
            google_classroom_id: assignment.id,
            google_course_id: course.id,
            completed: assignment.state === "TURNED_IN",
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
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});