import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Clock, CheckCheck } from "lucide-react";

interface WhatsAppMessage {
  id: string;
  orderId: string;
  phone: string;
  message: string;
  timestamp: string;
  type: 'order_confirmation' | 'out_for_delivery' | 'delivered';
  status: 'sent' | 'delivered' | 'read';
}

const WhatsAppStatus = ({ orderId }: { orderId: string }) => {
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);

  useEffect(() => {
    // Load WhatsApp message history for this order
    const loadMessages = () => {
      const allMessages = JSON.parse(localStorage.getItem('whatsappMessages') || '[]');
      const orderMessages = allMessages.filter((msg: WhatsAppMessage) => msg.orderId === orderId);
      setMessages(orderMessages);
    };

    loadMessages();
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, [orderId]);

  const getMessageTypeInfo = (type: string) => {
    switch (type) {
      case 'order_confirmation':
        return { label: 'Order Confirmation', color: 'bg-blue-500' };
      case 'out_for_delivery':
        return { label: 'Out for Delivery', color: 'bg-orange-500' };
      case 'delivered':
        return { label: 'Delivered', color: 'bg-green-500' };
      default:
        return { label: 'Status Update', color: 'bg-gray-500' };
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <Clock className="w-3 h-3" />;
      case 'delivered':
        return <CheckCheck className="w-3 h-3" />;
      case 'read':
        return <CheckCheck className="w-3 h-3 text-blue-500" />;
      default:
        return <Clock className="w-3 h-3" />;
    }
  };

  if (messages.length === 0) {
    return (
      <Card>
        <CardContent className="p-4 text-center text-muted-foreground">
          <MessageCircle className="w-8 h-8 mx-auto mb-2" />
          <p className="text-sm">No WhatsApp messages sent yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <MessageCircle className="w-5 h-5 mr-2 text-green-600" />
          WhatsApp Notifications
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {messages.map((message) => {
          const typeInfo = getMessageTypeInfo(message.type);
          return (
            <div key={message.id} className="border-l-4 border-l-green-500 pl-3 py-2">
              <div className="flex items-center justify-between mb-1">
                <Badge className={`${typeInfo.color} text-white text-xs`}>
                  {typeInfo.label}
                </Badge>
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  {getStatusIcon(message.status)}
                  <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Sent to: {message.phone}
              </p>
              <div className="text-xs bg-gray-50 p-2 rounded mt-1 max-h-20 overflow-y-auto">
                {message.message.substring(0, 100)}...
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default WhatsAppStatus;