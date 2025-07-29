import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BachtrackEvent {
  id: string;
  name: string;
  venue: {
    name: string;
    location: string;
  };
  date: string;
  time?: string;
  performers?: {
    orchestra?: string;
    conductor?: string;
    soloists?: string[];
  };
  programme?: string;
  ticketUrl?: string;
  priceRange?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { location, dateFrom, dateTo, limit = 50 } = await req.json();
    
    console.log('Syncing concerts from Bachtrack API', { location, dateFrom, dateTo, limit });

    const bachtrackApiKey = Deno.env.get('BACHTRACK_API_KEY');
    if (!bachtrackApiKey) {
      throw new Error('Bachtrack API key not configured');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch events from Bachtrack API
    const bachtrackUrl = new URL('https://api.bachtrack.com/events');
    if (location) bachtrackUrl.searchParams.set('location', location);
    if (dateFrom) bachtrackUrl.searchParams.set('dateFrom', dateFrom);
    if (dateTo) bachtrackUrl.searchParams.set('dateTo', dateTo);
    bachtrackUrl.searchParams.set('limit', limit.toString());
    bachtrackUrl.searchParams.set('format', 'json');

    console.log('Fetching from Bachtrack:', bachtrackUrl.toString());

    const bachtrackResponse = await fetch(bachtrackUrl.toString(), {
      headers: {
        'Authorization': `Bearer ${bachtrackApiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!bachtrackResponse.ok) {
      throw new Error(`Bachtrack API error: ${bachtrackResponse.status} ${bachtrackResponse.statusText}`);
    }

    const bachtrackData = await bachtrackResponse.json();
    const events = bachtrackData.events || [];

    console.log(`Found ${events.length} events from Bachtrack`);

    // Transform and upsert events to our database
    const concertsToUpsert = events.map((event: BachtrackEvent) => ({
      title: event.name,
      venue: event.venue.name,
      location: event.venue.location,
      concert_date: event.date,
      start_time: event.time || null,
      orchestra: event.performers?.orchestra || null,
      conductor: event.performers?.conductor || null,
      soloists: event.performers?.soloists?.join(', ') || null,
      program: event.programme || null,
      ticket_url: event.ticketUrl || null,
      price_range: event.priceRange || null,
      source: 'bachtrack',
      external_event_id: `bachtrack_${event.id}`,
      tags: ['Classical', 'Live Performance'], // Default tags, will be enhanced by AI
    }));

    // Upsert concerts (insert new or update existing based on external_event_id)
    const { data: upsertedConcerts, error: upsertError } = await supabase
      .from('concerts')
      .upsert(concertsToUpsert, { 
        onConflict: 'external_event_id',
        ignoreDuplicates: false 
      })
      .select('id');

    if (upsertError) {
      console.error('Error upserting concerts:', upsertError);
      throw upsertError;
    }

    console.log(`Successfully synced ${upsertedConcerts?.length || 0} concerts`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully synced ${upsertedConcerts?.length || 0} concerts from Bachtrack`,
        syncedCount: upsertedConcerts?.length || 0,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in bachtrack-sync function:', error);
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