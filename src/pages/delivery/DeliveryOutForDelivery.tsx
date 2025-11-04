import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Truck, MapPin, Package, Clock, Navigation, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { orderManagementService, Order } from "@/lib/orderManagementService";
import { deliveryAuthService } from "@/lib/deliveryAuthService";
import { useNavigate } from "react-router-dom";

const DeliveryOutForDelivery = () => {
  const [outForDeliveryOrders, setOutForDeliveryOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingOrders, setProcessingOrders] = useState<Set<string>>(new Set());
  const [currentAgent, setCurrentAgent] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const initializeComponent = async () => {
      const agent = await deliveryAuthService.getCurrentAgent();
      setCurrentAgent(agent);
      loadOutForDeliveryOrders();
    };
    
    initializeComponent();
    
    // Set up polling for updates
    const pollInterval = setInterval(() => {
      loadOutForDeliveryOrders();
    }, 5000); // Poll every 5 seconds
    
    // Listen for real-time events
    const handleOrderOutForDelivery = () => {
      loadOutForDeliveryOrders();
    };
    
    window.addEventListener('orderOutForDelivery', handleOrderOutForDelivery);
    
    return () => {
      clearInterval(pollInterval);
      window.removeEventListener('orderOutForDelivery', handleOrderOutForDelivery);
    };
  }, []);
  
  const loadOutForDeliveryOrders = async () => {
    console.log('🔄 Loading orders marked as out for delivery by admin...');
    const result = await orderManagementService.getOrdersOutForDelivery();
    console.log('📦 Out for delivery orders result:', result);
    
    if (result.success) {
      console.log('✅ Found orders out for delivery:', result.orders.length);
      console.log('📋 Order data structure:', result.orders);
      
      // Log each order to debug structure
      result.orders.forEach((order: any, index: number) => {
        console.log(`Order ${index + 1}:`, {
          id: order.id,
          customer_name: order.customer_name,
          customer_address: order.customer_address,
          items: order.items,
          total_amount: order.total_amount,
          delivery_agent_id: order.delivery_agent_id
        });
      });
      
      setOutForDeliveryOrders(result.orders);
    } else {
      console.error('❌ Failed to load out for delivery orders:', result.error);
    }
    setLoading(false);
  };

  const acceptOrder = async (orderId: string) => {
    const currentUser = await deliveryAuthService.getCurrentAgent();
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
        description: `Order #${orderId.slice(-6)} assigned to you`,
      });
      loadOutForDeliveryOrders(); // Refresh the list
      navigate('/delivery/tracking'); // Navigate to tracking
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

  const startDelivery = (order: Order) => {
    // Store order details for tracking
    localStorage.setItem('currentDeliveryOrder', JSON.stringify(order));
    
    // Start GPS tracking
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          timestamp: new Date().toISOString()
        };
        
        // Store initial location
        localStorage.setItem(`tracking_${order.id}`, JSON.stringify([location]));
        
        // Trigger tracking start event
        window.dispatchEvent(new CustomEvent('trackingStarted', {
          detail: { orderId: order.id, location, agentId: currentAgent?.id }
        }));
        
        toast({
          title: "GPS Tracking Started!",
          description: "Your location is now being tracked for this delivery",
        });
      });
    }
    
    navigate('/delivery/tracking');
  };

  return (
    <div className="container mx-auto px-4 py-4 md:py-8">
      <div className="flex items-center space-x-3 mb-4 md:mb-6">
        <Truck className="w-6 h-6 md:w-8 md:h-8 text-primary" />
        <h1 className="text-xl md:text-3xl font-bold">Orders Out for Delivery</h1>
        {outForDeliveryOrders.length > 0 && (
          <Badge className="bg-green-500 text-white text-xs">{outForDeliveryOrders.length}</Badge>
        )}
      </div>

      {loading ? (
        <Card>
          <CardContent className="p-6 md:p-8 text-center">
            <div className="loading-spinner mx-auto mb-4"></div>
            <h3 className="text-lg md:text-xl font-semibold mb-2">Loading Orders</h3>
            <p className="text-sm md:text-base text-muted-foreground">
              Checking for orders marked as out for delivery...
            </p>
          </CardContent>
        </Card>
      ) : outForDeliveryOrders.length === 0 ? (
        <Card>
          <CardContent className="p-6 md:p-8 text-center">
            <Truck className="w-12 h-12 md:w-16 md:h-16 text-muted-foreground mx-auto mb-3 md:mb-4" />
            <h3 className="text-lg md:text-xl font-semibold mb-2">No Orders Out for Delivery</h3>
            <p className="text-sm md:text-base text-muted-foreground">
              Orders marked as "out for delivery" by admin will appear here.
            </p>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-xs md:text-sm text-blue-700">
                💡 These are orders that admin has directly marked as ready for delivery
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3 md:space-y-4">
          <div className="bg-green-50 p-3 rounded-lg border border-green-200 mb-4">
            <p className="text-sm text-green-800">
              🚚 <strong>Admin Approved Orders</strong> - These orders have been marked as "out for delivery" by admin and are ready for pickup.
            </p>
          </div>
          {outForDeliveryOrders.map((order) => {
            const isProcessing = processingOrders.has(order.id);
            const isAssignedToMe = order.delivery_agent_id === currentAgent?.id;
            
            return (
              <Card key={order.id} className={`border-l-4 ${isAssignedToMe ? 'border-l-blue-500 bg-blue-50' : 'border-l-green-500'}`}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">Order #{order.id ? order.id.toString().slice(-6) : 'N/A'}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">{order.customer_name || 'Customer'}</p>
                    </div>
                    <div className="text-right">
                      <Badge className={isAssignedToMe ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"}>
                        ₹{order.total_amount || 0}
                      </Badge>
                      {isAssignedToMe && (
                        <Badge className="bg-blue-500 text-white mt-1 block">
                          Assigned to You
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-800">Delivery Address:</p>
                        <p className="text-sm text-gray-700">{order.customer_address || 'Address not available'}</p>
                      </div>
                    </div>
                    {isAssignedToMe && (
                      <div className="bg-green-50 p-2 rounded-lg border border-green-200">
                        <div className="flex items-center gap-2 text-green-800">
                          <Navigation className="w-4 h-4" />
                          <span className="text-sm font-medium">Live GPS Tracking Active</span>
                        </div>
                        <p className="text-xs text-green-700 mt-1">
                          Your location is being tracked for this delivery
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-gray-500" />
                    <p className="text-sm text-gray-700">
                      {order.items && Array.isArray(order.items) && order.items.length > 0 
                        ? order.items.map((item: any) => `${item.name || item.product_name || 'Item'} (${item.quantity || 1})`).join(', ')
                        : 'Order items not available'
                      }
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{new Date(order.created_at).toLocaleTimeString()}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      Out for Delivery
                    </Badge>
                  </div>

                  {order.delivery_agent_name && (
                    <div className="bg-blue-50 p-2 rounded text-sm">
                      <strong>Assigned to:</strong> {order.delivery_agent_name}
                    </div>
                  )}
                  
                  <div className="flex gap-2 pt-2">
                    {isAssignedToMe ? (
                      <Button 
                        onClick={() => startDelivery(order)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                      >
                        <Navigation className="w-4 h-4 mr-2" />
                        Start Delivery
                      </Button>
                    ) : !order.delivery_agent_id ? (
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
                    ) : (
                      <Button 
                        disabled
                        variant="outline" 
                        className="flex-1 text-gray-500"
                      >
                        Already Assigned
                      </Button>
                    )}
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

export default DeliveryOutForDelivery;