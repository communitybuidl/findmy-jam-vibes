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
DROP POLICY IF EXISTS "Music links are viewable by everyone" ON music_links;
CREATE POLICY "Music links are viewable by everyone" ON music_links
    FOR SELECT
    USING (true);

-- Policy: Users can only insert/update/delete their own profile's music links
DROP POLICY IF EXISTS "Users can manage their own music links" ON music_links;
CREATE POLICY "Users can manage their own music links" ON music_links
    FOR ALL
    USING (
        profile_id IN (
            SELECT id FROM profiles WHERE user_id = auth.uid()
        )
    );

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS music_links_profile_id_idx ON music_links(profile_id);

-- Insert some sample music links for the existing profiles
INSERT INTO music_links (profile_id, service, url, display_name, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'spotify', 'https://open.spotify.com/artist/example1', 'Alex Rodriguez Music', NOW()),
('550e8400-e29b-41d4-a716-446655440001', 'soundcloud', 'https://soundcloud.com/alexrodriguez', 'Alex Rodriguez', NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'youtube', 'https://youtube.com/@mayachen', 'Maya Chen Official', NOW()),
('550e8400-e29b-41d4-a716-446655440003', 'bandcamp', 'https://jordankim.bandcamp.com', 'Jordan Kim', NOW()),
('550e8400-e29b-41d4-a716-446655440004', 'spotify', 'https://open.spotify.com/artist/example4', 'Sam Taylor Beats', NOW()),
('550e8400-e29b-41d4-a716-446655440005', 'soundcloud', 'https://soundcloud.com/rileyjohnson', 'Riley Johnson', NOW()),
('550e8400-e29b-41d4-a716-446655440006', 'youtube', 'https://youtube.com/@caseymartinez', 'Casey Martinez Music', NOW()),
('550e8400-e29b-41d4-a716-446655440008', 'spotify', 'https://open.spotify.com/artist/example8', 'Morgan Davis Country', NOW())
ON CONFLICT DO NOTHING;