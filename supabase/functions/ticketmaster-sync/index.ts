import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// TicketMaster API event interface
interface TicketMasterEvent {
  id: string;
  name: string;
  dates: {
    start: {
      localDate: string;
      localTime?: string;
    };
  };
  _embedded?: {
    venues?: Array<{
      name: string;
      city: {
        name: string;
      };
      state?: {
        name: string;
      };
      country: {
        name: string;
      };
    }>;
    attractions?: Array<{
      name: string;
    }>;
  };
  url: string;
  info?: string;
  priceRanges?: Array<{
    min: number;
    max: number;
    currency: string;
  }>;
  classifications?: Array<{
    segment?: {
      name: string;
    };
    genre?: {
      name: string;
    };
    subGenre?: {
      name: string;
    };
  }>;
}

interface TicketMasterResponse {
  _embedded?: {
    events: TicketMasterEvent[];
  };
  page: {
    totalElements: number;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { location, dateFrom, dateTo, limit = 100 } = await req.json();
    
    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const ticketMasterApiKey = Deno.env.get('TICKETMASTER_API_KEY');
    
    if (!ticketMasterApiKey) {
      throw new Error('TICKETMASTER_API_KEY environment variable is required');
    }

    console.log('Syncing from TicketMaster with params:', { location, dateFrom, dateTo, limit });

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Build TicketMaster API URL
    const baseUrl = 'https://app.ticketmaster.com/discovery/v2/events.json';
    const params = new URLSearchParams({
      apikey: ticketMasterApiKey,
      size: limit.toString(),
      // Search for classical music and orchestral events
      classificationName: 'Music',
      keyword: 'classical OR orchestra OR symphony OR opera OR chamber OR philharmonic',
      sort: 'date,asc'
    });

    // Add location filter if provided
    if (location) {
      params.append('city', location);
    }

    // Add date filters if provided
    if (dateFrom) {
      params.append('startDateTime', `${dateFrom}T00:00:00Z`);
    }
    if (dateTo) {
      params.append('endDateTime', `${dateTo}T23:59:59Z`);
    }

    const url = `${baseUrl}?${params.toString()}`;
    console.log('Fetching from TicketMaster:', url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error('Failed to fetch from TicketMaster:', response.status, response.statusText);
      const errorText = await response.text();
      throw new Error(`TicketMaster API error: ${response.status} - ${errorText}`);
    }
    
    const data: TicketMasterResponse = await response.json();
    const events = data._embedded?.events || [];

    console.log(`Found ${events.length} events from TicketMaster`);

    // Transform TicketMaster events to our concert format
    const transformedEvents = events.map((event: TicketMasterEvent) => {
      const venue = event._embedded?.venues?.[0];
      const attraction = event._embedded?.attractions?.[0];
      const priceRange = event.priceRanges?.[0];
      const classification = event.classifications?.[0];
      
      // Build location string
      let location = '';
      if (venue) {
        location = venue.city.name;
        if (venue.state?.name) {
          location += `, ${venue.state.name}`;
        }
        location += `, ${venue.country.name}`;
      }

      // Build tags based on classification
      const tags = ['concert', 'live-music'];
      if (classification?.genre?.name) {
        tags.push(classification.genre.name.toLowerCase().replace(/\s+/g, '-'));
      }
      if (classification?.subGenre?.name) {
        tags.push(classification.subGenre.name.toLowerCase().replace(/\s+/g, '-'));
      }

      return {
        title: event.name,
        venue: venue?.name || 'TBA',
        location: location || 'TBA',
        concert_date: event.dates.start.localDate,
        start_time: event.dates.start.localTime || null,
        orchestra: attraction?.name || null,
        program: event.info || '',
        ticket_url: event.url,
        price_range: priceRange ? `${priceRange.currency} ${priceRange.min}-${priceRange.max}` : null,
        source: 'ticketmaster',
        external_event_id: `ticketmaster_${event.id}`,
        tags: tags
      };
    });

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
        message: `Successfully synced ${transformedEvents.length} concerts from TicketMaster`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in ticketmaster-sync function:', error);
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