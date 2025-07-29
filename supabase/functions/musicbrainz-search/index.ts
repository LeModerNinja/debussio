import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { query, type = 'work' } = await req.json()
    
    if (!query) {
      return new Response(
        JSON.stringify({ error: 'Query parameter is required' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    console.log(`Searching MusicBrainz for: ${query} (type: ${type})`)

    // MusicBrainz API search
    const searchUrl = `https://musicbrainz.org/ws/2/${type}/?query=${encodeURIComponent(query)}&fmt=json&limit=10`
    
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'DeBussio/1.0 (Classical Music Logging App)',
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`MusicBrainz API error: ${response.status}`)
    }

    const data = await response.json()
    console.log('MusicBrainz response:', JSON.stringify(data, null, 2))

    // Transform the response to a more usable format
    let results = []
    
    if (type === 'work' && data.works) {
      results = data.works.map((work: any) => ({
        id: work.id,
        title: work.title,
        type: work.type,
        composer: work['artist-credit']?.[0]?.name || 
                 work.relations?.find((r: any) => r.type === 'composer')?.artist?.name ||
                 'Unknown Composer',
        disambiguation: work.disambiguation,
        tags: work.tags?.map((tag: any) => tag.name) || [],
        attributes: work.attributes || [],
        // Extract opus/catalog numbers from attributes or disambiguation
        opus: extractOpusNumber(work),
        catalog: extractCatalogNumber(work),
        key: extractKey(work),
        genre: work.tags?.find((tag: any) => 
          ['symphony', 'concerto', 'sonata', 'quartet', 'trio', 'quintet'].includes(tag.name.toLowerCase())
        )?.name
      }))
    } else if (type === 'recording' && data.recordings) {
      results = data.recordings.map((recording: any) => ({
        id: recording.id,
        title: recording.title,
        artist: recording['artist-credit']?.[0]?.name || 'Unknown Artist',
        length: recording.length,
        disambiguation: recording.disambiguation,
        releases: recording.releases?.map((release: any) => ({
          id: release.id,
          title: release.title,
          date: release.date,
          label: release['label-info']?.[0]?.label?.name
        })) || []
      }))
    }

    return new Response(
      JSON.stringify({ results }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error in musicbrainz-search:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to search MusicBrainz' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})

// Helper functions to extract musical information
function extractOpusNumber(work: any): string | null {
  // Look for opus numbers in title, disambiguation, or attributes
  const text = `${work.title} ${work.disambiguation || ''}`.toLowerCase()
  const opusMatch = text.match(/\bop\.?\s*(\d+(?:\s*no\.?\s*\d+)?)/i)
  return opusMatch ? opusMatch[1] : null
}

function extractCatalogNumber(work: any): string | null {
  // Look for catalog numbers like BWV, K, D, etc.
  const text = `${work.title} ${work.disambiguation || ''}`.toLowerCase()
  const catalogMatch = text.match(/\b(bwv|k\.?|d\.?|l\.?|op\.?|hob\.?)\s*(\d+)/i)
  return catalogMatch ? `${catalogMatch[1].toUpperCase()} ${catalogMatch[2]}` : null
}

function extractKey(work: any): string | null {
  // Look for musical keys
  const text = `${work.title} ${work.disambiguation || ''}`.toLowerCase()
  const keyMatch = text.match(/\bin\s+([a-g](?:\s*(?:flat|sharp|♭|♯))?\s*(?:major|minor))/i)
  return keyMatch ? keyMatch[1] : null
}