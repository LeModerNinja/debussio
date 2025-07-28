// MusicBrainz API service for fetching classical music metadata
export interface MusicBrainzRecording {
  id: string;
  title: string;
  disambiguation?: string;
  length?: number;
  'artist-credit'?: Array<{
    artist: {
      id: string;
      name: string;
      'sort-name': string;
    };
  }>;
  releases?: Array<{
    id: string;
    title: string;
    date?: string;
    'label-info'?: Array<{
      label?: {
        name: string;
      };
    }>;
  }>;
}

export interface MusicBrainzWork {
  id: string;
  title: string;
  disambiguation?: string;
  type?: string;
  'type-id'?: string;
  attributes?: Array<{
    type: string;
    value: string;
  }>;
  relations?: Array<{
    type: string;
    direction: string;
    artist?: {
      id: string;
      name: string;
      'sort-name': string;
    };
  }>;
}

export interface MusicBrainzSearchResult {
  created: string;
  count: number;
  offset: number;
  recordings?: MusicBrainzRecording[];
  works?: MusicBrainzWork[];
}

class MusicBrainzService {
  private readonly baseUrl = 'https://musicbrainz.org/ws/2';
  private readonly userAgent = 'DeBussio/1.0.0 (https://your-domain.com)';

  /**
   * Search for recordings by title and artist
   * @param title - The title of the piece/recording
   * @param artist - The composer or performer name
   * @param limit - Maximum number of results (default: 25)
   */
  async searchRecordings(title: string, artist?: string, limit: number = 25): Promise<MusicBrainzSearchResult> {
    const query = this.buildRecordingQuery(title, artist);
    const url = `${this.baseUrl}/recording?query=${encodeURIComponent(query)}&fmt=json&limit=${limit}`;
    
    return this.makeRequest(url);
  }

  /**
   * Search for classical works by title and composer
   * @param title - The title of the work
   * @param composer - The composer name
   * @param limit - Maximum number of results (default: 25)
   */
  async searchWorks(title: string, composer?: string, limit: number = 25): Promise<MusicBrainzSearchResult> {
    const query = this.buildWorkQuery(title, composer);
    const url = `${this.baseUrl}/work?query=${encodeURIComponent(query)}&fmt=json&limit=${limit}`;
    
    return this.makeRequest(url);
  }

  /**
   * Get detailed recording information by MusicBrainz ID
   * @param recordingId - The MusicBrainz recording ID
   */
  async getRecordingById(recordingId: string): Promise<MusicBrainzRecording> {
    const url = `${this.baseUrl}/recording/${recordingId}?inc=artist-credits+releases+labels&fmt=json`;
    return this.makeRequest(url);
  }

  /**
   * Get detailed work information by MusicBrainz ID
   * @param workId - The MusicBrainz work ID
   */
  async getWorkById(workId: string): Promise<MusicBrainzWork> {
    const url = `${this.baseUrl}/work/${workId}?inc=artist-rels+work-rels+attributes&fmt=json`;
    return this.makeRequest(url);
  }

  /**
   * Search for recordings of a specific classical work
   * @param workTitle - The title of the classical work
   * @param composer - The composer name
   * @param performer - Optional performer/conductor name
   */
  async searchClassicalRecordings(
    workTitle: string, 
    composer: string, 
    performer?: string
  ): Promise<MusicBrainzSearchResult> {
    // Search for the work first to get more accurate results
    const workQuery = `"${workTitle}" AND artist:"${composer}"`;
    let query = `work:(${workQuery})`;
    
    if (performer) {
      query += ` AND (artist:"${performer}" OR creditname:"${performer}")`;
    }
    
    const url = `${this.baseUrl}/recording?query=${encodeURIComponent(query)}&fmt=json&limit=50`;
    return this.makeRequest(url);
  }

  private buildRecordingQuery(title: string, artist?: string): string {
    let query = `recording:"${title}"`;
    
    if (artist) {
      query += ` AND (artist:"${artist}" OR creditname:"${artist}")`;
    }
    
    return query;
  }

  private buildWorkQuery(title: string, composer?: string): string {
    let query = `work:"${title}"`;
    
    if (composer) {
      query += ` AND artist:"${composer}"`;
    }
    
    // Prefer classical music types
    query += ' AND (type:symphony OR type:concerto OR type:sonata OR type:quartet OR type:quintet OR type:opera OR type:ballet)';
    
    return query;
  }

  private async makeRequest(url: string): Promise<any> {
    try {
      console.log(`MusicBrainz API request: ${url}`);
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`MusicBrainz API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('MusicBrainz API response:', data);
      
      return data;
    } catch (error) {
      console.error('MusicBrainz API error:', error);
      throw error;
    }
  }

  /**
   * Helper method to extract useful information from a recording
   */
  extractRecordingInfo(recording: MusicBrainzRecording) {
    const artists = recording['artist-credit']?.map(credit => credit.artist.name) || [];
    const mainRelease = recording.releases?.[0];
    const label = mainRelease?.['label-info']?.[0]?.label?.name;
    
    return {
      id: recording.id,
      title: recording.title,
      disambiguation: recording.disambiguation,
      duration: recording.length ? Math.round(recording.length / 60000) : null, // Convert ms to minutes
      artists: artists,
      releaseTitle: mainRelease?.title,
      releaseDate: mainRelease?.date,
      label: label,
      releaseId: mainRelease?.id, // Add release ID for album art fetching
    };
  }

  /**
   * Helper method to extract useful information from a work
   */
  extractWorkInfo(work: MusicBrainzWork) {
    const composer = work.relations?.find(rel => 
      rel.type === 'composer' && rel.direction === 'backward'
    )?.artist;

    const opusNumber = work.attributes?.find(attr => 
      attr.type === 'opus'
    )?.value;

    const keySignature = work.attributes?.find(attr => 
      attr.type === 'key'
    )?.value;

    return {
      id: work.id,
      title: work.title,
      disambiguation: work.disambiguation,
      type: work.type,
      composer: composer?.name,
      opusNumber: opusNumber,
      keySignature: keySignature,
    };
  }
}

export const musicBrainzService = new MusicBrainzService();