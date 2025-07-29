-- Drop the old rating columns and add new classical music specific ratings
ALTER TABLE user_entries 
DROP COLUMN IF EXISTS performance_rating,
DROP COLUMN IF EXISTS sound_quality_rating,
DROP COLUMN IF EXISTS interpretation_rating;

-- Add new classical music specific rating columns
ALTER TABLE user_entries 
ADD COLUMN conductor_rating integer CHECK (conductor_rating >= 1 AND conductor_rating <= 5),
ADD COLUMN recording_quality_rating integer CHECK (recording_quality_rating >= 1 AND recording_quality_rating <= 5),
ADD COLUMN orchestra_rating integer CHECK (orchestra_rating >= 1 AND orchestra_rating <= 5),
ADD COLUMN soloist_rating integer CHECK (soloist_rating >= 1 AND soloist_rating <= 5),
ADD COLUMN interpretation_rating integer CHECK (interpretation_rating >= 1 AND interpretation_rating <= 5),
ADD COLUMN acoustics_rating integer CHECK (acoustics_rating >= 1 AND acoustics_rating <= 5),
ADD COLUMN program_rating integer CHECK (program_rating >= 1 AND program_rating <= 5);

-- Create user preferences table for default rating categories
CREATE TABLE user_rating_preferences (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    entry_type text NOT NULL CHECK (entry_type IN ('recording', 'concert')),
    default_categories text[] NOT NULL DEFAULT '{}',
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    UNIQUE(user_id, entry_type)
);

-- Enable RLS for user preferences
ALTER TABLE user_rating_preferences ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user preferences
CREATE POLICY "Users can manage their own rating preferences" 
ON user_rating_preferences 
FOR ALL 
USING ((select auth.uid()) = user_id);

-- Add comments for the new rating columns
COMMENT ON COLUMN user_entries.conductor_rating IS 'Conductor performance rating (1-5 stars)';
COMMENT ON COLUMN user_entries.recording_quality_rating IS 'Recording/sound quality rating (1-5 stars)';
COMMENT ON COLUMN user_entries.orchestra_rating IS 'Orchestra/ensemble performance rating (1-5 stars)';
COMMENT ON COLUMN user_entries.soloist_rating IS 'Soloist performance rating (1-5 stars)';
COMMENT ON COLUMN user_entries.interpretation_rating IS 'Musical interpretation rating (1-5 stars)';
COMMENT ON COLUMN user_entries.acoustics_rating IS 'Acoustics/venue rating (1-5 stars)';
COMMENT ON COLUMN user_entries.program_rating IS 'Program selection rating (1-5 stars)';