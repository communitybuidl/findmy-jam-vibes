-- Create concerts table
CREATE TABLE public.concerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  date DATE NOT NULL,
  venue TEXT,
  city TEXT,
  image_url TEXT,
  description TEXT,
  min_interested INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create concert_interests table to track user interest
CREATE TABLE public.concert_interests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  concert_id UUID NOT NULL REFERENCES public.concerts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(concert_id, user_id)
);

-- Enable RLS
ALTER TABLE public.concerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.concert_interests ENABLE ROW LEVEL SECURITY;

-- RLS policies for concerts (public read access)
CREATE POLICY "Concerts are viewable by everyone" 
ON public.concerts 
FOR SELECT 
USING (true);

-- RLS policies for concert_interests
CREATE POLICY "Users can view all concert interests" 
ON public.concert_interests 
FOR SELECT 
USING (true);

CREATE POLICY "Users can express their own interest" 
ON public.concert_interests 
FOR INSERT 
WITH CHECK (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can remove their own interest" 
ON public.concert_interests 
FOR DELETE 
USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Insert the three concerts
INSERT INTO public.concerts (title, artist, date, venue, city, description) VALUES
('AP DHILLON Live in Dubai', 'AP DHILLON', '2025-09-07', 'TBA', 'Dubai', 'Experience AP Dhillon live in concert'),
('I AM HOME', 'SUNIDHI CHAUHAN', '2025-09-13', 'TBA', 'Dubai', 'Sunidhi Chauhan presents "I Am Home" live in Dubai'),
('Arrival of the Ethereal World Tour', 'AGAM', '2025-09-20', 'Al Nasr Leisureland', 'Dubai', 'Agam Live – Arrival of the Ethereal World Tour in Dubai');