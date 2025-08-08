-- Create music_links table first if it doesn't exist
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

-- Insert sample profiles for testing
-- Note: These are test profiles that will be created with placeholder user_ids
-- In production, profiles are created through the ensure_profile() function when users sign up

INSERT INTO profiles (id, user_id, display_name, avatar_url, genres, role, created_at) VALUES 
(
    '550e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440001', 
    'Alex Rodriguez',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    ARRAY['rock', 'indie', 'alternative'],
    'musician',
    NOW()
),
(
    '550e8400-e29b-41d4-a716-446655440002',
    '550e8400-e29b-41d4-a716-446655440002',
    'Maya Chen', 
    'https://images.unsplash.com/photo-1494790108755-2616c28ca2b6?w=150&h=150&fit=crop&crop=face',
    ARRAY['jazz', 'blues', 'soul'],
    'musician',
    NOW()
),
(
    '550e8400-e29b-41d4-a716-446655440003',
    '550e8400-e29b-41d4-a716-446655440003',
    'Jordan Kim',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face', 
    ARRAY['hip-hop', 'r&b', 'funk'],
    'musician',
    NOW()
),
(
    '550e8400-e29b-41d4-a716-446655440004',
    '550e8400-e29b-41d4-a716-446655440004',
    'Sam Taylor',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    ARRAY['electronic', 'ambient', 'techno'],
    'musician',
    NOW()
),
(
    '550e8400-e29b-41d4-a716-446655440005',
    '550e8400-e29b-41d4-a716-446655440005',
    'Riley Johnson',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    ARRAY['punk', 'metal', 'hardcore'],
    'musician',
    NOW()
),
(
    '550e8400-e29b-41d4-a716-446655440006',
    '550e8400-e29b-41d4-a716-446655440006',
    'Casey Martinez',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
    ARRAY['folk', 'acoustic', 'indie'],
    'musician',
    NOW()
),
(
    '550e8400-e29b-41d4-a716-446655440007',
    '550e8400-e29b-41d4-a716-446655440007',
    'Avery Lopez',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    ARRAY['classical', 'jazz', 'fusion'],
    'musician',
    NOW()
),
(
    '550e8400-e29b-41d4-a716-446655440008',
    '550e8400-e29b-41d4-a716-446655440008',
    'Morgan Davis',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
    ARRAY['country', 'blues', 'americana'],
    'musician',
    NOW()
);

-- Insert some sample music links for these profiles
INSERT INTO music_links (profile_id, service, url, display_name, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'spotify', 'https://open.spotify.com/artist/example1', 'Alex Rodriguez Music', NOW()),
('550e8400-e29b-41d4-a716-446655440001', 'soundcloud', 'https://soundcloud.com/alexrodriguez', 'Alex Rodriguez', NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'youtube', 'https://youtube.com/@mayachen', 'Maya Chen Official', NOW()),
('550e8400-e29b-41d4-a716-446655440003', 'bandcamp', 'https://jordankim.bandcamp.com', 'Jordan Kim', NOW()),
('550e8400-e29b-41d4-a716-446655440004', 'spotify', 'https://open.spotify.com/artist/example4', 'Sam Taylor Beats', NOW()),
('550e8400-e29b-41d4-a716-446655440005', 'soundcloud', 'https://soundcloud.com/rileyjohnson', 'Riley Johnson', NOW()),
('550e8400-e29b-41d4-a716-446655440006', 'youtube', 'https://youtube.com/@caseymartinez', 'Casey Martinez Music', NOW()),
('550e8400-e29b-41d4-a716-446655440008', 'spotify', 'https://open.spotify.com/artist/example8', 'Morgan Davis Country', NOW());

-- Add some sample connections to demonstrate the feature
INSERT INTO connections (requester_id, receiver_id, status, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'accepted', NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day'),
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', 'pending', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
('550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', 'pending', NOW() - INTERVAL '3 hours', NOW() - INTERVAL '3 hours'),
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440005', 'accepted', NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days'),
('550e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440007', 'accepted', NOW() - INTERVAL '1 week', NOW() - INTERVAL '6 days');

-- Add some sample messages between connected users
INSERT INTO messages (sender_id, receiver_id, content, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'Hey Maya! Love your jazz style. Want to collaborate on something?', NOW() - INTERVAL '1 day'),
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'Thanks Alex! That sounds awesome. I was thinking of doing a jazz-rock fusion piece.', NOW() - INTERVAL '23 hours'),
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'Perfect! I have a rehearsal space we could use. When are you free this week?', NOW() - INTERVAL '22 hours'),
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440005', 'Hey Riley! Your drumming is incredible. Any interest in forming a trio?', NOW() - INTERVAL '2 days'),
('550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440002', 'Absolutely! Been looking for a good vocalist. What style are you thinking?', NOW() - INTERVAL '1 day'),
('550e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440007', 'Your classical training is amazing. Would love to learn some techniques.', NOW() - INTERVAL '3 days'),
('550e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440006', 'Thanks! I love your folk style too. Maybe we can do a classical-folk crossover?', NOW() - INTERVAL '2 days');