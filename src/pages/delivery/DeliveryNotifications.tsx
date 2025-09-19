import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, MapPin, Package, Clock, CheckCircle, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { WhatsAppService } from "@/lib/whatsappService";

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
  const { toast } = useToast();

  useEffect(() => {
    const loadNotifications = () => {
      const allNotifications = JSON.parse(localStorage.getItem('deliveryNotifications') || '[]');
      const pendingNotifications = allNotifications.filter((n: DeliveryNotification) => n.status === 'pending');
      setNotifications(pendingNotifications);
    };

    loadNotifications();
    const interval = setInterval(loadNotifications, 3000);
    return () => clearInterval(interval);
  }, []);

  const acceptOrder = (notification: DeliveryNotification) => {
    // Update notification status
    const allNotifications = JSON.parse(localStorage.getItem('deliveryNotifications') || '[]');
    const updatedNotifications = allNotifications.map((n: DeliveryNotification) => 
      n.id === notification.id ? { ...n, status: 'accepted' } : n
    );
    localStorage.setItem('deliveryNotifications', JSON.stringify(updatedNotifications));

    // Update order status to out_for_delivery
    const allOrders = JSON.parse(localStorage.getItem('allOrders') || '[]');
    const updatedOrders = allOrders.map((order: any) => 
      order.orderId === notification.orderId 
        ? { 
            ...order, 
            status: 'out_for_delivery',
            deliveryAgent: {
              id: 'AGENT_001',
              name: 'Delivery Partner',
              phone: '+91 98765 43210',
              location: { lat: 20.7516, lng: 74.2297 }
            },
            acceptedAt: new Date().toISOString()
          } 
        : order
    );
    localStorage.setItem('allOrders', JSON.stringify(updatedOrders));
    
    // Update current order status
    const currentOrder = JSON.parse(localStorage.getItem('currentOrder') || '{}');
    if (currentOrder.orderId === notification.orderId) {
      currentOrder.status = 'out_for_delivery';
      currentOrder.deliveryAgent = {
        id: 'AGENT_001',
        name: 'Delivery Partner',
        phone: '+91 98765 43210'
      };
      localStorage.setItem('currentOrder', JSON.stringify(currentOrder));
      
      // Send WhatsApp notification for out for delivery
      WhatsAppService.sendOutForDeliveryNotification(
        notification.customerAddress,
        currentOrder,
        currentOrder.deliveryAgent
      );
    }

    // Create delivery task
    const deliveryTask = {
      id: 'TASK_' + Date.now(),
      orderId: notification.orderId,
      order_id: notification.orderId,
      customer_name: notification.customerAddress.name,
      customer_address: notification.customerAddress.address,
      customer_phone: notification.customerAddress.phone,
      customerAddress: notification.customerAddress,
      items: notification.items,
      orderValue: notification.orderValue,
      total_amount: notification.orderValue,
      status: 'accepted',
      acceptedAt: new Date().toISOString(),
      estimatedDelivery: new Date(Date.now() + 25 * 60000).toISOString()
    };

    const tasks = JSON.parse(localStorage.getItem('deliveryTasks') || '[]');
    tasks.push(deliveryTask);
    localStorage.setItem('deliveryTasks', JSON.stringify(tasks));

    toast({
      title: "Order Accepted!",
      description: `Order ${notification.orderId} has been assigned to you.`,
    });

    // Remove from notifications
    setNotifications(prev => prev.filter(n => n.id !== notification.id));
  };

  const rejectOrder = (notification: DeliveryNotification) => {
    const allNotifications = JSON.parse(localStorage.getItem('deliveryNotifications') || '[]');
    const updatedNotifications = allNotifications.map((n: DeliveryNotification) => 
      n.id === notification.id ? { ...n, status: 'rejected' } : n
    );
    localStorage.setItem('deliveryNotifications', JSON.stringify(updatedNotifications));

    toast({
      title: "Order Rejected",
      description: "Order will be offered to other delivery partners.",
    });

    setNotifications(prev => prev.filter(n => n.id !== notification.id));
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

      {notifications.length === 0 ? (
        <Card>
          <CardContent className="p-6 md:p-8 text-center">
            <Bell className="w-12 h-12 md:w-16 md:h-16 text-muted-foreground mx-auto mb-3 md:mb-4" />
            <h3 className="text-lg md:text-xl font-semibold mb-2">No New Orders</h3>
            <p className="text-sm md:text-base text-muted-foreground">New delivery requests will appear here</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3 md:space-y-4">
          {notifications.map((notification) => {
            const distance = calculateDistance(
              20.7516, 74.2297, // Your location (Shirpur)
              notification.customerLocation.lat,
              notification.customerLocation.lng
            );

            return (
              <Card key={notification.id} className="border-l-4 border-l-primary">
                <CardHeader className="p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2 text-base md:text-lg">
                      <Package className="w-4 h-4 md:w-5 md:h-5" />
                      <span>Order #{notification.orderId}</span>
                    </CardTitle>
                    <Badge className="bg-green-500 text-white text-xs md:text-sm">
                      ₹{notification.orderValue.toFixed(2)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-4 md:p-6 pt-0 space-y-3 md:space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-3 h-3 md:w-4 md:h-4 text-muted-foreground" />
                      <span className="text-xs md:text-sm">Distance: {distance.toFixed(1)} km</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-3 h-3 md:w-4 md:h-4 text-muted-foreground" />
                      <span className="text-xs md:text-sm">
                        {new Date(notification.timestamp).toLocaleTimeString()}
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

                  <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-3 pt-3 md:pt-4">
                    <Button 
                      onClick={() => acceptOrder(notification)}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-sm"
                      size="sm"
                    >
                      <CheckCircle className="w-3 h-3 md:w-4 md:h-4 mr-2" />
                      Accept Order
                    </Button>
                    <Button 
                      onClick={() => rejectOrder(notification)}
                      variant="outline"
                      className="flex-1 text-red-600 border-red-600 hover:bg-red-50 text-sm"
                      size="sm"
                    >
                      <X className="w-3 h-3 md:w-4 md:h-4 mr-2" />
                      Reject
                    </Button>
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