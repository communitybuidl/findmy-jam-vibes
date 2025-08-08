-- Create music_links table for portfolio links
CREATE TABLE IF NOT EXISTS music_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    service TEXT NOT NULL,
    url TEXT NOT NULL,
    display_name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE music_links ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view music links
CREATE POLICY "Music links are viewable by everyone" ON music_links
    FOR SELECT
    USING (true);

-- Policy: Users can only insert/update/delete their own profile's music links
CREATE POLICY "Users can manage their own music links" ON music_links
    FOR ALL
    USING (
        profile_id IN (
            SELECT id FROM profiles WHERE user_id = auth.uid()
        )
    );

-- Add indexes for performance
CREATE INDEX music_links_profile_id_idx ON music_links(profile_id);