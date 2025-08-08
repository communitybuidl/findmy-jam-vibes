-- Create a simpler approach: Create a function to get conversations for the current user
-- Since views don't support RLS, we'll handle security in the application layer

CREATE OR REPLACE FUNCTION get_user_conversations(user_profile_id UUID)
RETURNS TABLE (
    user1_id UUID,
    user2_id UUID,
    last_message TEXT,
    last_message_at TIMESTAMPTZ,
    last_message_sender_id UUID,
    unread_count BIGINT
) 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT
        CASE 
            WHEN m.sender_id < m.receiver_id THEN m.sender_id 
            ELSE m.receiver_id 
        END as user1_id,
        CASE 
            WHEN m.sender_id < m.receiver_id THEN m.receiver_id 
            ELSE m.sender_id 
        END as user2_id,
        (
            SELECT content 
            FROM messages m2 
            WHERE (m2.sender_id = m.sender_id AND m2.receiver_id = m.receiver_id)
               OR (m2.sender_id = m.receiver_id AND m2.receiver_id = m.sender_id)
            ORDER BY created_at DESC 
            LIMIT 1
        ) as last_message,
        (
            SELECT m2.created_at 
            FROM messages m2 
            WHERE (m2.sender_id = m.sender_id AND m2.receiver_id = m.receiver_id)
               OR (m2.sender_id = m.receiver_id AND m2.receiver_id = m.sender_id)
            ORDER BY created_at DESC 
            LIMIT 1
        ) as last_message_at,
        (
            SELECT m2.sender_id 
            FROM messages m2 
            WHERE (m2.sender_id = m.sender_id AND m2.receiver_id = m.receiver_id)
               OR (m2.sender_id = m.receiver_id AND m2.receiver_id = m.sender_id)
            ORDER BY created_at DESC 
            LIMIT 1
        ) as last_message_sender_id,
        (
            SELECT COUNT(*) 
            FROM messages m2 
            WHERE m2.receiver_id = user_profile_id
            AND m2.read_at IS NULL
            AND (
                (m2.sender_id = m.sender_id AND m2.receiver_id = m.receiver_id)
                OR (m2.sender_id = m.receiver_id AND m2.receiver_id = m.sender_id)
            )
        ) as unread_count
    FROM messages m
    WHERE m.sender_id = user_profile_id OR m.receiver_id = user_profile_id;
END;
$$;