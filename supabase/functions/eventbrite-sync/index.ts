import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Eventbrite API event interface
interface EventbriteEvent {
  id: string;
  name: {
    text: string;
  };
  start: {
    local: string;
    timezone: string;
  };
  end: {
    local: string;
    timezone: string;
  };
  venue?: {
    name: string;
    address: {
      city: string;
      region: string;
      country: string;
      localized_address_display: string;
    };
  };
  url: string;
  description?: {
    text: string;
  };
  ticket_availability?: {
    minimum_ticket_price?: {
      display: string;
    };
    maximum_ticket_price?: {
      display: string;
    };
  };
  category?: {
    name: string;
  };
  subcategory?: {
    name: string;
  };
  organizer?: {
    name: string;
  };
}

interface EventbriteResponse {
  events: EventbriteEvent[];
  pagination: {
    object_count: number;
    page_number: number;
    page_size: number;
    page_count: number;
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
    const eventbriteToken = Deno.env.get('EVENTBRITE_TOKEN');
    
    if (!eventbriteToken) {
      throw new Error('EVENTBRITE_TOKEN environment variable is required');
    }

    console.log('Syncing from Eventbrite with params:', { location, dateFrom, dateTo, limit });

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Build Eventbrite API URL
    const baseUrl = 'https://www.eventbriteapi.com/v3/events/search/';
    const params = new URLSearchParams({
      'q': 'classical OR orchestra OR symphony OR opera OR chamber OR philharmonic OR concert OR recital OR piano OR violin OR cello OR baroque OR choir',
      'categories': '103', // Music category
      'sort_by': 'date',
      'expand': 'venue,ticket_availability,category,subcategory,organizer',
      'page_size': Math.min(limit, 50).toString() // Eventbrite max is 50 per page
    });

    // Add location filter if provided
    if (location) {
      params.append('location.address', location);
      params.append('location.within', '50km');
    }

    // Add date filters if provided
    if (dateFrom) {
      params.append('start_date.range_start', `${dateFrom}T00:00:00`);
    }
    if (dateTo) {
      params.append('start_date.range_end', `${dateTo}T23:59:59`);
    }

    const url = `${baseUrl}?${params.toString()}`;
    console.log('Fetching from Eventbrite:', url);
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${eventbriteToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.error('Failed to fetch from Eventbrite:', response.status, response.statusText);
      const errorText = await response.text();
      throw new Error(`Eventbrite API error: ${response.status} - ${errorText}`);
    }
    
    const data: EventbriteResponse = await response.json();
    const events = data.events || [];

    console.log(`Found ${events.length} events from Eventbrite`);

    // Transform Eventbrite events to our concert format
    const transformedEvents = events.map((event: EventbriteEvent) => {
      const venue = event.venue;
      const startDate = new Date(event.start.local);
      const minPrice = event.ticket_availability?.minimum_ticket_price?.display;
      const maxPrice = event.ticket_availability?.maximum_ticket_price?.display;
      
      // Build location string
      let location = '';
      if (venue?.address) {
        location = `${venue.address.city}, ${venue.address.region}, ${venue.address.country}`;
      }

      // Build price range
      let priceRange = null;
      if (minPrice && maxPrice) {
        priceRange = `${minPrice} - ${maxPrice}`;
      } else if (minPrice) {
        priceRange = `From ${minPrice}`;
      }

      // Build tags based on category and content
      const tags = ['concert', 'live-music'];
      if (event.category?.name) {
        tags.push(event.category.name.toLowerCase().replace(/\s+/g, '-'));
      }
      if (event.subcategory?.name) {
        tags.push(event.subcategory.name.toLowerCase().replace(/\s+/g, '-'));
      }

      // Extract time from start date
      const startTime = startDate.toTimeString().split(' ')[0];

      return {
        title: event.name.text,
        venue: venue?.name || 'TBA',
        location: location || 'TBA',
        concert_date: startDate.toISOString().split('T')[0],
        start_time: startTime,
        orchestra: event.organizer?.name || null,
        program: event.description?.text || '',
        ticket_url: event.url,
        price_range: priceRange,
        source: 'eventbrite',
        external_event_id: `eventbrite_${event.id}`,
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
        message: `Successfully synced ${transformedEvents.length} concerts from Eventbrite`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in eventbrite-sync function:', error);
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