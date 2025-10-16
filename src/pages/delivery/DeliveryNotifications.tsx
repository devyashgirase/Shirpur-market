import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, MapPin, Package, Clock, CheckCircle, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { orderManagementService, Order } from "@/lib/orderManagementService";
import { deliveryAuthService } from "@/lib/deliveryAuthService";



const DeliveryNotifications = () => {
  const [newOrders, setNewOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingOrders, setProcessingOrders] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  useEffect(() => {
    loadNewOrders();
    
    // Set up polling for updates only
    const pollInterval = setInterval(() => {
      loadNewOrders();
    }, 5000); // Poll every 5 seconds
    
    return () => {
      clearInterval(pollInterval);
    };
  }, []);
  
  const loadNewOrders = async () => {
    const result = await orderManagementService.getOrdersReadyForDelivery();
    if (result.success) {
      setNewOrders(result.orders);
    }
    setLoading(false);
  };

  const acceptOrder = async (orderId: string) => {
    const currentUser = deliveryAuthService.getCurrentUser();
    if (!currentUser) return;
    
    setProcessingOrders(prev => new Set(prev).add(orderId));
    
    const result = await orderManagementService.acceptOrder(
      orderId, 
      currentUser.id, 
      currentUser.name
    );
    
    setProcessingOrders(prev => {
      const newSet = new Set(prev);
      newSet.delete(orderId);
      return newSet;
    });
    
    if (result.success) {
      toast({
        title: "Order Accepted!",
        description: `Order #${orderId.slice(-6)} added to your tasks`,
      });
      loadNewOrders(); // Refresh the list
    } else {
      toast({
        title: "Failed to Accept",
        description: result.error === 'Order no longer available' 
          ? "This order was already taken by another agent" 
          : "Please try again",
        variant: "destructive"
      });
    }
  };

  const rejectOrder = async (orderId: string) => {
    const currentUser = deliveryAuthService.getCurrentUser();
    if (!currentUser) return;
    
    setProcessingOrders(prev => new Set(prev).add(orderId));
    
    const result = await orderManagementService.rejectOrder(orderId, currentUser.id);
    
    setProcessingOrders(prev => {
      const newSet = new Set(prev);
      newSet.delete(orderId);
      return newSet;
    });
    
    if (result.success) {
      toast({
        title: "Order Rejected",
        description: "Order removed from your list",
      });
      // Remove from local state
      setNewOrders(prev => prev.filter(order => order.id !== orderId));
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
        <h1 className="text-xl md:text-3xl font-bold">New Orders</h1>
        {newOrders.length > 0 && (
          <Badge className="bg-red-500 text-white text-xs">{newOrders.length}</Badge>
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
      ) : newOrders.length === 0 ? (
        <Card>
          <CardContent className="p-6 md:p-8 text-center">
            <Bell className="w-12 h-12 md:w-16 md:h-16 text-muted-foreground mx-auto mb-3 md:mb-4" />
            <h3 className="text-lg md:text-xl font-semibold mb-2">No New Orders</h3>
            <p className="text-sm md:text-base text-muted-foreground">
              New delivery requests will appear here automatically when admin marks orders as ready.
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
          {newOrders.map((order) => {
            const isProcessing = processingOrders.has(order.id);
            return (
              <Card key={order.id} className="border-l-4 border-l-orange-500">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">Order #{order.id.slice(-6)}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">{order.customer_name}</p>
                    </div>
                    <Badge className="bg-orange-100 text-orange-800">
                      ₹{order.total_amount}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-700">{order.customer_address}</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-gray-500" />
                    <p className="text-sm text-gray-700">
                      {order.items?.map((item: any) => `${item.name} (${item.quantity})`).join(', ') || 'Order items'}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{new Date(order.created_at).toLocaleTimeString()}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      Ready for Delivery
                    </Badge>
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <Button 
                      onClick={() => acceptOrder(order.id)}
                      disabled={isProcessing}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      {isProcessing ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ) : (
                        <CheckCircle className="w-4 h-4 mr-2" />
                      )}
                      Accept Order
                    </Button>
                    <Button 
                      onClick={() => rejectOrder(order.id)}
                      disabled={isProcessing}
                      variant="outline" 
                      className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                    >
                      <X className="w-4 h-4 mr-2" />
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