import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EventbriteEvent {
  id: string
  name: {
    text: string
  }
  start: {
    local: string
    timezone: string
  }
  end: {
    local: string
    timezone: string
  }
  venue?: {
    name?: string
    address?: {
      city?: string
      region?: string
      country?: string
      address_1?: string
    }
  }
  url: string
  description?: {
    text?: string
  }
  ticket_availability?: {
    has_available_tickets?: boolean
    minimum_ticket_price?: {
      currency: string
      value: number
    }
    maximum_ticket_price?: {
      currency: string
      value: number
    }
  }
  category?: {
    name?: string
  }
  organizer?: {
    name?: string
  }
}

interface EventbriteResponse {
  events: EventbriteEvent[]
  pagination: {
    page_number: number
    page_count: number
    object_count: number
  }
}

// Classical music keywords for filtering
const CLASSICAL_KEYWORDS = [
  'classical', 'symphony', 'orchestra', 'opera', 'chamber', 'piano', 'violin', 
  'cello', 'quartet', 'philharmonic', 'concerto', 'sonata', 'bach', 'mozart', 
  'beethoven', 'chopin', 'brahms', 'tchaikovsky', 'vivaldi', 'handel', 'debussy',
  'rachmaninoff', 'liszt', 'schubert', 'schumann', 'mendelssohn', 'mahler',
  'strings', 'brass', 'woodwinds', 'conductor', 'recital', 'ensemble'
]

function isClassicalMusic(event: EventbriteEvent): boolean {
  const title = event.name.text.toLowerCase()
  const description = event.description?.text?.toLowerCase() || ''
  const category = event.category?.name?.toLowerCase() || ''
  
  return CLASSICAL_KEYWORDS.some(keyword => 
    title.includes(keyword) || description.includes(keyword) || category.includes(keyword)
  )
}

function formatPriceRange(event: EventbriteEvent): string | null {
  const ticketInfo = event.ticket_availability
  if (!ticketInfo?.minimum_ticket_price && !ticketInfo?.maximum_ticket_price) {
    return null
  }
  
  const min = ticketInfo.minimum_ticket_price
  const max = ticketInfo.maximum_ticket_price
  
  if (min && max && min.value !== max.value) {
    return `${min.currency} ${min.value} - ${max.currency} ${max.value}`
  } else if (min) {
    return `${min.currency} ${min.value}`
  } else if (max) {
    return `${max.currency} ${max.value}`
  }
  
  return null
}

function extractTags(event: EventbriteEvent): string[] {
  const tags: string[] = []
  const title = event.name.text.toLowerCase()
  const description = event.description?.text?.toLowerCase() || ''
  
  // Add relevant tags based on content
  CLASSICAL_KEYWORDS.forEach(keyword => {
    if (title.includes(keyword) || description.includes(keyword)) {
      tags.push(keyword)
    }
  })
  
  if (event.category?.name) {
    tags.push(event.category.name)
  }
  
  return [...new Set(tags)] // Remove duplicates
}

async function fetchEventbriteEvents(
  apiKey: string,
  location?: string,
  dateFrom?: string,
  dateTo?: string,
  page: number = 1
): Promise<EventbriteResponse> {
  const baseUrl = 'https://www.eventbriteapi.com/v3/events/search/'
  const params = new URLSearchParams({
    'expand': 'venue,category,organizer,ticket_availability',
    'page': page.toString(),
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
  
  const response = await fetch(`${baseUrl}?${params}`, {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    }
  })
  
  if (!response.ok) {
    throw new Error(`Eventbrite API error: ${response.status} ${response.statusText}`)
  }
  
  return await response.json()
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
      throw new Error('EVENTBRITE_API_KEY not configured')
    }
    
    // Parse request body for options
    const body = await req.json().catch(() => ({}))
    const { location, dateFrom, dateTo, limit = 50 } = body
    
    console.log('Sync options:', { location, dateFrom, dateTo, limit })
    
    let allEvents: EventbriteEvent[] = []
    let page = 1
    let totalProcessed = 0
    
    // Fetch events from Eventbrite (paginated)
    while (allEvents.length < limit) {
      console.log(`Fetching page ${page}...`)
      
      const response = await fetchEventbriteEvents(
        eventbriteApiKey,
        location,
        dateFrom,
        dateTo,
        page
      )
      
      if (!response.events || response.events.length === 0) {
        console.log('No more events found')
        break
      }
      
      // Filter for classical music events
      const classicalEvents = response.events.filter(isClassicalMusic)
      console.log(`Found ${classicalEvents.length} classical events out of ${response.events.length} total events on page ${page}`)
      
      allEvents.push(...classicalEvents)
      totalProcessed += response.events.length
      
      // Check if we've reached the end or our limit
      if (page >= response.pagination.page_count || allEvents.length >= limit) {
        break
      }
      
      page++
    }
    
    // Limit the results
    allEvents = allEvents.slice(0, limit)
    console.log(`Processing ${allEvents.length} classical music events...`)
    
    let syncedCount = 0
    const errors: string[] = []
    
    // Insert events into database
    for (const event of allEvents) {
      try {
        // Parse date and time
        const startDateTime = new Date(event.start.local)
        const concert_date = startDateTime.toISOString().split('T')[0]
        const start_time = startDateTime.toTimeString().split(' ')[0]
        
        // Prepare concert data
        const concertData = {
          external_event_id: event.id,
          source: 'eventbrite',
          title: event.name.text,
          concert_date,
          start_time,
          venue: event.venue?.name || 'TBA',
          location: event.venue?.address ? 
            `${event.venue.address.city || ''}, ${event.venue.address.region || ''}, ${event.venue.address.country || ''}`.replace(/^,\s*|,\s*$/g, '') : 
            'TBA',
          ticket_url: event.url,
          price_range: formatPriceRange(event),
          program: event.description?.text || null,
          orchestra: event.organizer?.name || null,
          tags: extractTags(event)
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
            console.log(`Updated concert: ${event.name.text}`)
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
            console.log(`Inserted new concert: ${event.name.text}`)
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
      totalFound: totalProcessed,
      classicalFound: allEvents.length,
      errors: errors.length > 0 ? errors : undefined
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
      message: error.message || 'Failed to sync Eventbrite events',
      syncedCount: 0,
      error: error.toString()
    }
    
    return new Response(JSON.stringify(errorResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    })
  }
})