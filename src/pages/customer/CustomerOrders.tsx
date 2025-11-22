import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, Clock, CheckCircle, Truck, XCircle } from "lucide-react";
import { CustomerDataService } from "@/lib/customerDataService";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const CustomerOrders = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      console.log('🔄 Loading orders...');
      setLoading(true);
      const customerOrders = await CustomerDataService.getCustomerOrders();
      console.log('📦 Orders loaded:', customerOrders);
      setOrders(customerOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
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
    localStorage.setItem('selectedOrderDetails', JSON.stringify({
      id: order.id,
      orderId: order.orderId,
      status: order.status,
      items: order.items,
      total: order.total,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      customerAddress: order.deliveryAddress,
      deliveryAddress: order.deliveryAddress,
      createdAt: order.createdAt,
      paymentStatus: order.paymentStatus
    }));
    navigate(`/customer/order-details/${order.orderId}`);
  };

  const handleTrackOrder = (order: any) => {
    navigate(`/customer/track?orderId=${order.orderId}`);
  };

  return (
    <div className="container mx-auto px-3 md:px-4 py-6 md:py-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-4">My Orders</h1>
        <p className="text-sm md:text-base text-muted-foreground">Track your order history and delivery status</p>
      </div>

      <div className="space-y-4 md:space-y-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading your orders...</p>
          </div>
        ) : orders.length > 0 ? orders.map((order) => (
          <Card key={order.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base md:text-lg truncate pr-2">Order #{order.orderId}</CardTitle>
                <Badge variant={getStatusVariant(order.status)} className="flex items-center gap-1">
                  {getStatusIcon(order.status)}
                  {formatStatus(order.status)}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Placed on {formatDate(order.createdAt)}
              </p>
            </CardHeader>
            
            <CardContent className="p-4 md:p-6 space-y-3 md:space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">Delivery Address</p>
                  <p className="text-sm text-muted-foreground">
                    {order.deliveryAddress}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">₹{order.total}</p>
                  <p className="text-sm text-muted-foreground">
                    Payment: {order.paymentStatus === 'paid' ? '✓ Paid' : 'Pending'}
                  </p>
                </div>
              </div>

              <div className="border rounded-lg p-4 bg-muted/30">
                <h4 className="font-semibold mb-3">Order Items</h4>
                <div className="space-y-2">
                  {Array.isArray(order.items) && order.items.slice(0, 3).map((item: any, index: number) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{item.product_name || item.name}</span>
                      <span>x{item.quantity}</span>
                    </div>
                  ))}
                  {Array.isArray(order.items) && order.items.length > 3 && (
                    <p className="text-xs text-muted-foreground">+{order.items.length - 3} more items</p>
                  )}
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
            <Button onClick={() => navigate('/customer')} className="bg-gradient-primary">
              Browse Products
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerOrders;