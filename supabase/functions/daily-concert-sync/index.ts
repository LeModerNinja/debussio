import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting daily concert sync...');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Delete outdated concerts (past events older than 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { error: deleteError } = await supabase
      .from('concerts')
      .delete()
      .lt('concert_date', thirtyDaysAgo.toISOString().split('T')[0]);

    if (deleteError) {
      console.error('Error deleting old concerts:', deleteError);
    } else {
      console.log('Successfully deleted outdated concerts');
    }

    const results = [];
    const now = new Date();
    const sixMonthsFromNow = new Date();
    sixMonthsFromNow.setMonth(now.getMonth() + 6);

    const syncOptions = {
      dateFrom: now.toISOString().split('T')[0],
      dateTo: sixMonthsFromNow.toISOString().split('T')[0],
      limit: 200
    };

    // Sync from TicketMaster with enhanced coverage
    try {
      const ticketMasterResponse = await supabase.functions.invoke('ticketmaster-sync', {
        body: syncOptions
      });
      
      if (ticketMasterResponse.data?.success) {
        results.push({
          source: 'TicketMaster',
          syncedCount: ticketMasterResponse.data.syncedCount,
          success: true
        });
        console.log(`TicketMaster sync: ${ticketMasterResponse.data.syncedCount} concerts`);
      }
    } catch (error) {
      console.error('TicketMaster sync failed:', error);
      results.push({
        source: 'TicketMaster',
        success: false,
        error: error.message
      });
    }

    // Sync from Bachtrack
    try {
      const bachtrackResponse = await supabase.functions.invoke('bachtrack-sync', {
        body: syncOptions
      });
      
      if (bachtrackResponse.data?.success) {
        results.push({
          source: 'Bachtrack',
          syncedCount: bachtrackResponse.data.syncedCount,
          success: true
        });
        console.log(`Bachtrack sync: ${bachtrackResponse.data.syncedCount} concerts`);
      }
    } catch (error) {
      console.error('Bachtrack sync failed:', error);
      results.push({
        source: 'Bachtrack',
        success: false,
        error: error.message
      });
    }

    // Sync from Bandsintown with classical artists
    const classicalArtists = [
      'New York Philharmonic',
      'Vienna Philharmonic',
      'Berlin Philharmonic',
      'London Symphony Orchestra',
      'Chicago Symphony Orchestra',
      'Boston Symphony Orchestra',
      'Philadelphia Orchestra',
      'Los Angeles Philharmonic',
      'San Francisco Symphony',
      'Metropolitan Opera',
      'Royal Opera House'
    ];

    try {
      const bandsinownResponse = await supabase.functions.invoke('bandsintown-sync', {
        body: {
          ...syncOptions,
          artists: classicalArtists
        }
      });
      
      if (bandsinownResponse.data?.success) {
        results.push({
          source: 'Bandsintown',
          syncedCount: bandsinownResponse.data.syncedCount,
          success: true
        });
        console.log(`Bandsintown sync: ${bandsinownResponse.data.syncedCount} concerts`);
      }
    } catch (error) {
      console.error('Bandsintown sync failed:', error);
      results.push({
        source: 'Bandsintown',
        success: false,
        error: error.message
      });
    }

    const totalSynced = results
      .filter(r => r.success)
      .reduce((sum, r) => sum + (r.syncedCount || 0), 0);

    console.log(`Daily sync completed. Total concerts synced: ${totalSynced}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Daily sync completed. Total concerts synced: ${totalSynced}`,
        results: results,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in daily-concert-sync function:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});