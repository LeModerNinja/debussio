import { supabase } from '@/integrations/supabase/client';

export interface EventbriteEvent {
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

export interface EventbriteSyncOptions {
  location?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  keywords?: string[];
}

export interface EventbriteSyncResult {
  success: boolean;
  syncedCount: number;
  message: string;
  events?: EventbriteEvent[];
}

export class EventbriteService {
  /**
   * Sync events from Eventbrite API
   */
  static async syncEvents(options: EventbriteSyncOptions = {}): Promise<EventbriteSyncResult> {
    try {
      const { data, error } = await supabase.functions.invoke('eventbrite-sync', {
        body: options
      });

      if (error) {
        console.error('Error calling eventbrite-sync function:', error);
        throw new Error(error.message || 'Failed to sync from Eventbrite');
      }

      return data;
    } catch (error) {
      console.error('EventbriteService.syncEvents error:', error);
      throw error;
    }
  }

  /**
   * Search for classical music events on Eventbrite
   */
  static async searchClassicalEvents(options: {
    location?: string;
    dateRange?: { from?: Date; to?: Date };
    keywords?: string[];
    limit?: number;
  } = {}): Promise<EventbriteSyncResult> {
    const syncOptions: EventbriteSyncOptions = {
      location: options.location,
      dateFrom: options.dateRange?.from?.toISOString().split('T')[0],
      dateTo: options.dateRange?.to?.toISOString().split('T')[0],
      limit: options.limit || 50,
      keywords: options.keywords || [
        'classical', 'orchestra', 'symphony', 'opera', 'chamber', 
        'philharmonic', 'concert', 'recital', 'piano', 'violin', 
        'cello', 'baroque', 'choir'
      ]
    };

    return this.syncEvents(syncOptions);
  }

  /**
   * Get sync statistics
   */
  static async getSyncStats(): Promise<{
    totalEventbriteEvents: number;
    lastSyncDate: string | null;
    upcomingEvents: number;
  }> {
    try {
      const today = new Date().toISOString().split('T')[0];

      const [totalResult, upcomingResult] = await Promise.all([
        supabase
          .from('concerts')
          .select('*', { count: 'exact', head: true })
          .eq('source', 'eventbrite'),
        supabase
          .from('concerts')
          .select('*', { count: 'exact', head: true })
          .eq('source', 'eventbrite')
          .gte('concert_date', today)
      ]);

      // Get last sync date from most recent eventbrite concert
      const { data: lastSyncData } = await supabase
        .from('concerts')
        .select('created_at')
        .eq('source', 'eventbrite')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      return {
        totalEventbriteEvents: totalResult.count || 0,
        lastSyncDate: lastSyncData?.created_at || null,
        upcomingEvents: upcomingResult.count || 0
      };
    } catch (error) {
      console.error('Error fetching sync stats:', error);
      return {
        totalEventbriteEvents: 0,
        lastSyncDate: null,
        upcomingEvents: 0
      };
    }
  }

  /**
   * Get Eventbrite events from our database
   */
  static async getEventbriteEvents(options: {
    location?: string;
    dateRange?: { from?: Date; to?: Date };
    limit?: number;
  } = {}): Promise<any[]> {
    try {
      let query = supabase
        .from('concerts')
        .select('*')
        .eq('source', 'eventbrite')
        .order('concert_date', { ascending: true });

      if (options.location) {
        query = query.ilike('location', `%${options.location}%`);
      }

      if (options.dateRange?.from) {
        query = query.gte('concert_date', options.dateRange.from.toISOString().split('T')[0]);
      }

      if (options.dateRange?.to) {
        query = query.lte('concert_date', options.dateRange.to.toISOString().split('T')[0]);
      }

      if (options.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching Eventbrite events:', error);
      throw error;
    }
  }
}