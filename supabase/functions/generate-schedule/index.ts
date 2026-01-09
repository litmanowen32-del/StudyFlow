import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface QuizData {
  goesToSchool: boolean;
  schoolStartTime?: string;
  schoolEndTime?: string;
  schoolDays?: number[];
  subjects: string[];
  studyGoalHours: number;
  energyPattern: string;
  preferredSessionLength: number;
  sleepTime: string;
  wakeTime: string;
  extracurriculars: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { quizData } = await req.json() as { quizData: QuizData };
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert study schedule planner for students. Based on the user's preferences and constraints, generate an optimal weekly study schedule.

Your response MUST be valid JSON with this exact structure:
{
  "schedule": [
    {
      "day": 0-6 (0=Sunday),
      "title": "Study session title",
      "subject": "Subject name",
      "startTime": "HH:MM" (24-hour format),
      "endTime": "HH:MM" (24-hour format),
      "description": "Brief description of what to focus on"
    }
  ],
  "tips": ["Array of 3 personalized study tips based on their preferences"]
}

Rules:
- Never schedule during school hours if they attend school
- Respect sleep schedule (don't schedule too close to sleep/wake times)
- Match session lengths to their preferred duration
- Distribute subjects evenly throughout the week
- Consider energy patterns (morning person = harder subjects in AM, night owl = PM)
- Leave time for breaks and extracurriculars
- Aim to meet their weekly study goal hours`;

    const userPrompt = `Create a personalized study schedule for a student with these preferences:

School Schedule:
- Attends school: ${quizData.goesToSchool ? 'Yes' : 'No'}
${quizData.goesToSchool ? `- School hours: ${quizData.schoolStartTime} to ${quizData.schoolEndTime}
- School days: ${quizData.schoolDays?.map(d => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d]).join(', ')}` : ''}

Study Preferences:
- Subjects to study: ${quizData.subjects.join(', ')}
- Weekly study goal: ${quizData.studyGoalHours} hours
- Energy pattern: ${quizData.energyPattern}
- Preferred session length: ${quizData.preferredSessionLength} minutes
- Sleep schedule: ${quizData.wakeTime} (wake) to ${quizData.sleepTime} (sleep)
- Extracurricular activities: ${quizData.extracurriculars || 'None mentioned'}

Generate an optimal weekly schedule that helps them achieve their study goals while respecting their constraints and energy levels.`;

    console.log("Calling Lovable AI for schedule generation...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required, please add funds to your workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    console.log("AI response:", content);

    // Parse the JSON from the response
    let parsedSchedule;
    try {
      // Try to extract JSON from the response (it might be wrapped in markdown)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedSchedule = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      // Return a fallback schedule
      parsedSchedule = {
        schedule: [],
        tips: ["Start with your most challenging subject when your energy is highest", 
               "Take regular breaks every 25-30 minutes", 
               "Review your notes within 24 hours of learning new material"]
      };
    }

    return new Response(JSON.stringify(parsedSchedule), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in generate-schedule:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
