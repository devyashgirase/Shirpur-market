import { useState, useEffect } from 'react';
import { Bell, X, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { NotificationService, Notification } from '@/lib/notificationService';
import { realTimeService } from '@/lib/realTimeService';

interface RealTimeNotificationsProps {
  userType: 'customer' | 'admin' | 'delivery';
}

const RealTimeNotifications = ({ userType }: RealTimeNotificationsProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Get user ID for customer-specific notifications
    const userId = userType === 'customer' ? localStorage.getItem('customerPhone') || 'anonymous' : undefined;
    
    // SignalR disabled - using mock notifications
    console.log(`Mock notifications enabled for ${userType}`);

    // Subscribe to role-specific notifications
    if (userType === 'admin') {
      realTimeService.subscribe('AdminNotification', (notification: any) => {
        NotificationService.addNotification({
          title: notification.title,
          message: notification.message,
          type: notification.type,
          priority: notification.priority
        });
      });
    } else if (userType === 'delivery') {
      realTimeService.subscribe('DeliveryNotification', (notification: any) => {
        NotificationService.addNotification({
          title: notification.title,
          message: notification.message,
          type: notification.type,
          priority: notification.priority
        });
      });
    } else if (userType === 'customer') {
      realTimeService.subscribe('CustomerNotification', (notification: any) => {
        NotificationService.addNotification({
          title: notification.title,
          message: notification.message,
          type: notification.type,
          priority: notification.priority
        });
      });
    }

    // Subscribe to notification service
    const unsubscribe = NotificationService.subscribe((newNotifications) => {
      setNotifications(newNotifications.slice(0, 10));
      setUnreadCount(NotificationService.getUnreadCount());
    });

    // Load initial notifications
    setNotifications(NotificationService.getNotifications().slice(0, 10));
    setUnreadCount(NotificationService.getUnreadCount());

    return () => {
      unsubscribe();
    };
  }, [userType]);

  const handleMarkAsRead = (notificationId: string) => {
    NotificationService.markAsRead(notificationId);
  };

  const handleMarkAllAsRead = () => {
    NotificationService.markAllAsRead();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-500 bg-red-50';
      case 'medium': return 'border-yellow-500 bg-yellow-50';
      default: return 'border-blue-500 bg-blue-50';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'delivery_request': return '🚚';
      case 'order_update': return '📦';
      case 'delivery_complete': return '✅';
      default: return '🔔';
    }
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs min-w-[20px] h-5 flex items-center justify-center rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Notifications Dropdown */}
      {showNotifications && (
        <div className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto bg-white border rounded-lg shadow-lg z-50">
          <div className="p-3 border-b flex items-center justify-between">
            <h3 className="font-semibold">Notifications</h3>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  className="text-xs"
                >
                  Mark all read
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowNotifications(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 border-b hover:bg-gray-50 cursor-pointer ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => handleMarkAsRead(notification.id)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="text-lg">
                      {getTypeIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`text-sm font-medium ${
                          !notification.read ? 'text-gray-900' : 'text-gray-600'
                        }`}>
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(notification.timestamp).toLocaleTimeString()}
                      </p>
                      {notification.priority === 'high' && (
                        <Badge className="mt-1 bg-red-100 text-red-800 text-xs">
                          Urgent
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-2 border-t bg-gray-50">
              <p className="text-xs text-center text-muted-foreground">
                Real-time notifications enabled
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RealTimeNotifications;