-- Add missing location fields to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS country TEXT;

-- Create function to get current user's profile id
CREATE OR REPLACE FUNCTION current_profile_id()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (
    SELECT id FROM profiles 
    WHERE user_id = auth.uid()
  );
END;
$$;

-- Create function for getting user conversations
CREATE OR REPLACE FUNCTION get_user_conversations(user_profile_id uuid)
RETURNS TABLE(
  user1_id uuid,
  user2_id uuid,
  last_message text,
  last_message_at timestamp with time zone,
  last_message_sender_id uuid,
  unread_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH conversation_pairs AS (
    SELECT DISTINCT
      CASE WHEN m.sender_id < m.receiver_id 
           THEN m.sender_id 
           ELSE m.receiver_id END as user1_id,
      CASE WHEN m.sender_id < m.receiver_id 
           THEN m.receiver_id 
           ELSE m.sender_id END as user2_id
    FROM messages m
    WHERE user_profile_id IN (m.sender_id, m.receiver_id)
  ),
  latest_messages AS (
    SELECT DISTINCT ON (cp.user1_id, cp.user2_id)
      cp.user1_id,
      cp.user2_id,
      m.content as last_message,
      m.created_at as last_message_at,
      m.sender_id as last_message_sender_id
    FROM conversation_pairs cp
    JOIN messages m ON (
      (m.sender_id = cp.user1_id AND m.receiver_id = cp.user2_id) OR
      (m.sender_id = cp.user2_id AND m.receiver_id = cp.user1_id)
    )
    ORDER BY cp.user1_id, cp.user2_id, m.created_at DESC
  ),
  unread_counts AS (
    SELECT 
      cp.user1_id,
      cp.user2_id,
      COUNT(m.id) as unread_count
    FROM conversation_pairs cp
    LEFT JOIN messages m ON (
      m.receiver_id = user_profile_id AND
      m.read_at IS NULL AND
      ((m.sender_id = cp.user1_id AND cp.user2_id = user_profile_id) OR
       (m.sender_id = cp.user2_id AND cp.user1_id = user_profile_id))
    )
    GROUP BY cp.user1_id, cp.user2_id
  )
  SELECT 
    lm.user1_id,
    lm.user2_id,
    lm.last_message,
    lm.last_message_at,
    lm.last_message_sender_id,
    COALESCE(uc.unread_count, 0) as unread_count
  FROM latest_messages lm
  LEFT JOIN unread_counts uc ON (lm.user1_id = uc.user1_id AND lm.user2_id = uc.user2_id)
  ORDER BY lm.last_message_at DESC;
END;
$$;