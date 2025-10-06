import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, MapPin, Package, Clock, CheckCircle, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { OrderService } from "@/lib/orderService";
import { NotificationService } from "@/lib/notificationService";
import { DataGenerator } from "@/lib/dataGenerator";

interface DeliveryNotification {
  id: string;
  orderId: string;
  customerLocation: { lat: number; lng: number };
  customerAddress: any;
  orderValue: number;
  items: any[];
  timestamp: string;
  status: string;
  radius: number;
}

const DeliveryNotifications = () => {
  const [notifications, setNotifications] = useState<DeliveryNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    let isMounted = true;
    
    const loadNotifications = () => {
      if (!isMounted) return;
      
      try {
        const allNotifications = JSON.parse(localStorage.getItem('deliveryNotifications') || '[]');
        const pendingNotifications = allNotifications.filter((n: DeliveryNotification) => n.status === 'pending');
        
        // Only update if data actually changed
        const currentData = JSON.stringify(pendingNotifications);
        if (currentData !== lastUpdate) {
          setNotifications(pendingNotifications);
          setLastUpdate(currentData);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Failed to load notifications:', error);
        setLoading(false);
      }
    };

    // Initial load
    loadNotifications();
    
    // Listen for real-time events only
    const handleNewNotification = () => {
      if (isMounted) {
        console.log('🔔 New delivery notification received');
        loadNotifications();
      }
    };
    
    window.addEventListener('deliveryNotificationCreated', handleNewNotification);
    window.addEventListener('deliveryNotificationsUpdated', handleNewNotification);
    
    return () => {
      isMounted = false;
      window.removeEventListener('deliveryNotificationCreated', handleNewNotification);
      window.removeEventListener('deliveryNotificationsUpdated', handleNewNotification);
    };
  }, [lastUpdate]);

  const acceptOrder = async (notification: DeliveryNotification) => {
    // Generate dynamic delivery agent
    const agentInfo = DataGenerator.generateDeliveryAgent();

    // Use OrderService to accept the order
    const success = await OrderService.acceptOrder(notification.orderId, agentInfo);
    
    if (success) {
      toast({
        title: "Order Accepted!",
        description: `Order ${notification.orderId} is now out for delivery.`,
      });

      // Send notifications
      NotificationService.sendOrderStatusNotification(
        notification.orderId, 
        'out_for_delivery', 
        'delivery'
      );

      // Remove from notifications
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
      
      // Trigger updates for customer and admin tracking
      window.dispatchEvent(new CustomEvent('orderStatusChanged', { 
        detail: { orderId: notification.orderId, status: 'out_for_delivery', agent: agentInfo }
      }));
    } else {
      toast({
        title: "Error",
        description: "Failed to accept order. Please try again.",
        variant: "destructive"
      });
    }
  };

  const rejectOrder = async (notification: DeliveryNotification) => {
    const agentInfo = DataGenerator.generateDeliveryAgent();
    
    const success = await OrderService.rejectOrder(notification.orderId, agentInfo, 'Not available');
    
    if (success) {
      toast({
        title: "Order Rejected",
        description: "Order will be offered to other delivery partners.",
      });

      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }
  };

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  return (
    <div className="container mx-auto px-4 py-4 md:py-8">
      <div className="flex items-center space-x-3 mb-4 md:mb-6">
        <Bell className="w-6 h-6 md:w-8 md:h-8 text-primary" />
        <h1 className="text-xl md:text-3xl font-bold">New Delivery Requests</h1>
        {notifications.length > 0 && (
          <Badge className="bg-red-500 text-white text-xs">{notifications.length}</Badge>
        )}
      </div>

      {loading ? (
        <Card>
          <CardContent className="p-6 md:p-8 text-center">
            <div className="loading-spinner mx-auto mb-4"></div>
            <h3 className="text-lg md:text-xl font-semibold mb-2">Loading Notifications</h3>
            <p className="text-sm md:text-base text-muted-foreground">
              Checking for new delivery requests...
            </p>
          </CardContent>
        </Card>
      ) : notifications.length === 0 ? (
        <Card>
          <CardContent className="p-6 md:p-8 text-center">
            <Bell className="w-12 h-12 md:w-16 md:h-16 text-muted-foreground mx-auto mb-3 md:mb-4" />
            <h3 className="text-lg md:text-xl font-semibold mb-2">No New Orders</h3>
            <p className="text-sm md:text-base text-muted-foreground">
              You're all caught up! New delivery requests will appear here with real-time notifications.
            </p>
            <div className="mt-4 p-3 bg-green-50 rounded-lg">
              <p className="text-xs md:text-sm text-green-700">
                💡 Orders within 10km radius will be automatically sent to you
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3 md:space-y-4">
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 mb-4">
            <p className="text-sm text-blue-800">
              📱 <strong>Real-time notifications enabled</strong> - You'll be notified instantly when new orders are available in your area.
            </p>
          </div>
          {notifications.map((notification) => {
            const distance = calculateDistance(
              20.7516, 74.2297, // Your location (Shirpur)
              notification.customerLocation.lat,
              notification.customerLocation.lng
            );

            return (
              <Card key={notification.id} className="border-l-4 border-l-primary animate-pulse-border">
                <CardHeader className="p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2 text-base md:text-lg">
                      <Bell className="w-4 h-4 md:w-5 md:h-5 text-red-500 animate-bounce" />
                      <span>New Order #{notification.orderId}</span>
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-green-500 text-white text-xs md:text-sm">
                        ₹{notification.orderValue.toFixed(2)}
                      </Badge>
                      <Badge className="bg-red-500 text-white text-xs animate-pulse">
                        URGENT
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 md:p-6 pt-0 space-y-3 md:space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-3 h-3 md:w-4 md:h-4 text-green-600" />
                      <span className="text-xs md:text-sm font-medium text-green-600">
                        {distance.toFixed(1)} km away
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-3 h-3 md:w-4 md:h-4 text-blue-600" />
                      <span className="text-xs md:text-sm text-blue-600">
                        ~{Math.round(distance * 3)} min
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Package className="w-3 h-3 md:w-4 md:h-4 text-orange-600" />
                      <span className="text-xs md:text-sm text-orange-600">
                        {notification.items.length} items
                      </span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2 text-sm md:text-base">Delivery Address:</h4>
                    <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                      {notification.customerAddress.name}<br />
                      {notification.customerAddress.address}<br />
                      Phone: {notification.customerAddress.phone}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2 text-sm md:text-base">Items ({notification.items.length}):</h4>
                    <div className="space-y-1">
                      {notification.items.slice(0, 3).map((item, index) => (
                        <p key={index} className="text-xs md:text-sm text-muted-foreground">
                          {item.quantity}x {item.product.name} - ₹{(item.product.price * item.quantity).toFixed(2)}
                        </p>
                      ))}
                      {notification.items.length > 3 && (
                        <p className="text-xs md:text-sm text-muted-foreground">
                          +{notification.items.length - 3} more items
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                    <p className="text-xs md:text-sm text-yellow-800 font-medium mb-2">
                      ⚡ Quick Response Required - Customer is waiting!
                    </p>
                    <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-3">
                      <Button 
                        onClick={() => acceptOrder(notification)}
                        className="flex-1 bg-green-500 hover:bg-green-600 text-sm font-semibold"
                        size="sm"
                      >
                        <CheckCircle className="w-3 h-3 md:w-4 md:h-4 mr-2" />
                        Accept & Start Delivery
                      </Button>
                      <Button 
                        onClick={() => rejectOrder(notification)}
                        variant="outline"
                        className="flex-1 text-red-600 border-red-600 hover:bg-red-50 text-sm"
                        size="sm"
                      >
                        <X className="w-3 h-3 md:w-4 md:h-4 mr-2" />
                        Not Available
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DeliveryNotifications;