// Album Art Service - Hybrid approach for fetching album artwork
// Tries multiple sources: MusicBrainz Cover Art Archive, Spotify, Last.fm, and user uploads

interface AlbumArtSources {
  musicbrainz?: string;
  spotify?: string;
  lastfm?: string;
  user_upload?: string;
}

interface AlbumArtResult {
  url: string;
  source: 'musicbrainz' | 'spotify' | 'lastfm' | 'user_upload' | 'fallback';
  thumbnail?: string;
  full_size?: string;
}

class AlbumArtService {
  private readonly FALLBACK_IMAGE = '/placeholder.svg';
  
  /**
   * Fetches album art from MusicBrainz Cover Art Archive
   * MusicBrainz provides multiple image types and sizes
   */
  async fetchMusicBrainzCoverArt(musicbrainzReleaseId: string): Promise<string | null> {
    try {
      const response = await fetch(
        `https://coverartarchive.org/release/${musicbrainzReleaseId}/front`,
        { 
          method: 'HEAD', // Check if image exists
          signal: AbortSignal.timeout(5000) // 5 second timeout
        }
      );
      
      if (response.ok) {
        return `https://coverartarchive.org/release/${musicbrainzReleaseId}/front-500`; // 500px version
      }
    } catch (error) {
      console.warn('MusicBrainz Cover Art not available:', error);
    }
    
    return null;
  }

  /**
   * Fetches album art from Last.fm API
   * Good fallback for classical music albums
   */
  async fetchLastFmAlbumArt(artist: string, album: string): Promise<string | null> {
    try {
      // Note: In production, you'd need a Last.fm API key
      // This is a placeholder implementation
      const apiKey = 'your_lastfm_api_key'; // Would be configured in environment
      const response = await fetch(
        `https://ws.audioscrobbler.com/2.0/?method=album.getinfo&api_key=${apiKey}&artist=${encodeURIComponent(artist)}&album=${encodeURIComponent(album)}&format=json`,
        { signal: AbortSignal.timeout(5000) }
      );
      
      if (response.ok) {
        const data = await response.json();
        const images = data?.album?.image;
        if (images && images.length > 0) {
          // Get the largest available image
          const largeImage = images.find((img: any) => img.size === 'extralarge') || 
                           images.find((img: any) => img.size === 'large') ||
                           images[images.length - 1];
          return largeImage?.['#text'] || null;
        }
      }
    } catch (error) {
      console.warn('Last.fm album art not available:', error);
    }
    
    return null;
  }

  /**
   * Gets the best available album art from multiple sources
   * Tries sources in order of preference: MusicBrainz → Last.fm → User upload → Fallback
   */
  async getBestAlbumArt(sources: AlbumArtSources): Promise<AlbumArtResult> {
    // Try MusicBrainz first (highest quality for classical music)
    if (sources.musicbrainz) {
      return {
        url: sources.musicbrainz,
        source: 'musicbrainz'
      };
    }

    // Try Spotify next (good coverage)
    if (sources.spotify) {
      return {
        url: sources.spotify,
        source: 'spotify'
      };
    }

    // Try Last.fm
    if (sources.lastfm) {
      return {
        url: sources.lastfm,
        source: 'lastfm'
      };
    }

    // Use user upload if available
    if (sources.user_upload) {
      return {
        url: sources.user_upload,
        source: 'user_upload'
      };
    }

    // Fallback to placeholder
    return {
      url: this.FALLBACK_IMAGE,
      source: 'fallback'
    };
  }

  /**
   * Searches for album art from multiple sources based on recording metadata
   * Returns the first successful result
   */
  async searchAlbumArt(
    albumTitle: string, 
    artist: string, 
    musicbrainzReleaseId?: string
  ): Promise<AlbumArtResult> {
    const sources: AlbumArtSources = {};

    // Try MusicBrainz Cover Art Archive if we have a release ID
    if (musicbrainzReleaseId) {
      const mbCoverArt = await this.fetchMusicBrainzCoverArt(musicbrainzReleaseId);
      if (mbCoverArt) {
        sources.musicbrainz = mbCoverArt;
      }
    }

    // Try Last.fm as fallback
    if (albumTitle && artist) {
      const lastFmArt = await this.fetchLastFmAlbumArt(artist, albumTitle);
      if (lastFmArt) {
        sources.lastfm = lastFmArt;
      }
    }

    return this.getBestAlbumArt(sources);
  }

  /**
   * Generates a Supabase storage URL for user-uploaded album art
   */
  getUserUploadUrl(fileName: string): string {
    return `https://hhwxatbibidxzduodcka.supabase.co/storage/v1/object/public/album-art/${fileName}`;
  }

  /**
   * Updates album art sources in the database
   */
  updateAlbumArtSources(existingSources: AlbumArtSources, newSource: keyof AlbumArtSources, url: string): AlbumArtSources {
    return {
      ...existingSources,
      [newSource]: url
    };
  }
}

export const albumArtService = new AlbumArtService();
export type { AlbumArtSources, AlbumArtResult };