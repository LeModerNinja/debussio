import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { concertId, concertData } = await req.json();
    
    console.log('Generating AI tags for concert:', concertId);

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // If concertData not provided, fetch it from database
    let concert = concertData;
    if (!concert && concertId) {
      const { data, error } = await supabase
        .from('concerts')
        .select('*')
        .eq('id', concertId)
        .single();
      
      if (error) throw error;
      concert = data;
    }

    if (!concert) {
      throw new Error('Concert data not found');
    }

    // Create a detailed prompt for tag generation
    const prompt = `Analyze this classical music concert and generate relevant tags. Focus on:
- Musical periods and styles
- Instrumental forces
- Notable features
- Audience appeal
- Performance characteristics

Concert Details:
Title: ${concert.title || 'Unknown'}
Orchestra: ${concert.orchestra || 'Unknown'}
Conductor: ${concert.conductor || 'Unknown'}
Soloists: ${concert.soloists || 'None'}
Program: ${concert.program || 'Unknown'}
Venue: ${concert.venue || 'Unknown'}

Generate 5-8 specific, relevant tags that would help users discover this concert. Return only a JSON array of strings, no other text.
Examples: ["Symphony", "Romantic Period", "Piano Concerto", "Beethoven", "Family Friendly", "Debut Performance", "World Premiere"]`;

    console.log('Calling OpenAI API for tag generation');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a classical music expert who generates precise, helpful tags for concerts. Always respond with valid JSON array format.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;

    console.log('Generated content:', generatedContent);

    // Parse the generated tags
    let generatedTags: string[];
    try {
      generatedTags = JSON.parse(generatedContent);
    } catch (parseError) {
      console.error('Failed to parse generated tags, using fallback');
      // Fallback tags based on concert type
      generatedTags = ['Classical', 'Live Performance'];
      
      // Add some basic tags based on available data
      if (concert.orchestra?.toLowerCase().includes('symphony')) {
        generatedTags.push('Symphony Orchestra');
      }
      if (concert.program?.toLowerCase().includes('concerto')) {
        generatedTags.push('Concerto');
      }
      if (concert.program?.toLowerCase().includes('symphony')) {
        generatedTags.push('Symphony');
      }
    }

    // Ensure we have valid tags and limit to reasonable number
    const finalTags = Array.isArray(generatedTags) 
      ? generatedTags.slice(0, 8).filter(tag => typeof tag === 'string' && tag.length > 0)
      : ['Classical', 'Live Performance'];

    console.log('Final generated tags:', finalTags);

    // Update the concert with generated tags if concertId provided
    if (concertId) {
      const { error: updateError } = await supabase
        .from('concerts')
        .update({ tags: finalTags })
        .eq('id', concertId);

      if (updateError) {
        console.error('Error updating concert tags:', updateError);
        throw updateError;
      }

      console.log('Successfully updated concert tags in database');
    }

    return new Response(
      JSON.stringify({
        success: true,
        tags: finalTags,
        concertId: concertId || null,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in generate-concert-tags function:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});