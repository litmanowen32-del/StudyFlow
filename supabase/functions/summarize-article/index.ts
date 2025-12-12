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
    const { articleText, action = 'summarize' } = await req.json();
    
    if (!articleText || articleText.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Article text is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log(`Action: ${action}, Article length: ${articleText.length}`);

    let systemPrompt = '';
    
    if (action === 'quotes') {
      systemPrompt = `You are an expert at finding powerful, meaningful quotes from articles. Your task is to:
1. Extract 3-5 of the most impactful, memorable, or insightful direct quotes from the text
2. Only extract actual quotes that appear verbatim in the text
3. Choose quotes that capture key insights, powerful statements, or memorable phrases
4. If no direct quotes exist, extract the most quotable sentences

Format your response as a JSON array of objects with "quote" and "context" fields:
[
  {"quote": "The exact quote text", "context": "Brief context about what this quote relates to"},
  ...
]

Return ONLY the JSON array, no other text.`;
    } else {
      systemPrompt = `You are an expert article summarizer. Your task is to:
1. Provide a clear, concise summary of the main points
2. Highlight key takeaways
3. Keep the summary to 3-5 bullet points for quick reading
4. Preserve the essential meaning without losing important details
5. Use simple, clear language

Format your response as:
**Summary:**
[A brief 2-3 sentence overview]

**Key Points:**
• [Point 1]
• [Point 2]
• [Point 3]
...

**Takeaway:**
[One sentence main takeaway]`;
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
          { role: 'system', content: systemPrompt },
          { role: 'user', content: action === 'quotes' 
            ? `Find the most impactful quotes from this article:\n\n${articleText}`
            : `Please summarize this article:\n\n${articleText}` 
          }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add more credits.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error('Failed to generate response');
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No response generated');
    }

    console.log(`${action} generated successfully`);

    if (action === 'quotes') {
      try {
        const quotes = JSON.parse(content);
        return new Response(
          JSON.stringify({ quotes }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch {
        // If JSON parsing fails, return raw content
        return new Response(
          JSON.stringify({ quotes: [{ quote: content, context: '' }] }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    return new Response(
      JSON.stringify({ summary: content }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in summarize-article function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});