import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, Clock, CheckCircle, Truck, XCircle } from "lucide-react";
import { unifiedDB } from "@/lib/database";
import { OrderService } from "@/lib/orderService";
import { useNavigate } from "react-router-dom";

const CustomerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
    
    return () => {
      window.removeEventListener('orderCreated', handleOrderUpdate);
      window.removeEventListener('ordersUpdated', handleOrderUpdate);
      window.removeEventListener('cartUpdated', handleOrderUpdate);
    };
  }, []);

  const loadCustomerOrders = async () => {
    try {
      setLoading(true);
      console.log('📊 Loading customer orders from all sources...');
      
      // Get customer phone from localStorage
      const customerPhone = localStorage.getItem('customerPhone');
      
      let allOrders = [];
      
      // 1. Load from OrderService (includes recent orders)
      const localOrders = OrderService.getAllOrders();
      console.log(`📱 Local orders found: ${localOrders.length}`);
      
      // 2. Load customer-specific orders from localStorage
      if (customerPhone) {
        const customerOrders = JSON.parse(localStorage.getItem(`customerOrders_${customerPhone}`) || '[]');
        console.log(`👤 Customer orders found: ${customerOrders.length}`);
        allOrders = [...allOrders, ...customerOrders];
      }
      
      // 3. Try to load from database
      try {
        const dbOrders = await unifiedDB.getOrders();
        let customerDbOrders = dbOrders;
        if (customerPhone) {
          customerDbOrders = dbOrders.filter(order => 
            order.customerPhone === customerPhone || 
            order.customer_phone === customerPhone
          );
        }
        console.log(`🗄️ Database orders found: ${customerDbOrders.length}`);
        allOrders = [...allOrders, ...customerDbOrders];
      } catch (dbError) {
        console.warn('⚠️ Database not available, using local orders only:', dbError);
      }
      
      // Add local orders to the mix
      allOrders = [...allOrders, ...localOrders];
      
      // Deduplicate orders by orderId
      const uniqueOrders = allOrders.filter((order, index, self) => {
        const orderId = order.orderId || order.id;
        return index === self.findIndex(o => (o.orderId || o.id) === orderId);
      });
      
      // Sort by timestamp (newest first)
      uniqueOrders.sort((a, b) => {
        const dateA = new Date(a.timestamp || a.createdAt || a.created_at || 0);
        const dateB = new Date(b.timestamp || b.createdAt || b.created_at || 0);
        return dateB.getTime() - dateA.getTime();
      });
      
      console.log(`✅ Total unique orders loaded: ${uniqueOrders.length}`);
      setOrders(uniqueOrders);
    } catch (error) {
      console.error('❌ Failed to load customer orders:', error);
      // Fallback to localStorage orders only
      const fallbackOrders = OrderService.getAllOrders();
      console.log(`🔄 Fallback: Using ${fallbackOrders.length} local orders`);
      setOrders(fallbackOrders);
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
    navigate(`/customer/order-details/${order.orderId || order.id}`);
  };

  const handleTrackOrder = (order: any) => {
    // Store the selected order for tracking
    localStorage.setItem('currentOrder', JSON.stringify(order));
    // Navigate to tracking page
    navigate('/customer/track');
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
          <Card key={order.orderId || order.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base md:text-lg truncate pr-2">Order #{order.orderId || order.id}</CardTitle>
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
                    {order.deliveryAddress || order.customerAddress?.address || order.customer_address}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">₹{parseFloat(order.total).toFixed(2)}</p>
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
                {['out_for_delivery', 'confirmed', 'preparing'].includes(order.status) && (
                  <Button variant="outline" size="sm" onClick={() => handleTrackOrder(order)} className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100">
                    Track Order
                  </Button>
                )}
                {order.status === 'delivered' && (
                  <Button variant="outline" size="sm">
                    Reorder
                  </Button>
                )}
                {['pending', 'confirmed'].includes(order.status) && (
                  <Button variant="outline" size="sm" className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground">
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