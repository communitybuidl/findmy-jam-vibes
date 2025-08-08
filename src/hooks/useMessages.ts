import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  read_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  user1_id: string;
  user2_id: string;
  last_message: string;
  last_message_at: string;
  last_message_sender_id: string;
  unread_count: number;
}

export const useMessages = (conversationPartnerId?: string) => {
  const queryClient = useQueryClient();

  // Get conversations (message threads)
  const { data: conversations, isLoading: conversationsLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) return [];

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', session.session.user.id)
        .single();

      if (!profile) return [];

      const { data, error } = await supabase
        .rpc('get_user_conversations', { user_profile_id: profile.id });

      if (error) throw error;
      return data;
    },
  });

  // Get messages for a specific conversation
  const { data: messages, isLoading: messagesLoading } = useQuery({
    queryKey: ['messages', conversationPartnerId],
    queryFn: async () => {
      if (!conversationPartnerId) return [];

      const { data: session } = await supabase.auth.getSession();
      if (!session.session) return [];

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', session.session.user.id)
        .single();

      if (!profile) return [];

      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(id, display_name, avatar_url),
          receiver:profiles!messages_receiver_id_fkey(id, display_name, avatar_url)
        `)
        .or(
          `and(sender_id.eq.${profile.id},receiver_id.eq.${conversationPartnerId}),` +
          `and(sender_id.eq.${conversationPartnerId},receiver_id.eq.${profile.id})`
        )
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!conversationPartnerId,
  });

  // Send a message
  const sendMessage = useMutation({
    mutationFn: async ({ receiverId, content }: { receiverId: string; content: string }) => {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) throw new Error('Not authenticated');

      const { data: senderProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', session.session.user.id)
        .single();

      if (!senderProfile) throw new Error('Profile not found');

      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: senderProfile.id,
          receiver_id: receiverId,
          content: content.trim()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send message.',
        variant: 'destructive',
      });
    },
  });

  // Mark messages as read
  const markAsRead = useMutation({
    mutationFn: async (messageIds: string[]) => {
      const { data, error } = await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .in('id', messageIds)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });

  return {
    conversations,
    conversationsLoading,
    messages,
    messagesLoading,
    sendMessage,
    markAsRead,
  };
};