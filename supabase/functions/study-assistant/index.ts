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
    const { messages, images } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `You are a patient and encouraging study tutor. Your role is to teach students how to complete their assignments, not just give them answers.

When analyzing an assignment:
1. Identify what the assignment is asking
2. Break down the problem or task into manageable steps
3. Explain the relevant concepts and principles
4. Guide the student through the solution process with clear explanations
5. Provide tips and strategies for similar problems
6. Encourage critical thinking with helpful questions
7. Point out common mistakes to avoid

If given a topic without an image:
1. Provide a clear, concise explanation
2. Share key concepts and important points
3. Offer practical study tips
4. Include helpful examples or analogies
5. Highlight common pitfalls

Always be supportive, clear, and educational. Focus on teaching understanding, not just providing answers.`;

    // Build conversation messages for API
    const apiMessages: any[] = [{ role: "system", content: systemPrompt }];
    
    // Add conversation history
    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      
      if (msg.role === "user") {
        // If this is the last user message and we have images, add them
        if (i === messages.length - 1 && images && images.length > 0) {
          const contentParts: any[] = [];
          
          if (msg.content) {
            contentParts.push({
              type: "text",
              text: msg.content
            });
          }
          
          images.forEach((image: string) => {
            contentParts.push({
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${image}`
              }
            });
          });
          
          apiMessages.push({
            role: "user",
            content: contentParts
          });
        } else {
          apiMessages.push({
            role: "user",
            content: msg.content
          });
        }
      } else {
        apiMessages.push({
          role: "assistant",
          content: msg.content
        });
      }
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: apiMessages,
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
    const explanation = data.choices[0].message.content;

    return new Response(JSON.stringify({ explanation }), {
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
