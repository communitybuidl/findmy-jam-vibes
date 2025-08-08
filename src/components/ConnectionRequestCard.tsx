import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useConnections } from '@/hooks/useConnections';
import { Check, X, User } from 'lucide-react';

interface Profile {
  id: string;
  display_name: string;
  avatar_url: string | null;
}

interface ConnectionWithProfiles {
  id: string;
  requester_id: string;
  receiver_id: string;
  status: string;
  created_at: string;
  requester: Profile;
  receiver: Profile;
}

interface ConnectionRequestCardProps {
  connection: ConnectionWithProfiles;
  currentUserId: string;
}

export const ConnectionRequestCard = ({ connection, currentUserId }: ConnectionRequestCardProps) => {
  const { updateConnectionStatus } = useConnections();
  
  const isReceiver = connection.receiver_id === currentUserId;
  const otherProfile = isReceiver ? connection.requester : connection.receiver;
  const showActions = isReceiver && connection.status === 'pending';

  const handleAccept = () => {
    updateConnectionStatus.mutate({
      connectionId: connection.id,
      status: 'accepted'
    });
  };

  const handleDecline = () => {
    updateConnectionStatus.mutate({
      connectionId: connection.id,
      status: 'declined'
    });
  };

  const getStatusText = () => {
    if (connection.status === 'pending') {
      return isReceiver ? 'Wants to connect' : 'Request pending';
    }
    if (connection.status === 'accepted') {
      return 'Connected';
    }
    if (connection.status === 'declined') {
      return 'Declined';
    }
    return connection.status;
  };

  const getStatusColor = () => {
    switch (connection.status) {
      case 'accepted':
        return 'text-green-600';
      case 'declined':
        return 'text-red-600';
      case 'pending':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <Card className="border border-border shadow-elegant">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={otherProfile.avatar_url || undefined} />
            <AvatarFallback>
              <User className="h-6 w-6" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{otherProfile.display_name}</h3>
            <p className={`text-sm ${getStatusColor()}`}>
              {getStatusText()}
            </p>
          </div>
        </div>
      </CardHeader>
      
      {showActions && (
        <CardContent className="pt-0">
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleAccept}
              disabled={updateConnectionStatus.isPending}
              className="flex-1"
            >
              <Check className="h-4 w-4 mr-2" />
              Accept
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleDecline}
              disabled={updateConnectionStatus.isPending}
              className="flex-1"
            >
              <X className="h-4 w-4 mr-2" />
              Decline
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
};