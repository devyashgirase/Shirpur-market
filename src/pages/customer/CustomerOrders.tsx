import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, Clock, CheckCircle, Truck, XCircle } from "lucide-react";
import { customerOrderService, type CustomerOrder } from "@/lib/customerOrderService";
import { authService } from "@/lib/authService";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const CustomerOrders = () => {
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const initializeOrders = async () => {
      const user = authService.getCurrentUser();
      if (user?.phone) {
        customerOrderService.setCurrentUser(user.phone);
        await loadCustomerOrders();
        
        // Subscribe to real-time updates
        const unsubscribe = customerOrderService.subscribeToOrderUpdates((updatedOrders) => {
          setOrders(updatedOrders);
        });
        
        return unsubscribe;
      }
    };
    
    // Listen for real-time status updates from admin
    const handleStatusUpdate = (event: any) => {
      const { orderId, newStatus } = event.detail;
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.order_id === orderId 
            ? { ...order, order_status: newStatus, updated_at: new Date().toISOString() }
            : order
        )
      );
      
      // Show notification
      toast({
        title: "Order Status Updated!",
        description: `Your order is now ${newStatus.replace('_', ' ')}`
      });
    };
    
    // Listen for tracking enablement
    const handleTrackingEnabled = (event: any) => {
      const { orderId } = event.detail;
      toast({
        title: "🚚 Out for Delivery!",
        description: "Your order is on the way. Click 'Track Live' to see real-time location."
      });
    };
    
    window.addEventListener('orderStatusChanged', handleStatusUpdate);
    window.addEventListener('enableTracking', handleTrackingEnabled);
    
    const cleanup = initializeOrders();
    return () => {
      cleanup.then(fn => fn && fn());
      window.removeEventListener('orderStatusChanged', handleStatusUpdate);
      window.removeEventListener('enableTracking', handleTrackingEnabled);
    };
  }, [toast]);

  const loadCustomerOrders = async () => {
    try {
      setLoading(true);
      const customerOrders = await customerOrderService.getMyOrders();
      setOrders(customerOrders);
    } catch (error) {
      console.error('Failed to load orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'confirmed':
      case 'preparing':
        return <Package className="w-4 h-4" />;
      case 'out_for_delivery':
        return <Truck className="w-4 h-4" />;
      case 'delivered':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'pending':
        return 'secondary';
      case 'confirmed':
      case 'preparing':
        return 'default';
      case 'out_for_delivery':
        return 'default';
      case 'delivered':
        return 'secondary';
      case 'cancelled':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const formatStatus = (status: string) => {
    return String(status || 'pending').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const handleViewDetails = (order: CustomerOrder) => {
    // Store order data for details page
    localStorage.setItem('selectedOrderDetails', JSON.stringify({
      id: order.order_id,
      orderId: order.order_id,
      status: order.order_status,
      items: order.items,
      total: order.total_amount,
      customerName: order.customer_name,
      customerPhone: order.customer_phone,
      customerAddress: order.customer_address,
      deliveryAddress: order.customer_address,
      createdAt: order.created_at,
      paymentStatus: order.payment_status
    }));
    navigate(`/customer/order-details/${order.order_id}`);
  };

  const handleTrackOrder = (order: CustomerOrder) => {
    navigate(`/customer/track?orderId=${order.order_id}`);
  };

  return (
    <div className="container mx-auto px-3 md:px-4 py-6 md:py-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-4">My Orders</h1>
        <p className="text-sm md:text-base text-muted-foreground">Track your order history and delivery status</p>
      </div>

      <div className="space-y-4 md:space-y-6">
        {loading ? (
          <div className="text-center py-8 md:py-12">
            <div className="loading-spinner mx-auto mb-4"></div>
            <p className="text-base md:text-lg text-gray-600">Loading your orders from Supabase...</p>
          </div>
        ) : orders.length > 0 ? orders.map((order) => (
          <Card key={order.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base md:text-lg truncate pr-2">Order #{order.order_id}</CardTitle>
                <Badge variant={getStatusVariant(order.order_status)} className="flex items-center gap-1">
                  {getStatusIcon(order.order_status)}
                  {formatStatus(order.order_status)}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Placed on {formatDate(order.created_at)}
              </p>
            </CardHeader>
            
            <CardContent className="p-4 md:p-6 space-y-3 md:space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">Delivery Address</p>
                  <p className="text-sm text-muted-foreground">
                    {order.customer_address}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">₹{order.total_amount}</p>
                  <p className="text-sm text-muted-foreground">
                    Payment: {order.payment_status === 'paid' ? '✓ Paid' : 'Pending'}
                  </p>
                </div>
              </div>

              <div className="border rounded-lg p-4 bg-muted/30">
                <h4 className="font-semibold mb-3">Order Items</h4>
                <div className="space-y-2">
                  {order.items.slice(0, 3).map((item: any, index: number) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{item.product_name || item.name}</span>
                      <span>x{item.quantity}</span>
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <p className="text-xs text-muted-foreground">+{order.items.length - 3} more items</p>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => handleViewDetails(order)}>
                  View Details
                </Button>
                {order.order_status === 'out_for_delivery' && (
                  <Button variant="outline" size="sm" onClick={() => handleTrackOrder(order)} className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100">
                    🚚 Track Live
                  </Button>
                )}
                {order.order_status === 'delivered' && (
                  <Button variant="outline" size="sm">
                    Reorder
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )) : (
          <div className="text-center py-12">
            <Package className="w-24 h-24 text-muted-foreground mx-auto mb-6" />
            <h3 className="text-xl font-semibold mb-4">No orders yet</h3>
            <p className="text-muted-foreground mb-6">
              Start shopping to see your orders here
            </p>
            <Button className="bg-gradient-primary">
              Browse Products
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerOrders;