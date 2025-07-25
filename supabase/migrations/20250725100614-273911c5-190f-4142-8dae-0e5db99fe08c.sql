-- Create enum types for better data consistency
CREATE TYPE public.entry_type AS ENUM ('recording', 'concert');
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user roles table
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Create composers table
CREATE TABLE public.composers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  birth_year INTEGER,
  death_year INTEGER,
  nationality TEXT,
  period TEXT, -- e.g., 'Baroque', 'Classical', 'Romantic', 'Contemporary'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create pieces table
CREATE TABLE public.pieces (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  composer_id UUID NOT NULL REFERENCES public.composers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  opus_number TEXT,
  catalog_number TEXT, -- For BWV, K., etc.
  genre TEXT, -- Symphony, Concerto, Sonata, etc.
  key_signature TEXT,
  duration_minutes INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create recordings table
CREATE TABLE public.recordings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  piece_id UUID NOT NULL REFERENCES public.pieces(id) ON DELETE CASCADE,
  conductor TEXT,
  orchestra TEXT,
  soloists TEXT,
  label TEXT,
  release_year INTEGER,
  album_title TEXT,
  cover_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create concerts table
CREATE TABLE public.concerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  venue TEXT NOT NULL,
  location TEXT NOT NULL,
  concert_date DATE NOT NULL,
  start_time TIME,
  conductor TEXT,
  orchestra TEXT,
  soloists TEXT,
  program TEXT, -- JSON array of piece IDs or text description
  ticket_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user entries table (for both recording and concert logs)
CREATE TABLE public.user_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entry_type entry_type NOT NULL,
  recording_id UUID REFERENCES public.recordings(id) ON DELETE CASCADE,
  concert_id UUID REFERENCES public.concerts(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  notes TEXT,
  tags TEXT[], -- Array of tags
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT valid_entry_reference CHECK (
    (entry_type = 'recording' AND recording_id IS NOT NULL AND concert_id IS NULL) OR
    (entry_type = 'concert' AND concert_id IS NOT NULL AND recording_id IS NULL)
  )
);

-- Create user favorites table
CREATE TABLE public.user_favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recording_id UUID REFERENCES public.recordings(id) ON DELETE CASCADE,
  concert_id UUID REFERENCES public.concerts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT valid_favorite_reference CHECK (
    (recording_id IS NOT NULL AND concert_id IS NULL) OR
    (concert_id IS NOT NULL AND recording_id IS NULL)
  ),
  UNIQUE(user_id, recording_id),
  UNIQUE(user_id, concert_id)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.composers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pieces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.concerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" 
ON public.profiles FOR SELECT 
USING (true);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles" 
ON public.user_roles FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles" 
ON public.user_roles FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for composers, pieces, recordings, concerts (public read, admin write)
CREATE POLICY "Anyone can view composers" 
ON public.composers FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage composers" 
ON public.composers FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can view pieces" 
ON public.pieces FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage pieces" 
ON public.pieces FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can view recordings" 
ON public.recordings FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage recordings" 
ON public.recordings FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can view concerts" 
ON public.concerts FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage concerts" 
ON public.concerts FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for user entries
CREATE POLICY "Users can manage their own entries" 
ON public.user_entries FOR ALL 
USING (auth.uid() = user_id);

-- RLS Policies for user favorites
CREATE POLICY "Users can manage their own favorites" 
ON public.user_favorites FOR ALL 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_composers_updated_at
  BEFORE UPDATE ON public.composers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pieces_updated_at
  BEFORE UPDATE ON public.pieces
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_recordings_updated_at
  BEFORE UPDATE ON public.recordings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_concerts_updated_at
  BEFORE UPDATE ON public.concerts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_entries_updated_at
  BEFORE UPDATE ON public.user_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  -- Create profile for new user
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'display_name');
  
  -- Assign default user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for better performance
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_pieces_composer_id ON public.pieces(composer_id);
CREATE INDEX idx_recordings_piece_id ON public.recordings(piece_id);
CREATE INDEX idx_user_entries_user_id ON public.user_entries(user_id);
CREATE INDEX idx_user_entries_recording_id ON public.user_entries(recording_id);
CREATE INDEX idx_user_entries_concert_id ON public.user_entries(concert_id);
CREATE INDEX idx_user_favorites_user_id ON public.user_favorites(user_id);
CREATE INDEX idx_concerts_date ON public.concerts(concert_date);