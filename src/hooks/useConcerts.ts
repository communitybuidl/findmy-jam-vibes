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
      console.log('Fetching concerts from Supabase...');
      
      try {
        const { data, error } = await supabase
          .from('concerts')
          .select('*')
          .order('date', { ascending: true });

        if (error) {
          console.error('Supabase error:', error);
          // Return mock data for development if there's an error
          console.log('Falling back to mock data');
          return [
            {
              id: "1",
              title: "AP DHILLON Live in Dubai",
              artist: "AP DHILLON",
              date: "2025-09-07",
              venue: "Coca Cola Arena",
              city: "Dubai",
              image_url: "https://coca-cola-arena.com/files/event_banner_1332__1756820617.jpg",
              description: "Experience AP Dhillon live in concert",
              min_interested: 10,
              created_at: new Date().toISOString()
            },
            {
              id: "2", 
              title: "I AM HOME",
              artist: "SUNIDHI CHAUHAN",
              date: "2025-09-13",
              venue: "Coca Cola Arena",
              city: "Dubai",
              image_url: "https://coca-cola-arena.com/files/event_banner_1348__1752656517.jpg",
              description: "Sunidhi Chauhan presents \"I Am Home\" live in Dubai",
              min_interested: 10,
              created_at: new Date().toISOString()
            },
            {
              id: "3",
              title: "Arrival of the Ethereal World Tour", 
              artist: "AGAM",
              date: "2025-09-20",
              venue: "Al Nasr Leisureland",
              city: "Dubai",
              image_url: "https://cdn.platinumlist.net/upload/event/promo/56380_upload689a0ea0e4d37_1754926752-0-en1754926758.jpg.webp",
              description: "Agam Live – Arrival of the Ethereal World Tour in Dubai",
              min_interested: 10,
              created_at: new Date().toISOString()
            }
          ];
        }
        
        console.log('Concerts fetched successfully:', data);
        return data || [];
      } catch (err) {
        console.error('Caught error in useConcerts:', err);
        // Return mock data as fallback
        return [
          {
            id: "1",
            title: "AP DHILLON Live in Dubai",
            artist: "AP DHILLON", 
            date: "2025-09-07",
            venue: "Coca Cola Arena",
            city: "Dubai",
            image_url: "https://coca-cola-arena.com/files/event_banner_1332__1756820617.jpg",
            description: "Experience AP Dhillon live in concert",
            min_interested: 10,
            created_at: new Date().toISOString()
          }
        ];
      }
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