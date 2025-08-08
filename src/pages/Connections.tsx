import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ConnectionRequestCard } from '@/components/ConnectionRequestCard';
import { useConnections } from '@/hooks/useConnections';
import { supabase } from '@/integrations/supabase/client';
import { Users, UserPlus, UserCheck, ArrowLeft, MessageCircle } from 'lucide-react';

const Connections = () => {
  const navigate = useNavigate();
  const { connections, isLoading } = useConnections();
  const [currentProfile, setCurrentProfile] = useState<{ id: string } | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        navigate('/auth?redirect=/connections');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', data.session.user.id)
        .single();

      setCurrentProfile(profile);
    };

    checkAuth();
  }, [navigate]);

  if (!currentProfile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  const pendingRequests = connections?.filter(
    conn => conn.status === 'pending' && conn.receiver_id === currentProfile.id
  ) || [];

  const sentRequests = connections?.filter(
    conn => conn.status === 'pending' && conn.requester_id === currentProfile.id
  ) || [];

  const acceptedConnections = connections?.filter(
    conn => conn.status === 'accepted'
  ) || [];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet>
        <title>Connections | FindmyJam</title>
        <meta name="description" content="Manage your musician connections and friend requests." />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between gap-4 mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/discover')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Discover
          </Button>
          
          <div className="flex items-center gap-2">
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
              variant="ghost"
              size="sm"
              onClick={async () => {
                await supabase.auth.signOut();
                navigate('/');
              }}
              className="flex items-center gap-2 text-destructive hover:text-destructive"
            >
              <Users className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Connections</h1>
          <p className="text-muted-foreground">
            Manage your musician connections and collaboration requests.
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading connections...</p>
          </div>
        ) : (
          <Tabs defaultValue="requests" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="requests" className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Requests ({pendingRequests.length})
              </TabsTrigger>
              <TabsTrigger value="sent" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Sent ({sentRequests.length})
              </TabsTrigger>
              <TabsTrigger value="connected" className="flex items-center gap-2">
                <UserCheck className="h-4 w-4" />
                Connected ({acceptedConnections.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="requests" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Incoming Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  {pendingRequests.length > 0 ? (
                    <div className="space-y-4">
                      {pendingRequests.map((connection) => (
                        <ConnectionRequestCard
                          key={connection.id}
                          connection={connection}
                          currentUserId={currentProfile.id}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <UserPlus className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No pending requests</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sent" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Sent Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  {sentRequests.length > 0 ? (
                    <div className="space-y-4">
                      {sentRequests.map((connection) => (
                        <ConnectionRequestCard
                          key={connection.id}
                          connection={connection}
                          currentUserId={currentProfile.id}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No sent requests</p>
                      <Button 
                        className="mt-4" 
                        onClick={() => navigate('/discover')}
                      >
                        Find Musicians
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="connected" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Connected Musicians</CardTitle>
                </CardHeader>
                <CardContent>
                  {acceptedConnections.length > 0 ? (
                    <div className="space-y-4">
                      {acceptedConnections.map((connection) => (
                        <div key={connection.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <ConnectionRequestCard
                            connection={connection}
                            currentUserId={currentProfile.id}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const partnerId = connection.requester_id === currentProfile.id 
                                ? connection.receiver_id 
                                : connection.requester_id;
                              navigate(`/messages?partner=${partnerId}`);
                            }}
                          >
                            Message
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <UserCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No connections yet</p>
                      <Button 
                        className="mt-4" 
                        onClick={() => navigate('/discover')}
                      >
                        Find Musicians
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default Connections;