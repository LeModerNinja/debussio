import { supabase } from '@/integrations/supabase/client';
import type { ConcertFilters, Concert } from '@/types';

export interface ConcertSearchResult {
  concerts: Concert[];
  totalCount: number;
  hasMore: boolean;
}

export class ConcertService {
  /**
   * Search concerts with advanced filtering
   */
  static async searchConcerts(
    filters: ConcertFilters,
    page: number = 1,
    pageSize: number = 20
  ): Promise<ConcertSearchResult> {
    try {
      let query = supabase
        .from('concerts')
        .select('*', { count: 'exact' })
        .order('concert_date', { ascending: true });

      // Apply text search across multiple fields
      if (filters.searchQuery) {
        const searchTerm = `%${filters.searchQuery}%`;
        query = query.or(`
          title.ilike.${searchTerm},
          orchestra.ilike.${searchTerm},
          conductor.ilike.${searchTerm},
          soloists.ilike.${searchTerm},
          program.ilike.${searchTerm},
          venue.ilike.${searchTerm}
        `);
      }

      // Apply individual filters
      if (filters.location) {
        query = query.ilike('location', `%${filters.location}%`);
      }

      if (filters.composer) {
        query = query.ilike('program', `%${filters.composer}%`);
      }

      if (filters.orchestra) {
        query = query.ilike('orchestra', `%${filters.orchestra}%`);
      }

      if (filters.conductor) {
        query = query.ilike('conductor', `%${filters.conductor}%`);
      }

      if (filters.venue) {
        query = query.ilike('venue', `%${filters.venue}%`);
      }

      if (filters.priceRange) {
        query = query.eq('price_range', filters.priceRange);
      }

      // Apply date range filter
      if (filters.dateRange.from) {
        query = query.gte('concert_date', filters.dateRange.from.toISOString().split('T')[0]);
      }
      if (filters.dateRange.to) {
        query = query.lte('concert_date', filters.dateRange.to.toISOString().split('T')[0]);
      }

      // Apply tags filter
      if (filters.tags && filters.tags.length > 0) {
        query = query.overlaps('tags', filters.tags);
      }

      // Apply pagination
      const offset = (page - 1) * pageSize;
      query = query.range(offset, offset + pageSize - 1);

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        concerts: data || [],
        totalCount: count || 0,
        hasMore: count ? count > offset + pageSize : false
      };
    } catch (error) {
      console.error('Error searching concerts:', error);
      throw error;
    }
  }

  /**
   * Get user's favorite concerts
   */
  static async getFavoriteConcerts(userId: string): Promise<Concert[]> {
    try {
      const { data, error } = await supabase
        .from('user_favorites')
        .select(`
          concert_id,
          concerts (*)
        `)
        .eq('user_id', userId)
        .not('concert_id', 'is', null)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data?.map(fav => fav.concerts).filter(Boolean) as Concert[]) || [];
    } catch (error) {
      console.error('Error fetching favorite concerts:', error);
      throw error;
    }
  }

  /**
   * Get user's favorite concert IDs for quick lookup
   */
  static async getFavoriteIds(userId: string): Promise<Set<string>> {
    try {
      const { data, error } = await supabase
        .from('user_favorites')
        .select('concert_id')
        .eq('user_id', userId)
        .not('concert_id', 'is', null);

      if (error) throw error;

      return new Set(data?.map(fav => fav.concert_id).filter(Boolean) || []);
    } catch (error) {
      console.error('Error fetching favorite IDs:', error);
      return new Set();
    }
  }

  /**
   * Toggle favorite status for a concert
   */
  static async toggleFavorite(userId: string, concertId: string): Promise<boolean> {
    try {
      // Check if already favorited
      const { data: existing, error: checkError } = await supabase
        .from('user_favorites')
        .select('id')
        .eq('user_id', userId)
        .eq('concert_id', concertId)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existing) {
        // Remove from favorites
        const { error } = await supabase
          .from('user_favorites')
          .delete()
          .eq('user_id', userId)
          .eq('concert_id', concertId);

        if (error) throw error;
        return false; // Removed
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('user_favorites')
          .insert({
            user_id: userId,
            concert_id: concertId,
          });

        if (error) throw error;
        return true; // Added
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      throw error;
    }
  }

  /**
   * Get concerts by date for calendar view
   */
  static async getConcertsByDate(
    startDate: Date,
    endDate: Date,
    filters?: Partial<ConcertFilters>
  ): Promise<Concert[]> {
    try {
      let query = supabase
        .from('concerts')
        .select('*')
        .gte('concert_date', startDate.toISOString().split('T')[0])
        .lte('concert_date', endDate.toISOString().split('T')[0])
        .order('concert_date', { ascending: true });

      // Apply optional filters
      if (filters?.searchQuery) {
        const searchTerm = `%${filters.searchQuery}%`;
        query = query.or(`
          title.ilike.${searchTerm},
          orchestra.ilike.${searchTerm},
          conductor.ilike.${searchTerm},
          soloists.ilike.${searchTerm},
          program.ilike.${searchTerm}
        `);
      }

      if (filters?.location) {
        query = query.ilike('location', `%${filters.location}%`);
      }

      if (filters?.tags && filters.tags.length > 0) {
        query = query.overlaps('tags', filters.tags);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching concerts by date:', error);
      throw error;
    }
  }

  /**
   * Get upcoming concerts for a user based on their preferences
   */
  static async getRecommendedConcerts(
    userId: string,
    limit: number = 10
  ): Promise<Concert[]> {
    try {
      // For now, return upcoming concerts
      // In a real implementation, this would use user preferences, past favorites, etc.
      const { data, error } = await supabase
        .from('concerts')
        .select('*')
        .gte('concert_date', new Date().toISOString().split('T')[0])
        .order('concert_date', { ascending: true })
        .limit(limit);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching recommended concerts:', error);
      throw error;
    }
  }

  /**
   * Generate AI-powered tags for concerts using OpenAI
   */
  static async generateConcertTags(concertId: string): Promise<string[]> {
    try {
      const response = await supabase.functions.invoke('generate-concert-tags', {
        body: { concertId }
      });

      if (response.error) {
        console.error('Error generating concert tags:', response.error);
        return ['Classical', 'Live Performance']; // Fallback tags
      }

      return response.data?.tags || ['Classical', 'Live Performance'];
    } catch (error) {
      console.error('Error calling generate-concert-tags function:', error);
      return ['Classical', 'Live Performance'];
    }
  }

  /**
   * Sync concerts from Bachtrack API
   */
  static async syncFromBachtrack(options: {
    location?: string;
    dateFrom?: string;
    dateTo?: string;
    limit?: number;
  } = {}): Promise<{ success: boolean; syncedCount: number; message: string }> {
    try {
      const response = await supabase.functions.invoke('bachtrack-sync', {
        body: options
      });

      if (response.error) {
        console.error('Error syncing from Bachtrack:', response.error);
        throw new Error(response.error.message || 'Failed to sync from Bachtrack');
      }

      return response.data || { success: false, syncedCount: 0, message: 'Unknown error' };
    } catch (error) {
      console.error('Error calling bachtrack-sync function:', error);
      throw error;
    }
  }

  /**
   * Sync concerts from Bandsintown API
   */
  static async syncFromBandsintown(options?: { 
    location?: string; 
    dateFrom?: string; 
    dateTo?: string; 
    artists?: string[];
    limit?: number;
  }): Promise<{ success: boolean; syncedCount: number; message: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('bandsintown-sync', {
        body: options || {}
      });

      if (error) {
        console.error('Error syncing from Bandsintown:', error);
        return {
          success: false,
          syncedCount: 0,
          message: `Failed to sync from Bandsintown: ${error.message}`
        };
      }

      return data;
    } catch (error: any) {
      console.error('Error calling bandsintown-sync function:', error);
      return {
        success: false,
        syncedCount: 0,
        message: `Error calling sync function: ${error.message}`
      };
    }
  }

  /**
   * Sync concerts from Eventbrite API
   */
  static async syncFromEventbrite(options?: { 
    location?: string; 
    dateFrom?: string; 
    dateTo?: string; 
    limit?: number;
  }): Promise<{ success: boolean; syncedCount: number; message: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('eventbrite-sync', {
        body: options || {}
      });

      if (error) {
        console.error('Error syncing from Eventbrite:', error);
        return {
          success: false,
          syncedCount: 0,
          message: `Failed to sync from Eventbrite: ${error.message}`
        };
      }

      return data;
    } catch (error: any) {
      console.error('Error calling eventbrite-sync function:', error);
      return {
        success: false,
        syncedCount: 0,
        message: `Error calling sync function: ${error.message}`
      };
    }
  }

  /**
   * Sync concerts from TicketMaster API
   */
  static async syncFromTicketMaster(options?: { 
    location?: string; 
    dateFrom?: string; 
    dateTo?: string; 
    limit?: number;
  }): Promise<{ success: boolean; syncedCount: number; message: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('ticketmaster-sync', {
        body: options || {}
      });

      if (error) {
        console.error('Error syncing from TicketMaster:', error);
        return {
          success: false,
          syncedCount: 0,
          message: `Failed to sync from TicketMaster: ${error.message}`
        };
      }

      return data;
    } catch (error: any) {
      console.error('Error calling ticketmaster-sync function:', error);
      return {
        success: false,
        syncedCount: 0,
        message: `Error calling sync function: ${error.message}`
      };
    }
  }

  /**
   * Get concert statistics for analytics
   */
  static async getConcertStats(): Promise<{
    totalConcerts: number;
    upcomingConcerts: number;
    favoritedConcerts: number;
  }> {
    try {
      const today = new Date().toISOString().split('T')[0];

      const [totalResult, upcomingResult, favoritesResult] = await Promise.all([
        supabase.from('concerts').select('*', { count: 'exact', head: true }),
        supabase.from('concerts').select('*', { count: 'exact', head: true }).gte('concert_date', today),
        supabase.from('user_favorites').select('*', { count: 'exact', head: true }).not('concert_id', 'is', null)
      ]);

      return {
        totalConcerts: totalResult.count || 0,
        upcomingConcerts: upcomingResult.count || 0,
        favoritedConcerts: favoritesResult.count || 0
      };
    } catch (error) {
      console.error('Error fetching concert stats:', error);
      return { totalConcerts: 0, upcomingConcerts: 0, favoritedConcerts: 0 };
    }
  }
}