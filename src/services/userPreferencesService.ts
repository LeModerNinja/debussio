import { supabase } from '@/integrations/supabase/client';

export interface UserPreferences {
  id: string;
  user_id: string;
  
  // Search & Discovery Preferences
  preferred_locations: string[];
  max_travel_distance: number;
  preferred_venues: string[];
  favorite_composers: string[];
  favorite_orchestras: string[];
  favorite_conductors: string[];
  preferred_concert_types: string[];
  
  // Budget & Pricing
  min_price_range: number;
  max_price_range: number;
  currency: string;
  
  // Notification & Alert Preferences
  email_notifications: boolean;
  new_concerts_alerts: boolean;
  favorite_artists_alerts: boolean;
  price_drop_alerts: boolean;
  reminder_before_concert: number;
  
  // Content Preferences
  preferred_languages: string[];
  preferred_concert_duration: string;
  include_contemporary: boolean;
  include_early_music: boolean;
  
  // Display & Interface
  default_view_mode: string;
  concerts_per_page: number;
  auto_play_audio_previews: boolean;
  
  // Privacy Settings
  profile_visibility: string;
  share_concert_attendance: boolean;
  allow_recommendations: boolean;
  
  created_at: string;
  updated_at: string;
}

export class UserPreferencesService {
  /**
   * Get user preferences, creating defaults if none exist
   */
  static async getUserPreferences(userId: string): Promise<UserPreferences | null> {
    try {
      const { data, error } = await supabase
        .rpc('get_or_create_user_preferences', { user_id_param: userId });

      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error fetching user preferences:', error);
      return null;
    }
  }

  /**
   * Update user preferences
   */
  static async updatePreferences(
    userId: string, 
    preferences: Partial<UserPreferences>
  ): Promise<UserPreferences | null> {
    try {
      // Remove read-only fields
      const { id, user_id, created_at, updated_at, ...updateData } = preferences;

      const { data, error } = await supabase
        .from('user_preferences')
        .update(updateData)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error updating user preferences:', error);
      throw error;
    }
  }

  /**
   * Get user's preferred filters for concert search
   */
  static async getPreferredFilters(userId: string): Promise<{
    locations: string[];
    composers: string[];
    orchestras: string[];
    conductors: string[];
    venues: string[];
    concertTypes: string[];
    priceRange: { min: number; max: number };
    viewMode: string;
  }> {
    try {
      const preferences = await this.getUserPreferences(userId);
      
      if (!preferences) {
        return {
          locations: [],
          composers: [],
          orchestras: [],
          conductors: [],
          venues: [],
          concertTypes: [],
          priceRange: { min: 0, max: 500 },
          viewMode: 'list'
        };
      }

      return {
        locations: preferences.preferred_locations || [],
        composers: preferences.favorite_composers || [],
        orchestras: preferences.favorite_orchestras || [],
        conductors: preferences.favorite_conductors || [],
        venues: preferences.preferred_venues || [],
        concertTypes: preferences.preferred_concert_types || [],
        priceRange: { 
          min: preferences.min_price_range || 0, 
          max: preferences.max_price_range || 500 
        },
        viewMode: preferences.default_view_mode || 'list'
      };
    } catch (error) {
      console.error('Error getting preferred filters:', error);
      return {
        locations: [],
        composers: [],
        orchestras: [],
        conductors: [],
        venues: [],
        concertTypes: [],
        priceRange: { min: 0, max: 500 },
        viewMode: 'list'
      };
    }
  }

  /**
   * Update a specific preference category
   */
  static async updatePreferenceCategory(
    userId: string,
    category: keyof UserPreferences,
    value: any
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_preferences')
        .update({ [category]: value })
        .eq('user_id', userId);

      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error(`Error updating ${category}:`, error);
      return false;
    }
  }

  /**
   * Add to a preference list (like favorite composers)
   */
  static async addToPreferenceList(
    userId: string,
    category: 'favorite_composers' | 'favorite_orchestras' | 'favorite_conductors' | 'preferred_venues' | 'preferred_locations' | 'preferred_concert_types',
    item: string
  ): Promise<boolean> {
    try {
      const preferences = await this.getUserPreferences(userId);
      if (!preferences) return false;

      const currentList = preferences[category] || [];
      if (!currentList.includes(item)) {
        const updatedList = [...currentList, item];
        return await this.updatePreferenceCategory(userId, category, updatedList);
      }
      
      return true;
    } catch (error) {
      console.error(`Error adding to ${category}:`, error);
      return false;
    }
  }

  /**
   * Remove from a preference list
   */
  static async removeFromPreferenceList(
    userId: string,
    category: 'favorite_composers' | 'favorite_orchestras' | 'favorite_conductors' | 'preferred_venues' | 'preferred_locations' | 'preferred_concert_types',
    item: string
  ): Promise<boolean> {
    try {
      const preferences = await this.getUserPreferences(userId);
      if (!preferences) return false;

      const currentList = preferences[category] || [];
      const updatedList = currentList.filter(i => i !== item);
      
      return await this.updatePreferenceCategory(userId, category, updatedList);
    } catch (error) {
      console.error(`Error removing from ${category}:`, error);
      return false;
    }
  }

  /**
   * Reset preferences to defaults
   */
  static async resetPreferences(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_preferences')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;
      
      // This will trigger creation of new default preferences on next access
      return true;
    } catch (error) {
      console.error('Error resetting preferences:', error);
      return false;
    }
  }
}