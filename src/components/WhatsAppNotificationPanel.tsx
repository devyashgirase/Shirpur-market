import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, ExternalLink, Check } from 'lucide-react';
import { FreeWhatsAppService } from '@/lib/freeWhatsAppService';

export function WhatsAppNotificationPanel() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const loadNotifications = () => {
      setNotifications(FreeWhatsAppService.getPendingNotifications());
    };

    loadNotifications();
    const interval = setInterval(loadNotifications, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSendWhatsApp = (notification: any) => {
    window.open(notification.link, '_blank');
    FreeWhatsAppService.markNotificationSent(notification.id);
    setNotifications(FreeWhatsAppService.getPendingNotifications());
  };

  if (notifications.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-green-600" />
            WhatsApp Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-4">No pending WhatsApp notifications</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-green-600" />
          WhatsApp Notifications
          <Badge variant="secondary">{notifications.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {notifications.map((notification: any) => (
            <div key={notification.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex-1">
                <p className="font-medium text-gray-800">Order #{notification.orderId}</p>
                <p className="text-sm text-gray-600">{notification.phone}</p>
                <p className="text-xs text-gray-500">{notification.message}</p>
              </div>
              <Button
                onClick={() => handleSendWhatsApp(notification)}
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <ExternalLink className="w-4 h-4 mr-1" />
                Send WhatsApp
              </Button>
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-700">
            💡 <strong>Free WhatsApp:</strong> Click "Send WhatsApp" to open WhatsApp Web with pre-filled message. No API costs!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}