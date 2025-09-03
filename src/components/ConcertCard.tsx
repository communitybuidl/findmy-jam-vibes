import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useExpressInterest, useRemoveInterest, useConcertInterests, Concert } from "@/hooks/useConcerts";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface ConcertCardProps {
  concert: Concert;
}

export const ConcertCard = ({ concert }: ConcertCardProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isExpressing, setIsExpressing] = useState(false);
  
  const { data: interests = [] } = useConcertInterests(concert.id);
  const expressInterest = useExpressInterest();
  const removeInterest = useRemoveInterest();
  
  // Get current user's profile
  const { data: userProfile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();
      return data;
    },
    enabled: !!user,
  });

  const isUserInterested = userProfile && interests.some(interest => interest.user_id === userProfile.id);
  const interestCount = interests.length;
  const hasMinInterest = interestCount >= concert.min_interested;

  const handleExpressInterest = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (!userProfile) return;

    setIsExpressing(true);
    try {
      if (isUserInterested) {
        await removeInterest.mutateAsync({
          concertId: concert.id,
          profileId: userProfile.id,
        });
      } else {
        await expressInterest.mutateAsync({
          concertId: concert.id,
          profileId: userProfile.id,
        });
      }
    } finally {
      setIsExpressing(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Card className="overflow-hidden transition-all hover:shadow-glow">
      <div className="aspect-[16/9] bg-gradient-to-br from-primary/20 to-accent/20 relative overflow-hidden">
        {concert.image_url ? (
          <img 
            src={concert.image_url} 
            alt={concert.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-primary mb-2">{concert.artist}</h3>
              <p className="text-muted-foreground">{concert.title}</p>
            </div>
          </div>
        )}
      </div>
      
      <CardHeader>
        <CardTitle className="text-lg">{concert.artist}</CardTitle>
        <CardDescription>{concert.title}</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          {formatDate(concert.date)}
        </div>
        
        {(concert.venue || concert.city) && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            {concert.venue ? `${concert.venue}, ${concert.city}` : concert.city}
          </div>
        )}
        
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {interestCount} interested
          </span>
          {hasMinInterest && (
            <Badge variant="secondary" className="ml-2">
              Group discount eligible!
            </Badge>
          )}
        </div>
        
        {concert.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {concert.description}
          </p>
        )}
      </CardContent>
      
      <CardFooter>
        <Button
          onClick={handleExpressInterest}
          disabled={isExpressing}
          variant={isUserInterested ? "outline" : "default"}
          className="w-full"
        >
          {isExpressing ? "..." : isUserInterested ? "Remove Interest" : "Express Interest"}
        </Button>
      </CardFooter>
    </Card>
  );
};