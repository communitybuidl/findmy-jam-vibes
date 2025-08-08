import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface ProfileRow {
  id: string;
  display_name: string;
  avatar_url: string | null;
  genres: string[] | null;
  role: string;
}

const Discover = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("");
  const [params] = useSearchParams();
  const canonical = useMemo(() => (typeof window !== "undefined" ? window.location.href : ""), []);

  const { data, isLoading } = useQuery({
    queryKey: ["profiles"],
    queryFn: async (): Promise<ProfileRow[]> => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, display_name, avatar_url, genres, role")
        .limit(60);
      if (error) throw error;
      return data as unknown as ProfileRow[];
    },
  });

  const filtered = (data || []).filter((p) => {
    const q = search.trim().toLowerCase();
    const matchesText = !q || p.display_name.toLowerCase().includes(q);
    const matchesGenre = !genre || (p.genres || []).some((g) => g.toLowerCase().includes(genre.toLowerCase()));
    return matchesText && matchesGenre;
  });

  const handleConnect = async (profileId: string) => {
    const { data } = await supabase.auth.getSession();
    const session = data.session;
    const backTo = params.get("redirect") || "/discover";
    if (!session) {
      navigate(`/auth?redirect=${encodeURIComponent(backTo)}`);
      return;
    }
    // Placeholder for actual connect flow
    alert(`Connection request coming soon for profile ${profileId}`);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet>
        <title>Discover musicians near you | FindmyJam</title>
        <meta name="description" content="Browse musician profiles and match by genre without logging in. Connect when you're ready." />
        <link rel="canonical" href={canonical} />
      </Helmet>

      <main>
        <section className="py-10 md:py-16 border-b border-border/60">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Find musicians to jam with</h1>
            <p className="text-muted-foreground mb-6">Browse publicly visible profiles. Log in only when you want to connect.</p>

            <div className="grid gap-3 md:grid-cols-3 mb-8">
              <Input
                placeholder="Search by name"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Input
                placeholder="Filter by genre (e.g., rock, jazz)"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
              />
              <div className="flex items-center gap-2">
                <Button variant="secondary" onClick={() => { setSearch(""); setGenre(""); }}>Clear</Button>
              </div>
            </div>

            {isLoading ? (
              <p className="text-muted-foreground">Loading profiles…</p>
            ) : (
              <div className="grid gap-6 md:grid-cols-3">
                {filtered.map((p) => (
                  <Card key={p.id} className="border border-border shadow-elegant">
                    <CardHeader>
                      <div className="flex items-center gap-4">
                        <img
                          src={p.avatar_url || "/placeholder.svg"}
                          alt={`Avatar of ${p.display_name} musician profile`}
                          className="h-14 w-14 rounded-full border border-border object-cover"
                          loading="lazy"
                        />
                        <div>
                          <CardTitle className="text-lg">{p.display_name}</CardTitle>
                          <p className="text-xs text-muted-foreground capitalize">{p.role}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        {(p.genres && p.genres.length) ? p.genres.join(", ") : "No genres listed"}
                      </p>
                      <Button variant="hero" onClick={() => handleConnect(p.id)}>Connect</Button>
                    </CardContent>
                  </Card>
                ))}
                {!filtered.length && (
                  <p className="text-muted-foreground">No profiles match your filters.</p>
                )}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Discover;
