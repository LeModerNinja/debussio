import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Bandsintown API event interface
interface BandsinTownEvent {
  id: string;
  title: string;
  datetime: string;
  venue: {
    name: string;
    city: string;
    region: string;
    country: string;
  };
  artist: {
    name: string;
  };
  url: string;
  description?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { location, dateFrom, dateTo, artists, limit = 50 } = await req.json();
    
    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const bandsinTownAppId = Deno.env.get('BANDSINTOWN_APP_ID');
    
    if (!bandsinTownAppId) {
      throw new Error('BANDSINTOWN_APP_ID environment variable is required');
    }

    console.log('Syncing from Bandsintown with params:', { location, dateFrom, dateTo, artists, limit });

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    let allEvents: any[] = [];
    
    // If specific artists are provided, search for each artist
    if (artists && artists.length > 0) {
      for (const artist of artists) {
        try {
          const url = `https://rest.bandsintown.com/artists/${encodeURIComponent(artist)}/events?app_id=${bandsinTownAppId}`;
          console.log('Fetching from Bandsintown:', url);
          
          const response = await fetch(url);
          
          if (!response.ok) {
            console.error(`Failed to fetch events for artist ${artist}:`, response.status, response.statusText);
            continue;
          }
          
          const events = await response.json();
          
          // Filter events by location and date if specified
          const filteredEvents = events.filter((event: BandsinTownEvent) => {
            if (location && !event.venue.city.toLowerCase().includes(location.toLowerCase()) && 
                !event.venue.region.toLowerCase().includes(location.toLowerCase())) {
              return false;
            }
            
            if (dateFrom && new Date(event.datetime) < new Date(dateFrom)) {
              return false;
            }
            
            if (dateTo && new Date(event.datetime) > new Date(dateTo)) {
              return false;
            }
            
            return true;
          });
          
          allEvents.push(...filteredEvents);
        } catch (error) {
          console.error(`Error fetching events for artist ${artist}:`, error);
        }
      }
    } else {
      console.log('No specific artists provided - Bandsintown API requires artist names for event search');
    }

    console.log(`Found ${allEvents.length} events from Bandsintown`);

    // Transform Bandsintown events to our concert format
    const transformedEvents = allEvents.map((event: BandsinTownEvent) => ({
      title: event.title || `${event.artist.name} Concert`,
      venue: event.venue.name,
      location: `${event.venue.city}, ${event.venue.region}, ${event.venue.country}`,
      concert_date: new Date(event.datetime).toISOString().split('T')[0],
      start_time: new Date(event.datetime).toTimeString().split(' ')[0],
      orchestra: event.artist.name,
      program: event.description || '',
      ticket_url: event.url,
      source: 'bandsintown',
      external_event_id: `bandsintown_${event.id}`,
      tags: ['concert', 'live-music']
    }));

    // Upsert events into Supabase
    if (transformedEvents.length > 0) {
      const { error } = await supabase
        .from('concerts')
        .upsert(transformedEvents, {
          onConflict: 'external_event_id'
        });

      if (error) {
        console.error('Error inserting events:', error);
        throw error;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        syncedCount: transformedEvents.length,
        message: `Successfully synced ${transformedEvents.length} concerts from Bandsintown`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in bandsintown-sync function:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});