-- Add external ID tracking for API integration
ALTER TABLE recordings ADD COLUMN IF NOT EXISTS spotify_id TEXT;
ALTER TABLE recordings ADD COLUMN IF NOT EXISTS musicbrainz_id TEXT;
ALTER TABLE concerts ADD COLUMN IF NOT EXISTS external_event_id TEXT;
ALTER TABLE concerts ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'user';

-- Add indexes for better performance on external IDs
CREATE INDEX IF NOT EXISTS idx_recordings_spotify_id ON recordings(spotify_id) WHERE spotify_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_recordings_musicbrainz_id ON recordings(musicbrainz_id) WHERE musicbrainz_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_concerts_external_event_id ON concerts(external_event_id) WHERE external_event_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_concerts_source ON concerts(source);

-- Add more detailed fields for better search and categorization
ALTER TABLE recordings ADD COLUMN IF NOT EXISTS popularity_score INTEGER DEFAULT 0;
ALTER TABLE recordings ADD COLUMN IF NOT EXISTS external_urls JSONB;
ALTER TABLE concerts ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE concerts ADD COLUMN IF NOT EXISTS price_range TEXT;

-- Create indexes for new fields
CREATE INDEX IF NOT EXISTS idx_recordings_popularity ON recordings(popularity_score);
CREATE INDEX IF NOT EXISTS idx_concerts_tags ON concerts USING GIN(tags);