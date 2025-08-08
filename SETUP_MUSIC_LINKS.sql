-- Run this SQL in your Supabase Dashboard SQL Editor
-- Go to: https://supabase.com/dashboard/project/uhldzobbbqeojcudnjis/sql

-- 1. Remove any existing constraint that might block service values
ALTER TABLE music_links DROP CONSTRAINT IF EXISTS music_links_service_check;

-- 2. Create the music_links table
CREATE TABLE IF NOT EXISTS music_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    service TEXT NOT NULL,
    url TEXT NOT NULL,
    display_name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Enable Row Level Security
ALTER TABLE music_links ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies
DROP POLICY IF EXISTS "Music links are viewable by everyone" ON music_links;
CREATE POLICY "Music links are viewable by everyone" ON music_links
    FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Users can manage their own music links" ON music_links;
CREATE POLICY "Users can manage their own music links" ON music_links
    FOR ALL
    USING (
        profile_id IN (
            SELECT id FROM profiles WHERE user_id = auth.uid()
        )
    );

-- 5. Add index for performance
CREATE INDEX IF NOT EXISTS music_links_profile_id_idx ON music_links(profile_id);

-- 6. Add location fields to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS country TEXT;

-- 7. Fix profiles table to allow public viewing (for non-authenticated users on discover page)
-- Enable RLS on profiles if not already enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and create new ones
DROP POLICY IF EXISTS "Profiles are publicly viewable" ON profiles;
CREATE POLICY "Profiles are publicly viewable" ON profiles
    FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
    FOR ALL
    USING (auth.uid() = user_id);