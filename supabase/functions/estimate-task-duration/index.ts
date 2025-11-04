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
    const { title, description, priority, subject } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `You are a study planning assistant. Given a task, estimate how long it would take to complete in hours. 
Consider the complexity, priority, and typical time requirements for academic tasks. 
Return ONLY a JSON object with the duration in hours (as a number).`;

    const userPrompt = `Task: ${title}
${description ? `Description: ${description}` : ''}
Priority: ${priority}
${subject ? `Subject: ${subject}` : ''}

Estimate the duration in hours needed to complete this task.`;

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
        tools: [{
          type: "function",
          function: {
            name: "estimate_duration",
            description: "Return the estimated duration in hours",
            parameters: {
              type: "object",
              properties: {
                hours: { 
                  type: "number",
                  description: "Estimated hours to complete the task"
                }
              },
              required: ["hours"],
              additionalProperties: false
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "estimate_duration" } }
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
      console.error("AI gateway error:", response.status, await response.text());
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    console.log("AI response:", JSON.stringify(data));
    
    const toolCall = data.choices[0].message.tool_calls?.[0];
    if (toolCall && toolCall.function.arguments) {
      const args = JSON.parse(toolCall.function.arguments);
      const hours = args.hours || 1; // Default to 1 hour if not provided
      
      return new Response(JSON.stringify({ hours: Math.max(0.5, Math.min(8, hours)) }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fallback to reasonable defaults based on priority
    const fallbackHours = priority === 'high' ? 3 : priority === 'medium' ? 2 : 1;
    return new Response(JSON.stringify({ hours: fallbackHours }), {
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
