import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Classical music keywords for filtering
const CLASSICAL_KEYWORDS = [
  'classical', 'symphony', 'orchestra', 'opera', 'chamber', 'piano', 'violin', 
  'cello', 'quartet', 'philharmonic', 'concerto', 'sonata', 'bach', 'mozart', 
  'beethoven', 'chopin', 'brahms', 'tchaikovsky', 'vivaldi', 'handel', 'debussy',
  'rachmaninoff', 'liszt', 'schubert', 'schumann', 'mendelssohn', 'mahler',
  'strings', 'brass', 'woodwinds', 'conductor', 'recital', 'ensemble'
]

function isClassicalMusic(eventTitle: string, eventDescription: string = ''): boolean {
  const title = eventTitle.toLowerCase()
  const description = eventDescription.toLowerCase()
  
  return CLASSICAL_KEYWORDS.some(keyword => 
    title.includes(keyword) || description.includes(keyword)
  )
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Starting Eventbrite sync...')
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Get Eventbrite API key
    const eventbriteApiKey = Deno.env.get('EVENTBRITE_API_KEY')
    if (!eventbriteApiKey) {
      console.error('EVENTBRITE_API_KEY not configured')
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Eventbrite API key not configured',
          syncedCount: 0
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      )
    }
    
    // Parse request body for options
    const body = await req.json().catch(() => ({}))
    const { location, dateFrom, dateTo, limit = 50 } = body
    
    console.log('Sync options:', { location, dateFrom, dateTo, limit })
    
    // Build Eventbrite API URL
    const baseUrl = 'https://www.eventbriteapi.com/v3/events/search/'
    const params = new URLSearchParams({
      'expand': 'venue,category,organizer,ticket_availability',
      'sort_by': 'date',
      'categories': '103', // Music category
    })
    
    if (location) {
      params.append('location.address', location)
      params.append('location.within', '50km')
    }
    
    if (dateFrom) {
      params.append('start_date.range_start', `${dateFrom}T00:00:00`)
    }
    
    if (dateTo) {
      params.append('start_date.range_end', `${dateTo}T23:59:59`)
    }
    
    console.log('Fetching from Eventbrite API...')
    
    // Fetch events from Eventbrite
    const response = await fetch(`${baseUrl}?${params}`, {
      headers: {
        'Authorization': `Bearer ${eventbriteApiKey}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      console.error(`Eventbrite API error: ${response.status} ${response.statusText}`, errorText)
      
      return new Response(
        JSON.stringify({
          success: false,
          message: `Eventbrite API error: ${response.status} ${response.statusText}`,
          syncedCount: 0
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        }
      )
    }
    
    const data = await response.json()
    console.log(`Fetched ${data.events?.length || 0} events from Eventbrite`)
    
    if (!data.events || data.events.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No events found on Eventbrite',
          syncedCount: 0
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      )
    }
    
    // Filter for classical music events
    const classicalEvents = data.events.filter((event: any) => 
      isClassicalMusic(
        event.name?.text || '', 
        event.description?.text || ''
      )
    )
    
    console.log(`Found ${classicalEvents.length} classical events out of ${data.events.length} total`)
    
    let syncedCount = 0
    const errors: string[] = []
    
    // Process each classical event
    for (const event of classicalEvents.slice(0, limit)) {
      try {
        // Parse date and time
        const startDateTime = new Date(event.start?.local || event.start?.utc)
        const concert_date = startDateTime.toISOString().split('T')[0]
        const start_time = startDateTime.toTimeString().split(' ')[0]
        
        // Build location string
        let location = 'TBA'
        if (event.venue?.address) {
          const addr = event.venue.address
          location = [addr.city, addr.region, addr.country]
            .filter(Boolean)
            .join(', ')
        }
        
        // Build price range
        let priceRange = null
        if (event.ticket_availability?.minimum_ticket_price || event.ticket_availability?.maximum_ticket_price) {
          const min = event.ticket_availability.minimum_ticket_price
          const max = event.ticket_availability.maximum_ticket_price
          if (min && max && min.value !== max.value) {
            priceRange = `${min.currency} ${min.value} - ${max.currency} ${max.value}`
          } else if (min) {
            priceRange = `${min.currency} ${min.value}`
          }
        }
        
        // Prepare concert data
        const concertData = {
          external_event_id: event.id,
          source: 'eventbrite',
          title: event.name?.text || 'Untitled Event',
          concert_date,
          start_time,
          venue: event.venue?.name || 'TBA',
          location,
          ticket_url: event.url,
          price_range: priceRange,
          program: event.description?.text || null,
          orchestra: event.organizer?.name || null,
          tags: CLASSICAL_KEYWORDS.filter(keyword => 
            (event.name?.text || '').toLowerCase().includes(keyword)
          ).slice(0, 5) // Limit to 5 tags
        }
        
        // Check if event already exists
        const { data: existing } = await supabase
          .from('concerts')
          .select('id')
          .eq('external_event_id', event.id)
          .eq('source', 'eventbrite')
          .single()
        
        if (existing) {
          // Update existing event
          const { error } = await supabase
            .from('concerts')
            .update(concertData)
            .eq('id', existing.id)
            
          if (error) {
            console.error('Error updating concert:', error)
            errors.push(`Failed to update event ${event.id}: ${error.message}`)
          } else {
            syncedCount++
          }
        } else {
          // Insert new event
          const { error } = await supabase
            .from('concerts')
            .insert(concertData)
            
          if (error) {
            console.error('Error inserting concert:', error)
            errors.push(`Failed to insert event ${event.id}: ${error.message}`)
          } else {
            syncedCount++
          }
        }
      } catch (eventError) {
        console.error(`Error processing event ${event.id}:`, eventError)
        errors.push(`Failed to process event ${event.id}: ${eventError.message}`)
      }
    }
    
    const result = {
      success: true,
      message: `Successfully synced ${syncedCount} classical music events from Eventbrite`,
      syncedCount,
      totalFound: data.events.length,
      classicalFound: classicalEvents.length,
      errors: errors.length > 0 ? errors.slice(0, 5) : undefined // Limit error messages
    }
    
    console.log('Sync completed:', result)
    
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    })
    
  } catch (error) {
    console.error('Eventbrite sync error:', error)
    
    const errorResult = {
      success: false,
      message: `Sync failed: ${error.message}`,
      syncedCount: 0
    }
    
    return new Response(JSON.stringify(errorResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    })
  }
})