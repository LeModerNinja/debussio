// Centralized type definitions
export interface Concert {
  id: string;
  title: string;
  venue: string;
  location: string;
  concert_date: string;
  start_time: string | null;
  orchestra: string | null;
  conductor: string | null;
  soloists: string | null;
  program: string | null;
  ticket_url: string | null;
  price_range: string | null;
  tags: string[] | null;
  source: string | null;
  external_event_id: string | null;
  created_at: string;
  updated_at: string;
}

// Concert-specific search filters used by services and components
export interface ConcertFilters {
  searchQuery?: string;
  location?: string;
  composer?: string;
  orchestra?: string;
  conductor?: string;
  venue?: string;
  dateRange?: { from?: Date; to?: Date };
  priceRange?: string;
  tags?: string[];
}

export interface Recording {
  id: string;
  piece_id: string;
  conductor: string | null;
  orchestra: string | null;
  soloists: string | null;
  label: string | null;
  album_title: string | null;
  release_year: number | null;
  popularity_score: number | null;
  musicbrainz_id: string | null;
  spotify_id: string | null;
  cover_art_sources: Record<string, string> | null;
  created_at: string;
  updated_at: string;
}

export interface UserEntry {
  id: string;
  user_id: string;
  entry_type: 'recording' | 'concert';
  recording_id: string | null;
  concert_id: string | null;
  rating: number | null;
  conductor_rating: number | null;
  recording_quality_rating: number | null;
  orchestra_rating: number | null;
  soloist_rating: number | null;
  interpretation_rating: number | null;
  acoustics_rating: number | null;
  program_rating: number | null;
  notes: string | null;
  tags: string[] | null;
  entry_date: string;
  created_at: string;
  updated_at: string;
  // Populated via joins
  recording?: {
    id: string;
    orchestra: string | null;
    conductor: string | null;
    soloists: string | null;
    label: string | null;
    album_title: string | null;
    release_year: number | null;
    piece: {
      id: string;
      title: string;
      opus_number: string | null;
      key_signature: string | null;
      genre: string | null;
      duration_minutes: number | null;
      composer: {
        id: string;
        name: string;
        period: string | null;
      } | null;
    } | null;
  } | null;
  concert?: Concert | null;
}

export interface SearchFilters {
  general?: string;
  composer?: string;
  pieceTitle?: string;
  performer?: string;
  conductor?: string;
  entryType?: string;
  rating?: string;
  genre?: string;
  period?: string;
  location?: string;
  dateRange?: { from?: Date; to?: Date };
  tags?: string[];
  searchQuery?: string;
  orchestra?: string;
  venue?: string;
  priceRange?: string;
}

export interface RatingCategory {
  key: string;
  label: string;
  description: string;
}

export interface FormData {
  title: string;
  composer: string;
  conductor?: string;
  orchestra?: string;
  soloists?: string;
  venue?: string;
  location?: string;
  concertDate?: string;
  startTime?: string;
  program?: string;
  rating: number;
  notes: string;
  tags: string;
}