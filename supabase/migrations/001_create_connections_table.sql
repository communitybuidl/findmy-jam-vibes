-- Create connections table for managing friend requests and connections
CREATE TABLE connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'blocked')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(requester_id, receiver_id)
);

-- Add RLS (Row Level Security) policies
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;

-- Users can see connections where they are involved (either as requester or receiver)
CREATE POLICY "Users can view their own connections" ON connections 
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id::uuid FROM profiles WHERE id = requester_id OR id = receiver_id
        )
    );

-- Users can create connection requests
CREATE POLICY "Users can create connections" ON connections 
    FOR INSERT WITH CHECK (
        auth.uid() = (SELECT user_id::uuid FROM profiles WHERE id = requester_id)
    );

-- Users can update connections where they are the receiver (to accept/decline)
CREATE POLICY "Users can update received connections" ON connections 
    FOR UPDATE USING (
        auth.uid() = (SELECT user_id::uuid FROM profiles WHERE id = receiver_id)
    );

-- Create indexes for better performance
CREATE INDEX idx_connections_requester ON connections(requester_id);
CREATE INDEX idx_connections_receiver ON connections(receiver_id);
CREATE INDEX idx_connections_status ON connections(status);
CREATE INDEX idx_connections_created_at ON connections(created_at);

-- Create function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_connections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_connections_updated_at
    BEFORE UPDATE ON connections
    FOR EACH ROW
    EXECUTE FUNCTION update_connections_updated_at();