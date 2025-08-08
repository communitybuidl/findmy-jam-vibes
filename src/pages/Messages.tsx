import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageThread } from '@/components/MessageThread';
import { useMessages, Conversation } from '@/hooks/useMessages';
import { supabase } from '@/integrations/supabase/client';
import { MessageCircle, ArrowLeft, User } from 'lucide-react';
import { format } from 'date-fns';

const Messages = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const partnerId = searchParams.get('partner');
  
  const { conversations, conversationsLoading } = useMessages();
  const [currentProfile, setCurrentProfile] = useState<{ id: string } | null>(null);
  const [selectedPartner, setSelectedPartner] = useState<{
    id: string;
    name: string;
    avatar?: string | null;
  } | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        navigate('/auth?redirect=/messages');
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

  useEffect(() => {
    if (partnerId && currentProfile) {
      // Get partner profile info
      const fetchPartnerInfo = async () => {
        const { data: partnerProfile } = await supabase
          .from('profiles')
          .select('id, display_name, avatar_url')
          .eq('id', partnerId)
          .single();

        if (partnerProfile) {
          setSelectedPartner({
            id: partnerProfile.id,
            name: partnerProfile.display_name,
            avatar: partnerProfile.avatar_url
          });
        }
      };

      fetchPartnerInfo();
    }
  }, [partnerId, currentProfile]);

  if (!currentProfile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  const handleConversationClick = async (conversation: Conversation) => {
    // Determine which user is the partner
    const isUser1 = conversation.user1_id === currentProfile.id;
    const partnerProfileId = isUser1 ? conversation.user2_id : conversation.user1_id;

    // Get partner profile info
    const { data: partnerProfile } = await supabase
      .from('profiles')
      .select('id, display_name, avatar_url')
      .eq('id', partnerProfileId)
      .single();

    if (partnerProfile) {
      setSelectedPartner({
        id: partnerProfile.id,
        name: partnerProfile.display_name,
        avatar: partnerProfile.avatar_url
      });
      
      // Update URL
      navigate(`/messages?partner=${partnerProfile.id}`);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet>
        <title>Messages | FindmyJam</title>
        <meta name="description" content="Chat with your musician connections." />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between gap-4 mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/connections')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Connections
          </Button>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/discover')}
              className="flex items-center gap-2"
            >
              <User className="h-4 w-4" />
              Discover
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
              <MessageCircle className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Messages</h1>
          <p className="text-muted-foreground">
            Chat with your connected musicians.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Conversations List */}
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Conversations
                </CardTitle>
              </CardHeader>
              <CardContent>
                {conversationsLoading ? (
                  <p className="text-muted-foreground text-center py-4">Loading...</p>
                ) : conversations && conversations.length > 0 ? (
                  <div className="space-y-2">
                    {conversations.map((conversation) => {
                      const isUser1 = conversation.user1_id === currentProfile.id;
                      const partnerProfileId = isUser1 ? conversation.user2_id : conversation.user1_id;
                      const isSelected = selectedPartner?.id === partnerProfileId;
                      
                      return (
                        <div
                          key={`${conversation.user1_id}-${conversation.user2_id}`}
                          onClick={() => handleConversationClick(conversation)}
                          className={`p-3 rounded-lg border cursor-pointer transition-colors hover:bg-accent ${
                            isSelected ? 'bg-accent border-primary' : 'border-border'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback>
                                <User className="h-5 w-5" />
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">
                                Partner {partnerProfileId.slice(0, 8)}...
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {conversation.last_message}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(conversation.last_message_at), 'MMM d, h:mm a')}
                              </p>
                            </div>
                            {conversation.unread_count > 0 && (
                              <div className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs">
                                {conversation.unread_count}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No conversations yet</p>
                    <Button 
                      className="mt-4" 
                      onClick={() => navigate('/connections')}
                    >
                      View Connections
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Message Thread */}
          <div className="md:col-span-2">
            {selectedPartner ? (
              <MessageThread
                partnerId={selectedPartner.id}
                partnerName={selectedPartner.name}
                partnerAvatar={selectedPartner.avatar}
                currentUserId={currentProfile.id}
              />
            ) : (
              <Card className="h-full">
                <CardContent className="flex items-center justify-center h-96">
                  <div className="text-center">
                    <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      Select a conversation to start messaging
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;