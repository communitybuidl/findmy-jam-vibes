import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface Concert {
  id: string;
  title: string;
  artist: string;
  date: string;
  venue: string | null;
  city: string | null;
  image_url: string | null;
  description: string | null;
  min_interested: number;
  created_at: string;
}

export interface ConcertInterest {
  id: string;
  concert_id: string;
  user_id: string;
  created_at: string;
}

export const useConcerts = () => {
  return useQuery({
    queryKey: ['concerts'],
    queryFn: async (): Promise<Concert[]> => {
      const { data, error } = await supabase
        .from('concerts')
        .select('*')
        .order('date', { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });
};

export const useConcertInterests = (concertId: string) => {
  return useQuery({
    queryKey: ['concert-interests', concertId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('concert_interests')
        .select('*')
        .eq('concert_id', concertId);

      if (error) throw error;
      return data || [];
    },
  });
};

export const useExpressInterest = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ concertId, profileId }: { concertId: string; profileId: string }) => {
      if (!user) throw new Error('Must be logged in to express interest');

      const { data, error } = await supabase
        .from('concert_interests')
        .insert({
          concert_id: concertId,
          user_id: profileId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, { concertId }) => {
      queryClient.invalidateQueries({ queryKey: ['concert-interests', concertId] });
      toast({
        title: "Interest expressed!",
        description: "We'll notify you if we get group discounts for this concert.",
      });
    },
    onError: (error: any) => {
      if (error.message?.includes('duplicate')) {
        toast({
          title: "Already interested",
          description: "You've already expressed interest in this concert.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to express interest. Please try again.",
          variant: "destructive",
        });
      }
    },
  });
};

export const useRemoveInterest = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ concertId, profileId }: { concertId: string; profileId: string }) => {
      if (!user) throw new Error('Must be logged in');

      const { error } = await supabase
        .from('concert_interests')
        .delete()
        .eq('concert_id', concertId)
        .eq('user_id', profileId);

      if (error) throw error;
    },
    onSuccess: (_, { concertId }) => {
      queryClient.invalidateQueries({ queryKey: ['concert-interests', concertId] });
      toast({
        title: "Interest removed",
        description: "You're no longer interested in this concert.",
      });
    },
  });
};