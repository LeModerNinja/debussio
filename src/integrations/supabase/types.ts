export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      composers: {
        Row: {
          birth_year: number | null
          created_at: string
          death_year: number | null
          id: string
          name: string
          nationality: string | null
          period: string | null
          updated_at: string
        }
        Insert: {
          birth_year?: number | null
          created_at?: string
          death_year?: number | null
          id?: string
          name: string
          nationality?: string | null
          period?: string | null
          updated_at?: string
        }
        Update: {
          birth_year?: number | null
          created_at?: string
          death_year?: number | null
          id?: string
          name?: string
          nationality?: string | null
          period?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      concerts: {
        Row: {
          concert_date: string
          conductor: string | null
          created_at: string
          external_event_id: string | null
          id: string
          location: string
          orchestra: string | null
          price_range: string | null
          program: string | null
          soloists: string | null
          source: string | null
          start_time: string | null
          tags: string[] | null
          ticket_url: string | null
          title: string
          updated_at: string
          venue: string
        }
        Insert: {
          concert_date: string
          conductor?: string | null
          created_at?: string
          external_event_id?: string | null
          id?: string
          location: string
          orchestra?: string | null
          price_range?: string | null
          program?: string | null
          soloists?: string | null
          source?: string | null
          start_time?: string | null
          tags?: string[] | null
          ticket_url?: string | null
          title: string
          updated_at?: string
          venue: string
        }
        Update: {
          concert_date?: string
          conductor?: string | null
          created_at?: string
          external_event_id?: string | null
          id?: string
          location?: string
          orchestra?: string | null
          price_range?: string | null
          program?: string | null
          soloists?: string | null
          source?: string | null
          start_time?: string | null
          tags?: string[] | null
          ticket_url?: string | null
          title?: string
          updated_at?: string
          venue?: string
        }
        Relationships: []
      }
      pieces: {
        Row: {
          catalog_number: string | null
          composer_id: string
          created_at: string
          duration_minutes: number | null
          genre: string | null
          id: string
          key_signature: string | null
          opus_number: string | null
          title: string
          updated_at: string
        }
        Insert: {
          catalog_number?: string | null
          composer_id: string
          created_at?: string
          duration_minutes?: number | null
          genre?: string | null
          id?: string
          key_signature?: string | null
          opus_number?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          catalog_number?: string | null
          composer_id?: string
          created_at?: string
          duration_minutes?: number | null
          genre?: string | null
          id?: string
          key_signature?: string | null
          opus_number?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pieces_composer_id_fkey"
            columns: ["composer_id"]
            isOneToOne: false
            referencedRelation: "composers"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          id: string
          location: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          location?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          location?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      recordings: {
        Row: {
          album_title: string | null
          conductor: string | null
          cover_art_sources: Json | null
          cover_image_url: string | null
          created_at: string
          external_urls: Json | null
          id: string
          label: string | null
          musicbrainz_id: string | null
          orchestra: string | null
          piece_id: string
          popularity_score: number | null
          release_year: number | null
          soloists: string | null
          spotify_id: string | null
          updated_at: string
        }
        Insert: {
          album_title?: string | null
          conductor?: string | null
          cover_art_sources?: Json | null
          cover_image_url?: string | null
          created_at?: string
          external_urls?: Json | null
          id?: string
          label?: string | null
          musicbrainz_id?: string | null
          orchestra?: string | null
          piece_id: string
          popularity_score?: number | null
          release_year?: number | null
          soloists?: string | null
          spotify_id?: string | null
          updated_at?: string
        }
        Update: {
          album_title?: string | null
          conductor?: string | null
          cover_art_sources?: Json | null
          cover_image_url?: string | null
          created_at?: string
          external_urls?: Json | null
          id?: string
          label?: string | null
          musicbrainz_id?: string | null
          orchestra?: string | null
          piece_id?: string
          popularity_score?: number | null
          release_year?: number | null
          soloists?: string | null
          spotify_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "recordings_piece_id_fkey"
            columns: ["piece_id"]
            isOneToOne: false
            referencedRelation: "pieces"
            referencedColumns: ["id"]
          },
        ]
      }
      user_entries: {
        Row: {
          acoustics_rating: number | null
          concert_id: string | null
          conductor_rating: number | null
          created_at: string
          entry_date: string
          entry_type: Database["public"]["Enums"]["entry_type"]
          id: string
          interpretation_rating: number | null
          notes: string | null
          orchestra_rating: number | null
          program_rating: number | null
          rating: number | null
          recording_id: string | null
          recording_quality_rating: number | null
          soloist_rating: number | null
          tags: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          acoustics_rating?: number | null
          concert_id?: string | null
          conductor_rating?: number | null
          created_at?: string
          entry_date?: string
          entry_type: Database["public"]["Enums"]["entry_type"]
          id?: string
          interpretation_rating?: number | null
          notes?: string | null
          orchestra_rating?: number | null
          program_rating?: number | null
          rating?: number | null
          recording_id?: string | null
          recording_quality_rating?: number | null
          soloist_rating?: number | null
          tags?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          acoustics_rating?: number | null
          concert_id?: string | null
          conductor_rating?: number | null
          created_at?: string
          entry_date?: string
          entry_type?: Database["public"]["Enums"]["entry_type"]
          id?: string
          interpretation_rating?: number | null
          notes?: string | null
          orchestra_rating?: number | null
          program_rating?: number | null
          rating?: number | null
          recording_id?: string | null
          recording_quality_rating?: number | null
          soloist_rating?: number | null
          tags?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_entries_concert_id_fkey"
            columns: ["concert_id"]
            isOneToOne: false
            referencedRelation: "concerts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_entries_recording_id_fkey"
            columns: ["recording_id"]
            isOneToOne: false
            referencedRelation: "recordings"
            referencedColumns: ["id"]
          },
        ]
      }
      user_favorites: {
        Row: {
          concert_id: string | null
          created_at: string
          id: string
          recording_id: string | null
          user_id: string
        }
        Insert: {
          concert_id?: string | null
          created_at?: string
          id?: string
          recording_id?: string | null
          user_id: string
        }
        Update: {
          concert_id?: string | null
          created_at?: string
          id?: string
          recording_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_favorites_concert_id_fkey"
            columns: ["concert_id"]
            isOneToOne: false
            referencedRelation: "concerts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_favorites_recording_id_fkey"
            columns: ["recording_id"]
            isOneToOne: false
            referencedRelation: "recordings"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          allow_recommendations: boolean | null
          auto_play_audio_previews: boolean | null
          concerts_per_page: number | null
          created_at: string
          currency: string | null
          default_view_mode: string | null
          email_notifications: boolean | null
          favorite_artists_alerts: boolean | null
          favorite_composers: string[] | null
          favorite_conductors: string[] | null
          favorite_orchestras: string[] | null
          id: string
          include_contemporary: boolean | null
          include_early_music: boolean | null
          max_price_range: number | null
          max_travel_distance: number | null
          min_price_range: number | null
          new_concerts_alerts: boolean | null
          preferred_concert_duration: string | null
          preferred_concert_types: string[] | null
          preferred_languages: string[] | null
          preferred_locations: string[] | null
          preferred_venues: string[] | null
          price_drop_alerts: boolean | null
          profile_visibility: string | null
          reminder_before_concert: number | null
          share_concert_attendance: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          allow_recommendations?: boolean | null
          auto_play_audio_previews?: boolean | null
          concerts_per_page?: number | null
          created_at?: string
          currency?: string | null
          default_view_mode?: string | null
          email_notifications?: boolean | null
          favorite_artists_alerts?: boolean | null
          favorite_composers?: string[] | null
          favorite_conductors?: string[] | null
          favorite_orchestras?: string[] | null
          id?: string
          include_contemporary?: boolean | null
          include_early_music?: boolean | null
          max_price_range?: number | null
          max_travel_distance?: number | null
          min_price_range?: number | null
          new_concerts_alerts?: boolean | null
          preferred_concert_duration?: string | null
          preferred_concert_types?: string[] | null
          preferred_languages?: string[] | null
          preferred_locations?: string[] | null
          preferred_venues?: string[] | null
          price_drop_alerts?: boolean | null
          profile_visibility?: string | null
          reminder_before_concert?: number | null
          share_concert_attendance?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          allow_recommendations?: boolean | null
          auto_play_audio_previews?: boolean | null
          concerts_per_page?: number | null
          created_at?: string
          currency?: string | null
          default_view_mode?: string | null
          email_notifications?: boolean | null
          favorite_artists_alerts?: boolean | null
          favorite_composers?: string[] | null
          favorite_conductors?: string[] | null
          favorite_orchestras?: string[] | null
          id?: string
          include_contemporary?: boolean | null
          include_early_music?: boolean | null
          max_price_range?: number | null
          max_travel_distance?: number | null
          min_price_range?: number | null
          new_concerts_alerts?: boolean | null
          preferred_concert_duration?: string | null
          preferred_concert_types?: string[] | null
          preferred_languages?: string[] | null
          preferred_locations?: string[] | null
          preferred_venues?: string[] | null
          price_drop_alerts?: boolean | null
          profile_visibility?: string | null
          reminder_before_concert?: number | null
          share_concert_attendance?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_rating_preferences: {
        Row: {
          created_at: string
          default_categories: string[]
          entry_type: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          default_categories?: string[]
          entry_type: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          default_categories?: string[]
          entry_type?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_or_create_user_preferences: {
        Args: { user_id_param: string }
        Returns: {
          allow_recommendations: boolean | null
          auto_play_audio_previews: boolean | null
          concerts_per_page: number | null
          created_at: string
          currency: string | null
          default_view_mode: string | null
          email_notifications: boolean | null
          favorite_artists_alerts: boolean | null
          favorite_composers: string[] | null
          favorite_conductors: string[] | null
          favorite_orchestras: string[] | null
          id: string
          include_contemporary: boolean | null
          include_early_music: boolean | null
          max_price_range: number | null
          max_travel_distance: number | null
          min_price_range: number | null
          new_concerts_alerts: boolean | null
          preferred_concert_duration: string | null
          preferred_concert_types: string[] | null
          preferred_languages: string[] | null
          preferred_locations: string[] | null
          preferred_venues: string[] | null
          price_drop_alerts: boolean | null
          profile_visibility: string | null
          reminder_before_concert: number | null
          share_concert_attendance: boolean | null
          updated_at: string
          user_id: string
        }
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      entry_type: "recording" | "concert"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
      entry_type: ["recording", "concert"],
    },
  },
} as const
