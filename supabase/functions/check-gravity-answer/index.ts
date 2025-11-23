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
    const { userAnswer, correctAnswer } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { 
            role: 'system', 
            content: 'You are an answer validator. Check if the user answer is semantically similar or a synonym to the correct answer. Respond ONLY with "true" or "false".' 
          },
          { 
            role: 'user', 
            content: `User answer: "${userAnswer}"\nCorrect answer: "${correctAnswer}"\n\nIs the user answer correct or a close synonym?` 
          }
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('AI Gateway error:', error);
      throw new Error('AI validation failed');
    }

    const data = await response.json();
    const result = data.choices[0].message.content.toLowerCase().trim();
    const isCorrect = result === 'true';

    return new Response(
      JSON.stringify({ isCorrect }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
