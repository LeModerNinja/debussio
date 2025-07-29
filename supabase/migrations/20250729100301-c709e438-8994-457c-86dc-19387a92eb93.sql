-- Create user preferences table for personalized concert discovery
CREATE TABLE public.user_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  
  -- Search & Discovery Preferences
  preferred_locations TEXT[] DEFAULT '{}',
  max_travel_distance INTEGER DEFAULT 50, -- in miles/km
  preferred_venues TEXT[] DEFAULT '{}',
  favorite_composers TEXT[] DEFAULT '{}',
  favorite_orchestras TEXT[] DEFAULT '{}',
  favorite_conductors TEXT[] DEFAULT '{}',
  preferred_concert_types TEXT[] DEFAULT '{}', -- symphony, chamber, opera, etc.
  
  -- Budget & Pricing
  min_price_range INTEGER DEFAULT 0,
  max_price_range INTEGER DEFAULT 500,
  currency TEXT DEFAULT 'USD',
  
  -- Notification & Alert Preferences
  email_notifications BOOLEAN DEFAULT true,
  new_concerts_alerts BOOLEAN DEFAULT true,
  favorite_artists_alerts BOOLEAN DEFAULT true,
  price_drop_alerts BOOLEAN DEFAULT false,
  reminder_before_concert INTEGER DEFAULT 24, -- hours before
  
  -- Content Preferences
  preferred_languages TEXT[] DEFAULT '{}',
  preferred_concert_duration TEXT DEFAULT 'any', -- short, medium, long, any
  include_contemporary BOOLEAN DEFAULT true,
  include_early_music BOOLEAN DEFAULT true,
  
  -- Display & Interface
  default_view_mode TEXT DEFAULT 'list', -- list, grid, calendar
  concerts_per_page INTEGER DEFAULT 12,
  auto_play_audio_previews BOOLEAN DEFAULT false,
  
  -- Privacy Settings
  profile_visibility TEXT DEFAULT 'public', -- public, friends, private
  share_concert_attendance BOOLEAN DEFAULT true,
  allow_recommendations BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage their own preferences" 
ON public.user_preferences 
FOR ALL
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_user_preferences_updated_at
BEFORE UPDATE ON public.user_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create unique constraint on user_id
ALTER TABLE public.user_preferences 
ADD CONSTRAINT user_preferences_user_id_unique UNIQUE (user_id);

-- Create function to get or create user preferences
CREATE OR REPLACE FUNCTION public.get_or_create_user_preferences(user_id_param UUID)
RETURNS public.user_preferences
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result public.user_preferences;
BEGIN
  -- Try to get existing preferences
  SELECT * INTO result 
  FROM public.user_preferences 
  WHERE user_id = user_id_param;
  
  -- If no preferences exist, create default ones
  IF NOT FOUND THEN
    INSERT INTO public.user_preferences (user_id)
    VALUES (user_id_param)
    RETURNING * INTO result;
  END IF;
  
  RETURN result;
END;
$$;