import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useConnections } from "@/hooks/useConnections";
import { Users, MessageCircle, LogOut, Home, User, ExternalLink } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface ProfileRow {
  id: string;
  display_name: string;
  avatar_url: string | null;
  genres: string[] | null;
  role: string;
  location?: string | null;
  city?: string | null;
  country?: string | null;
  music_links?: Array<{
    service: string;
    url: string;
    display_name: string;
  }>;
}

const Discover = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [params] = useSearchParams();
  const canonical = useMemo(() => (typeof window !== "undefined" ? window.location.href : ""), []);
  const { sendConnectionRequest, connections } = useConnections();
  const [currentProfile, setCurrentProfile] = useState<{ id: string } | null>(null);
  const { session, loading: authLoading } = useAuth();
  

  // Direct fetch for profiles data
  const [data, setData] = useState<ProfileRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    const fetchProfiles = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const { data: profiles, error: profileError } = await supabase
          .from("profiles")
          .select(`
            id, 
            display_name, 
            avatar_url, 
            genres, 
            role,
            location,
            city,
            country,
            music_links(service, url, display_name)
          `)
          .limit(60);
        
        if (profileError) {
          setError(profileError);
        } else {
          setData(profiles || []);
        }
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfiles();
  }, []);
  
  const refetch = () => {
    // Could implement refetch logic here if needed
  };

  useEffect(() => {
    const getCurrentProfile = async () => {
      if (session?.user) {
        try {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('id')
            .eq('user_id', session.user.id)
            .single();
          
          if (!error && profile) {
            setCurrentProfile(profile);
          }
        } catch (error) {
          // Silently handle profile fetch errors
        }
      } else {
        setCurrentProfile(null);
      }
    };
    getCurrentProfile();
  }, [session]);

  const filtered = (data || []).filter((p) => {
    const q = search.trim().toLowerCase();
    const matchesText = !q || p.display_name.toLowerCase().includes(q);
    const matchesGenre = !genre || (p.genres || []).some((g) => g.toLowerCase().includes(genre.toLowerCase()));
    
    const locationQuery = locationFilter.trim().toLowerCase();
    const matchesLocation = !locationQuery || 
      (p.city && p.city.toLowerCase().includes(locationQuery)) ||
      (p.country && p.country.toLowerCase().includes(locationQuery)) ||
      (p.location && p.location.toLowerCase().includes(locationQuery));
    
    return matchesText && matchesGenre && matchesLocation;
  });

  const getConnectionStatus = (profileId: string) => {
    if (!currentProfile || !connections) return null;
    
    return connections.find(conn => 
      (conn.requester_id === currentProfile.id && conn.receiver_id === profileId) ||
      (conn.receiver_id === currentProfile.id && conn.requester_id === profileId)
    );
  };

  const handleConnect = async (profileId: string) => {
    const { data } = await supabase.auth.getSession();
    const session = data.session;
    const backTo = params.get("redirect") || "/discover";
    if (!session) {
      navigate(`/auth?redirect=${encodeURIComponent(backTo)}`);
      return;
    }

    if (!currentProfile) {
      return;
    }

    const existingConnection = getConnectionStatus(profileId);
    
    if (existingConnection) {
      if (existingConnection.status === 'accepted') {
        // Already connected, go to messages
        navigate(`/messages?partner=${profileId}`);
      } else if (existingConnection.status === 'pending') {
        // Request pending
        return;
      }
    } else {
      // Send new connection request
      sendConnectionRequest.mutate(profileId);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: 'Signed out',
        description: 'You have been signed out successfully.',
      });
      
      navigate('/');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to sign out.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet>
        <title>Discover musicians near you | FindmyJam</title>
        <meta name="description" content="Browse musician profiles and match by genre without logging in. Connect when you're ready." />
        <link rel="canonical" href={canonical} />
      </Helmet>

      {/* Navigation Header */}
      {!authLoading && (
        <header className="sticky top-0 z-30 w-full border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="flex items-center gap-2"
              >
                <Home className="h-4 w-4" />
                Home
              </Button>
              <h2 className="font-semibold text-lg">Discover Musicians</h2>
            </div>
            
            <div className="flex items-center gap-2">
              {session ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/connections')}
                    className="flex items-center gap-2"
                  >
                    <Users className="h-4 w-4" />
                    Connections
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/messages')}
                    className="flex items-center gap-2"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Messages
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/profile-setup?edit=true')}
                    className="flex items-center gap-2"
                  >
                    <User className="h-4 w-4" />
                    Profile
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-destructive hover:text-destructive"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/auth')}
                    className="flex items-center gap-2"
                  >
                    Log In
                  </Button>
                  <Button
                    variant="hero"
                    size="sm"
                    onClick={() => navigate('/auth')}
                    className="flex items-center gap-2"
                  >
                    Sign Up
                  </Button>
                </>
              )}
            </div>
          </div>
        </header>
      )}

      <main>
        <section className="py-10 md:py-16 border-b border-border/60">
          <div className="container mx-auto px-4">
            
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Find musicians to jam with</h1>
            <p className="text-muted-foreground mb-6">Browse publicly visible profiles. Log in only when you want to connect.</p>

            <div className="grid gap-3 md:grid-cols-4 mb-8">
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
              <Input
                placeholder="Filter by location (city, country)"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
              />
              <div className="flex items-center gap-2">
                <Button variant="secondary" onClick={() => { setSearch(""); setGenre(""); setLocationFilter(""); }}>Clear</Button>
              </div>
            </div>

            {authLoading ? (
              <p className="text-muted-foreground">Initializing…</p>
            ) : isLoading ? (
              <p className="text-muted-foreground">Loading profiles…</p>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-destructive mb-4">Failed to load profiles. Please try again.</p>
                <Button variant="outline" onClick={() => refetch()}>
                  Retry
                </Button>
              </div>
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
                          {(p.city || p.country || p.location) && (
                            <p className="text-xs text-muted-foreground">
                              📍 {[p.city, p.location, p.country].filter(Boolean).join(', ')}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        {(p.genres && p.genres.length) ? p.genres.join(", ") : "No genres listed"}
                      </p>
                      
                      {/* Portfolio Links */}
                      {(() => {
                        console.log('Portfolio links for', p.display_name, ':', p.music_links);
                        return p.music_links && p.music_links.length > 0 && (
                          <div className="mb-4">
                            <p className="text-xs font-medium text-muted-foreground mb-2">Portfolio:</p>
                            <div className="flex flex-wrap gap-2">
                              {p.music_links.map((link, index) => (
                                <a
                                  key={index}
                                  href={link.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-accent hover:bg-accent/80 rounded-md transition-colors"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                  {link.display_name}
                                </a>
                              ))}
                            </div>
                          </div>
                        );
                      })()}
                      {(() => {
                        const connection = getConnectionStatus(p.id);
                        const isCurrentUser = currentProfile?.id === p.id;
                        
                        if (isCurrentUser) {
                          return null; // Don't show button for current user
                        }
                        
                        if (!connection) {
                          return (
                            <Button 
                              variant="hero" 
                              onClick={() => handleConnect(p.id)}
                              disabled={sendConnectionRequest.isPending}
                            >
                              <Users className="h-4 w-4 mr-2" />
                              Connect
                            </Button>
                          );
                        }
                        
                        if (connection.status === 'pending') {
                          const isRequester = connection.requester_id === currentProfile?.id;
                          return (
                            <Button variant="outline" disabled>
                              {isRequester ? 'Request Sent' : 'Request Received'}
                            </Button>
                          );
                        }
                        
                        if (connection.status === 'accepted') {
                          return (
                            <Button 
                              variant="secondary" 
                              onClick={() => handleConnect(p.id)}
                            >
                              <MessageCircle className="h-4 w-4 mr-2" />
                              Message
                            </Button>
                          );
                        }
                        
                        return (
                          <Button 
                            variant="hero" 
                            onClick={() => handleConnect(p.id)}
                            disabled={sendConnectionRequest.isPending}
                          >
                            <Users className="h-4 w-4 mr-2" />
                            Connect
                          </Button>
                        );
                      })()}
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
