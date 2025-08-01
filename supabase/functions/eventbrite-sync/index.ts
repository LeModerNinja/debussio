const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { location, dateFrom, dateTo, limit = 100, keywords } = await req.json();
    
    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const eventbriteToken = Deno.env.get('EVENTBRITE_TOKEN');
    
    if (!eventbriteToken) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'EVENTBRITE_TOKEN environment variable is required. Please configure it in your Supabase Edge Functions settings.'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('Syncing from Eventbrite with params:', { location, dateFrom, dateTo, limit });

    // Initialize Supabase client
    const { createClient } = await import('npm:@supabase/supabase-js@2');
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Build search keywords
    const searchKeywords = keywords || [
      'classical', 'orchestra', 'symphony', 'opera', 'chamber', 
      'philharmonic', 'concert', 'recital', 'piano', 'violin', 
      'cello', 'baroque', 'choir', 'conservatory', 'quartet'
    ];
    
    // Build Eventbrite API URL
    const baseUrl = 'https://www.eventbriteapi.com/v3/events/search/';
    const params = new URLSearchParams({
      'q': searchKeywords.join(' OR '),
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
      
      // Provide more helpful error messages
      let errorMessage = `Eventbrite API error: ${response.status}`;
      if (response.status === 401) {
        errorMessage = 'Invalid Eventbrite API token. Please check your EVENTBRITE_TOKEN configuration.';
      } else if (response.status === 403) {
        errorMessage = 'Access denied. Please verify your Eventbrite API permissions.';
      } else if (response.status === 429) {
        errorMessage = 'Rate limit exceeded. Please try again later.';
      }
      
      return new Response(
        JSON.stringify({
          success: false,
          error: errorMessage,
          details: errorText
        }),
        {
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    const data = await response.json();
    const events = data.events || [];

    console.log(`Found ${events.length} events from Eventbrite`);

    // Enhanced filtering for classical music relevance
    const classicalKeywords = [
      'classical', 'orchestra', 'symphony', 'philharmonic', 'opera', 
      'chamber', 'quartet', 'trio', 'quintet', 'concerto', 'sonata',
      'baroque', 'romantic', 'contemporary', 'piano', 'violin', 
      'cello', 'viola', 'flute', 'oboe', 'clarinet', 'conductor',
      'conservatory', 'recital', 'masterclass', 'choir', 'choral'
    ];

    const filteredEvents = events.filter((event: any) => {
      const eventText = `${event.name.text} ${event.description?.text || ''}`.toLowerCase();
      return classicalKeywords.some(keyword => eventText.includes(keyword));
    });

    console.log(`Filtered to ${filteredEvents.length} classical music events`);

    // Transform Eventbrite events to our concert format
    const transformedEvents = filteredEvents.map((event: any) => {
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

      // Build tags based on content analysis
      const tags = ['eventbrite', 'classical'];
      const eventText = `${event.name.text} ${event.description?.text || ''}`.toLowerCase();
      
      // Add specific tags based on content
      if (eventText.includes('symphony')) tags.push('symphony');
      if (eventText.includes('opera')) tags.push('opera');
      if (eventText.includes('chamber')) tags.push('chamber-music');
      if (eventText.includes('piano')) tags.push('piano');
      if (eventText.includes('violin')) tags.push('violin');
      if (eventText.includes('orchestra')) tags.push('orchestra');
      if (eventText.includes('recital')) tags.push('recital');
      if (eventText.includes('quartet')) tags.push('quartet');

      // Extract time from start date
      const startTime = startDate.toTimeString().split(' ')[0];

      return {
        title: event.name.text,
        venue: venue?.name || 'TBA',
        location: location || 'TBA',
        concert_date: startDate.toISOString().split('T')[0],
        start_time: startTime,
        orchestra: event.organizer?.name || null,
        program: event.description?.text?.substring(0, 500) || null, // Limit description length
        ticket_url: event.url,
        price_range: priceRange,
        source: 'eventbrite',
        external_event_id: `eventbrite_${event.id}`,
        tags: tags
      };
    });

    // Upsert events into Supabase
    let upsertedCount = 0;
    if (transformedEvents.length > 0) {
      const { data: upsertedEvents, error } = await supabase
        .from('concerts')
        .upsert(transformedEvents, {
          onConflict: 'external_event_id'
        })
        .select('id');

      if (error) {
        console.error('Error inserting events:', error);
        throw error;
      }
      
      upsertedCount = upsertedEvents?.length || 0;
    }

    return new Response(
      JSON.stringify({
        success: true,
        syncedCount: upsertedCount,
        totalFound: events.length,
        filteredCount: filteredEvents.length,
        message: `Successfully synced ${upsertedCount} classical music events from Eventbrite`
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
        error: error.message || 'Unknown error occurred',
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

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