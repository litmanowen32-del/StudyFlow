import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { tasks, existingEvents, startDate, endDate, sleepStart, sleepEnd } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const sleepStartTime = sleepStart || '23:00';
    const sleepEndTime = sleepEnd || '07:00';
    
    const systemPrompt = `You are an AI scheduling assistant. Analyze the user's existing calendar events and pending tasks to suggest optimal time slots.
Consider:
- Task priority and due dates
- Existing calendar commitments
- Time of day for different types of work (complex tasks in morning, lighter tasks in afternoon)
- Break times between tasks
- Realistic task durations
- CRITICAL: User sleeps from ${sleepStartTime} to ${sleepEndTime}. NEVER suggest any times during this sleep period.
- IMPORTANT: Avoid scheduling over existing calendar events, especially school events from 8:20 AM to 3:30 PM on weekdays

Return suggestions as a JSON array with this exact structure:
[
  {
    "task_id": "uuid",
    "suggested_start": "ISO datetime",
    "suggested_end": "ISO datetime",
    "reason": "brief explanation"
  }
]`;

    const userPrompt = `Please suggest optimal time slots for these tasks:
Tasks: ${JSON.stringify(tasks)}
Existing Events: ${JSON.stringify(existingEvents)}
Schedule Period: ${startDate} to ${endDate}

Provide specific time slot suggestions for each task.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "suggest_time_slots",
              description: "Suggest optimal time slots for pending tasks",
              parameters: {
                type: "object",
                properties: {
                  suggestions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        task_id: { type: "string" },
                        suggested_start: { type: "string" },
                        suggested_end: { type: "string" },
                        reason: { type: "string" }
                      },
                      required: ["task_id", "suggested_start", "suggested_end", "reason"],
                      additionalProperties: false
                    }
                  }
                },
                required: ["suggestions"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "suggest_time_slots" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const toolCall = data.choices[0].message.tool_calls?.[0];
    const suggestions = toolCall ? JSON.parse(toolCall.function.arguments).suggestions : [];

    return new Response(JSON.stringify({ suggestions }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
