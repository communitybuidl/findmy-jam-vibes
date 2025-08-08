-- Create messages table for direct messaging between connected users
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    read_at TIMESTAMP WITH TIME ZONE NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS (Row Level Security) policies
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Users can see messages where they are involved (either as sender or receiver)
CREATE POLICY "Users can view their own messages" ON messages 
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id::uuid FROM profiles WHERE id = sender_id OR id = receiver_id
        )
    );

-- Users can send messages to connected users only
CREATE POLICY "Users can send messages to connections" ON messages 
    FOR INSERT WITH CHECK (
        auth.uid() = (SELECT user_id::uuid FROM profiles WHERE id = sender_id)
        AND EXISTS (
            SELECT 1 FROM connections 
            WHERE status = 'accepted' 
            AND (
                (requester_id = sender_id AND receiver_id = messages.receiver_id) 
                OR (requester_id = messages.receiver_id AND receiver_id = sender_id)
            )
        )
    );

-- Users can update their received messages (to mark as read)
CREATE POLICY "Users can update received messages" ON messages 
    FOR UPDATE USING (
        auth.uid() = (SELECT user_id::uuid FROM profiles WHERE id = receiver_id)
    ) WITH CHECK (
        auth.uid() = (SELECT user_id::uuid FROM profiles WHERE id = receiver_id)
    );

-- Create indexes for better performance
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_receiver ON messages(receiver_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_messages_read_at ON messages(read_at);

-- Create composite index for conversation queries
CREATE INDEX idx_messages_conversation ON messages(sender_id, receiver_id, created_at);

-- Create function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_messages_updated_at
    BEFORE UPDATE ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_messages_updated_at();