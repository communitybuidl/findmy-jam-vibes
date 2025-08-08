import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useMessages } from '@/hooks/useMessages';
import { Send, User } from 'lucide-react';
import { format } from 'date-fns';

interface MessageThreadProps {
  partnerId: string;
  partnerName: string;
  partnerAvatar?: string | null;
  currentUserId: string;
}

export const MessageThread = ({ 
  partnerId, 
  partnerName, 
  partnerAvatar, 
  currentUserId 
}: MessageThreadProps) => {
  const { messages, messagesLoading, sendMessage, markAsRead } = useMessages(partnerId);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Mark unread messages as read when thread is opened
    if (messages) {
      const unreadMessages = messages
        .filter(msg => msg.receiver_id === currentUserId && !msg.read_at)
        .map(msg => msg.id);
      
      if (unreadMessages.length > 0) {
        markAsRead.mutate(unreadMessages);
      }
    }
  }, [messages, currentUserId, markAsRead]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    sendMessage.mutate(
      { receiverId: partnerId, content: newMessage },
      {
        onSuccess: () => {
          setNewMessage('');
        }
      }
    );
  };

  if (messagesLoading) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Loading messages...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="border-b border-border pb-4">
        <CardTitle className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={partnerAvatar || undefined} />
            <AvatarFallback>
              <User className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
          <span>{partnerName}</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-96">
          {messages && messages.length > 0 ? (
            messages.map((message) => {
              const isFromCurrentUser = message.sender_id === currentUserId;
              return (
                <div
                  key={message.id}
                  className={`flex ${isFromCurrentUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg px-3 py-2 ${
                      isFromCurrentUser
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className={`text-xs mt-1 opacity-70`}>
                      {format(new Date(message.created_at), 'MMM d, h:mm a')}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center text-muted-foreground py-8">
              <p>No messages yet. Start the conversation!</p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-border p-4">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              disabled={sendMessage.isPending}
              className="flex-1"
            />
            <Button 
              type="submit" 
              size="sm" 
              disabled={!newMessage.trim() || sendMessage.isPending}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
};