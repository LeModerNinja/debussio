-- Fix security warning: Set proper search_path for the function
CREATE OR REPLACE FUNCTION public.get_or_create_user_preferences(user_id_param UUID)
RETURNS public.user_preferences
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
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