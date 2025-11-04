import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all tasks due within 24 hours
    const tomorrow = new Date();
    tomorrow.setHours(tomorrow.getHours() + 24);
    
    const { data: dueTasks } = await supabase
      .from("tasks")
      .select("*, user:user_id(email)")
      .eq("completed", false)
      .lte("due_date", tomorrow.toISOString())
      .gte("due_date", new Date().toISOString());

    // Get all calendar events starting within 1 hour
    const oneHourFromNow = new Date();
    oneHourFromNow.setHours(oneHourFromNow.getHours() + 1);

    const { data: upcomingEvents } = await supabase
      .from("calendar_events")
      .select("*, user:user_id(email)")
      .lte("start_time", oneHourFromNow.toISOString())
      .gte("start_time", new Date().toISOString());

    const notifications: Array<{ email: string; subject: string; html: string }> = [];

    // Send notifications for due tasks
    if (dueTasks && dueTasks.length > 0) {
      for (const task of dueTasks) {
        const userEmail = (task as any).user?.email;
        if (!userEmail) continue;

        const dueDate = new Date(task.due_date);
        const hoursUntilDue = Math.round((dueDate.getTime() - Date.now()) / (1000 * 60 * 60));

        notifications.push({
          email: userEmail,
          subject: `⏰ Task Due Soon: ${task.title}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #3b82f6;">Task Reminder</h2>
              <p>Your task <strong>"${task.title}"</strong> is due in approximately ${hoursUntilDue} hours.</p>
              ${task.description ? `<p><strong>Description:</strong> ${task.description}</p>` : ""}
              ${task.subject ? `<p><strong>Subject:</strong> ${task.subject}</p>` : ""}
              <p><strong>Priority:</strong> ${task.priority.toUpperCase()}</p>
              <p><strong>Due:</strong> ${dueDate.toLocaleString()}</p>
              <p style="margin-top: 20px;">Don't forget to complete this task!</p>
            </div>
          `,
        });
      }
    }

    // Send notifications for upcoming events
    if (upcomingEvents && upcomingEvents.length > 0) {
      for (const event of upcomingEvents) {
        const userEmail = (event as any).user?.email;
        if (!userEmail) continue;

        const startTime = new Date(event.start_time);
        const minutesUntilStart = Math.round((startTime.getTime() - Date.now()) / (1000 * 60));

        notifications.push({
          email: userEmail,
          subject: `📅 Event Starting Soon: ${event.title}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #3b82f6;">Event Reminder</h2>
              <p>Your event <strong>"${event.title}"</strong> is starting in approximately ${minutesUntilStart} minutes.</p>
              ${event.description ? `<p><strong>Description:</strong> ${event.description}</p>` : ""}
              ${event.subject ? `<p><strong>Subject:</strong> ${event.subject}</p>` : ""}
              <p><strong>Type:</strong> ${event.event_type}</p>
              <p><strong>Starts:</strong> ${startTime.toLocaleString()}</p>
              ${event.location ? `<p><strong>Location:</strong> ${event.location}</p>` : ""}
              <p style="margin-top: 20px;">Get ready for your event!</p>
            </div>
          `,
        });
      }
    }

    // Send all notifications
    const results = [];
    for (const notification of notifications) {
      try {
        const emailResponse = await resend.emails.send({
          from: "Study Planner <onboarding@resend.dev>",
          to: [notification.email],
          subject: notification.subject,
          html: notification.html,
        });
        results.push({ success: true, email: notification.email, response: emailResponse });
      } catch (error) {
        console.error(`Failed to send email to ${notification.email}:`, error);
        results.push({ success: false, email: notification.email, error: (error as Error).message });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        taskNotifications: dueTasks?.length || 0,
        eventNotifications: upcomingEvents?.length || 0,
        results,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in send-notifications function:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});