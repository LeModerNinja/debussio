-- Add additional rating columns to user_entries table for detailed ratings
ALTER TABLE user_entries 
ADD COLUMN performance_rating integer CHECK (performance_rating >= 1 AND performance_rating <= 5),
ADD COLUMN sound_quality_rating integer CHECK (sound_quality_rating >= 1 AND sound_quality_rating <= 5),
ADD COLUMN interpretation_rating integer CHECK (interpretation_rating >= 1 AND interpretation_rating <= 5);

-- Add comments to explain the rating system
COMMENT ON COLUMN user_entries.rating IS 'Overall rating (1-5 stars)';
COMMENT ON COLUMN user_entries.performance_rating IS 'Performance quality rating (1-5 stars)';
COMMENT ON COLUMN user_entries.sound_quality_rating IS 'Sound/recording quality rating (1-5 stars)';
COMMENT ON COLUMN user_entries.interpretation_rating IS 'Musical interpretation rating (1-5 stars)';