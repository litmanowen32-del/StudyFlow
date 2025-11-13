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

    const { topic, count = 10 } = await req.json();

    if (!topic) {
      throw new Error("Topic is required");
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log(`Generating ${count} flashcards for topic: ${topic}`);

    // Call Lovable AI to generate flashcards
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are a helpful study assistant that creates educational flashcards. Generate clear, concise flashcards that help students learn effectively. Each flashcard should have a question/term on the front and a complete answer/definition on the back.`
          },
          {
            role: "user",
            content: `Create ${count} flashcards about: ${topic}. Make them educational and cover key concepts.`
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "create_flashcards",
              description: "Generate educational flashcards for a given topic",
              parameters: {
                type: "object",
                properties: {
                  flashcards: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        front: {
                          type: "string",
                          description: "The question, term, or prompt on the front of the flashcard"
                        },
                        back: {
                          type: "string",
                          description: "The answer, definition, or explanation on the back of the flashcard"
                        }
                      },
                      required: ["front", "back"],
                      additionalProperties: false
                    }
                  }
                },
                required: ["flashcards"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "create_flashcards" } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        throw new Error("Rate limit exceeded. Please try again later.");
      }
      if (response.status === 402) {
        throw new Error("AI credits exhausted. Please add credits to your workspace.");
      }
      throw new Error("Failed to generate flashcards");
    }

    const data = await response.json();
    console.log("AI Response:", JSON.stringify(data, null, 2));

    // Extract flashcards from tool call
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error("No flashcards generated");
    }

    const flashcardsData = JSON.parse(toolCall.function.arguments);
    const flashcards = flashcardsData.flashcards;

    if (!flashcards || flashcards.length === 0) {
      throw new Error("No flashcards generated");
    }

    return new Response(
      JSON.stringify({
        success: true,
        flashcards: flashcards,
        count: flashcards.length
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        success: false 
      }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
