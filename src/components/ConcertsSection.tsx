import { useConcerts } from "@/hooks/useConcerts";
import { ConcertCard } from "@/components/ConcertCard";
import { Skeleton } from "@/components/ui/skeleton";

export const ConcertsSection = () => {
  const { data: concerts, isLoading, error } = useConcerts();

  if (isLoading) {
    return (
      <div className="grid md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-4">
            <Skeleton className="aspect-[16/9] w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-muted-foreground">
        <p>Unable to load concerts at the moment.</p>
      </div>
    );
  }

  if (!concerts || concerts.length === 0) {
    return (
      <div className="text-center text-muted-foreground">
        <p>No upcoming concerts available.</p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {concerts.slice(0, 3).map((concert) => (
        <ConcertCard key={concert.id} concert={concert} />
      ))}
    </div>
  );
};