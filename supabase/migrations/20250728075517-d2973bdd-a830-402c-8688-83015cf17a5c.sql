-- Create storage bucket for user-uploaded album art
INSERT INTO storage.buckets (id, name, public) VALUES ('album-art', 'album-art', true);

-- Create policies for album art uploads
CREATE POLICY "Album art is publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'album-art');

CREATE POLICY "Users can upload album art" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'album-art' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update album art" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'album-art' AND auth.uid() IS NOT NULL);

-- Add additional image URLs to recordings table
ALTER TABLE recordings 
ADD COLUMN cover_art_sources JSONB DEFAULT '{}';

-- Add comment to explain the cover_art_sources structure
COMMENT ON COLUMN recordings.cover_art_sources IS 'JSON object storing multiple cover art sources: {"musicbrainz": "url", "spotify": "url", "lastfm": "url", "user_upload": "url"}';