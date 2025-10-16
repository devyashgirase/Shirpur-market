import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, Clock, CheckCircle, Truck, XCircle } from "lucide-react";
import { unifiedDB } from "@/lib/database";
import { OrderService } from "@/lib/orderService";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const CustomerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadCustomerOrders();
    
    // Listen for order updates
    const handleOrderUpdate = () => {
      console.log('🔄 Order update detected, refreshing customer orders');
      loadCustomerOrders();
    };
    
    window.addEventListener('orderCreated', handleOrderUpdate);
    window.addEventListener('ordersUpdated', handleOrderUpdate);
    window.addEventListener('cartUpdated', handleOrderUpdate);
    window.addEventListener('orderStatusChanged', handleOrderUpdate);
    
    // Auto-refresh every 30 seconds to catch admin status changes
    const interval = setInterval(() => {
      console.log('🔄 Auto-refreshing customer orders...');
      loadCustomerOrders();
    }, 30000);
    
    return () => {
      window.removeEventListener('orderCreated', handleOrderUpdate);
      window.removeEventListener('ordersUpdated', handleOrderUpdate);
      window.removeEventListener('cartUpdated', handleOrderUpdate);
      window.removeEventListener('orderStatusChanged', handleOrderUpdate);
      clearInterval(interval);
    };
  }, []);

  const loadCustomerOrders = async () => {
    try {
      setLoading(true);
      
      // Load orders directly from Supabase
      console.log('🔄 Loading orders from Supabase...');
      
      const response = await fetch('https://ftexuxkdfahbqjddidaf.supabase.co/rest/v1/orders?select=*&order=created_at.desc', {
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0ZXh1eGtkZmFoYnFqZGRpZGFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4OTg0MjMsImV4cCI6MjA3NTQ3NDQyM30.j_HfG_5FLay9EymJkJAkWRx0P0yScHXPZckIQ3apbEY',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0ZXh1eGtkZmFoYnFqZGRpZGFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4OTg0MjMsImV4cCI6MjA3NTQ3NDQyM30.j_HfG_5FLay9EymJkJAkWRx0P0yScHXPZckIQ3apbEY',
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const dbOrders = await response.json();
        console.log('✅ Orders loaded from Supabase:', dbOrders.length);
        setOrders(dbOrders || []);
      } else {
        console.error('❌ Failed to load orders from Supabase:', response.status);
        // Fallback to unifiedDB
        const dbOrders = await unifiedDB.getOrders();
        setOrders(dbOrders || []);
      }
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

  const handleViewDetails = (order: any) => {
    // Store the selected order for details view
    localStorage.setItem('selectedOrderDetails', JSON.stringify(order));
    // Navigate to order details page
    navigate(`/customer/order-details/${order.order_id || order.orderId || order.id}`);
  };

  const handleTrackOrder = (order: any) => {
    // Store the selected order for tracking
    localStorage.setItem('currentOrder', JSON.stringify(order));
    // Navigate to tracking page
    navigate('/customer/track');
  };

  const handleCancelOrder = async (order: any) => {
    if (!confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    try {
      const orderId = order.order_id || order.orderId || order.id;
      
      // Update order status to cancelled in Supabase
      await unifiedDB.updateOrderStatus(parseInt(orderId), 'cancelled');
      
      // Update local orders
      OrderService.updateOrderStatus(orderId, 'cancelled');
      
      // Refresh orders list
      loadCustomerOrders();
      
      toast({
        title: "Order Cancelled",
        description: `Order #${orderId} has been cancelled successfully.`,
      });
      
      // Trigger updates for admin panel
      window.dispatchEvent(new CustomEvent('ordersUpdated'));
    } catch (error) {
      console.error('Failed to cancel order:', error);
      toast({
        title: "Cancellation Failed",
        description: "Unable to cancel order. Please try again.",
        variant: "destructive"
      });
    }
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
            <p className="text-base md:text-lg text-gray-600">Loading your orders from database...</p>
          </div>
        ) : orders.length > 0 ? orders.map((order) => (
          <Card key={order.order_id || order.orderId || order.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base md:text-lg truncate pr-2">Order #{order.order_id || order.orderId || order.id}</CardTitle>
                <Badge variant={getStatusVariant(order.status)} className="flex items-center gap-1">
                  {getStatusIcon(order.status)}
                  {formatStatus(order.status)}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Placed on {formatDate(order.createdAt || order.created_at || order.timestamp)}
              </p>
            </CardHeader>
            
            <CardContent className="p-4 md:p-6 space-y-3 md:space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">Delivery Address</p>
                  <p className="text-sm text-muted-foreground">
                    {order.delivery_address || order.deliveryAddress || order.customerAddress?.address || order.customer_address}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">₹{parseFloat(order.total || order.total_amount || 0).toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">
                    Payment: {(order.paymentStatus || order.payment_status) === 'paid' ? '✓ Paid' : 'Pending'}
                  </p>
                </div>
              </div>

              {/* Order Status Timeline */}
              <div className="border rounded-lg p-4 bg-muted/30">
                <h4 className="font-semibold mb-3">Order Progress</h4>
                <div className="flex items-center space-x-4 overflow-x-auto">
                  {['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'].map((status, index) => (
                    <div key={status} className="flex items-center space-x-2 whitespace-nowrap">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'].indexOf(order.status) >= index
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {getStatusIcon(status)}
                      </div>
                      <span className={`text-sm ${
                        ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'].indexOf(order.status) >= index
                          ? 'text-foreground font-medium' 
                          : 'text-muted-foreground'
                      }`}>
                        {formatStatus(status)}
                      </span>
                      {index < 4 && (
                        <div className={`w-8 h-0.5 ${
                          ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'].indexOf(order.status) > index
                            ? 'bg-primary' 
                            : 'bg-muted'
                        }`} />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => handleViewDetails(order)}>
                  View Details
                </Button>
                {order.status === 'out_for_delivery' && (
                  <Button variant="outline" size="sm" onClick={() => handleTrackOrder(order)} className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100">
                    🚚 Track Live
                  </Button>
                )}
                {order.status === 'delivered' && (
                  <Button variant="outline" size="sm">
                    Reorder
                  </Button>
                )}
                {['pending', 'confirmed'].includes(order.status) && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => handleCancelOrder(order)}
                  >
                    Cancel Order
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

        {orders.length === 0 && !loading && (
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