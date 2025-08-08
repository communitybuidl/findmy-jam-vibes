import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export type ConnectionStatus = 'pending' | 'accepted' | 'declined' | 'blocked';

export interface Connection {
  id: string;
  requester_id: string;
  receiver_id: string;
  status: ConnectionStatus;
  created_at: string;
  updated_at: string;
}

export const useConnections = () => {
  const queryClient = useQueryClient();

  // Get current user's connections
  const { data: connections, isLoading } = useQuery({
    queryKey: ['connections'],
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
        .from('connections')
        .select(`
          *,
          requester:profiles!connections_requester_id_fkey(id, display_name, avatar_url),
          receiver:profiles!connections_receiver_id_fkey(id, display_name, avatar_url)
        `)
        .or(`requester_id.eq.${profile.id},receiver_id.eq.${profile.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Send connection request
  const sendConnectionRequest = useMutation({
    mutationFn: async (receiverProfileId: string) => {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) throw new Error('Not authenticated');

      const { data: senderProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', session.session.user.id)
        .single();

      if (!senderProfile) throw new Error('Profile not found');

      const { data, error } = await supabase
        .from('connections')
        .insert({
          requester_id: senderProfile.id,
          receiver_id: receiverProfileId,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connections'] });
      toast({
        title: 'Connection request sent',
        description: 'Your connection request has been sent successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send connection request.',
        variant: 'destructive',
      });
    },
  });

  // Update connection status (accept/decline)
  const updateConnectionStatus = useMutation({
    mutationFn: async ({ connectionId, status }: { connectionId: string; status: ConnectionStatus }) => {
      const { data, error } = await supabase
        .from('connections')
        .update({ status })
        .eq('id', connectionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['connections'] });
      const action = data.status === 'accepted' ? 'accepted' : 'declined';
      toast({
        title: `Connection ${action}`,
        description: `You have ${action} the connection request.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update connection.',
        variant: 'destructive',
      });
    },
  });

  return {
    connections,
    isLoading,
    sendConnectionRequest,
    updateConnectionStatus,
  };
};