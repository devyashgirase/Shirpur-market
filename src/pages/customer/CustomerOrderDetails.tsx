import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Package, MapPin, Phone, Clock } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

const CustomerOrderDetails = () => {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { orderId } = useParams();

  useEffect(() => {
    loadOrderDetails();
  }, [orderId]);

  const loadOrderDetails = () => {
    try {
      const storedOrder = localStorage.getItem('selectedOrderDetails');
      if (storedOrder) {
        setOrder(JSON.parse(storedOrder));
      }
    } catch (error) {
      console.error('Failed to load order details:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'delivered': return 'secondary';
      case 'out_for_delivery': return 'default';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const handleTrackOrder = () => {
    localStorage.setItem('currentOrder', JSON.stringify(order));
    navigate('/customer/track');
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <Package className="w-24 h-24 text-muted-foreground mx-auto mb-6" />
          <h3 className="text-xl font-semibold mb-4">Order not found</h3>
          <Button onClick={() => navigate('/customer/orders')}>
            Back to Orders
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Order Details</h1>
            <p className="text-muted-foreground">Order #{order.orderId || order.id}</p>
          </div>
        </div>

        {/* Order Status */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Order Status</CardTitle>
              <Badge variant={getStatusVariant(order.status)}>
                {formatStatus(order.status)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Placed on</p>
                <p className="font-medium">
                  {new Date(order.createdAt || order.created_at || order.timestamp).toLocaleString()}
                </p>
              </div>
              {order.status === 'out_for_delivery' && (
                <Button onClick={handleTrackOrder} className="bg-gradient-primary">
                  <MapPin className="w-4 h-4 mr-2" />
                  🚚 Track Live Delivery
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Order Items */}
        <Card>
          <CardHeader>
            <CardTitle>Order Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(() => {
                try {
                  const items = Array.isArray(order.items) ? order.items : JSON.parse(order.items || '[]');
                  return items.map((item: any, index: number) => (
                <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                  {item.product?.image && (
                    <img 
                      src={item.product.image} 
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <h4 className="font-semibold">{item.product?.name || item.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      Quantity: {item.quantity}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Price: ₹{item.product?.price || item.price} each
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">
                      ₹{((item.product?.price || item.price) * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
                  ));
                } catch (error) {
                  console.error('Error parsing order items:', error);
                  return <p className="text-muted-foreground">Unable to load order items</p>;
                }
              })()}
            </div>
          </CardContent>
        </Card>

        {/* Delivery Address */}
        <Card>
          <CardHeader>
            <CardTitle>Delivery Address</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="font-medium">{order.customerName || 'Customer'}</p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                {order.customerPhone}
              </p>
              <p className="text-sm leading-relaxed">
                {order.deliveryAddress || order.customerAddress?.address || order.customer_address}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Payment Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{(parseFloat(order.total) - 4.99).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span>₹4.99</span>
              </div>
              <div className="border-t pt-3 flex justify-between font-bold text-lg">
                <span>Total Amount</span>
                <span>₹{parseFloat(order.total).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Payment Status</span>
                <span className={`font-medium ${
                  (order.paymentStatus || order.payment_status) === 'paid' 
                    ? 'text-green-600' 
                    : 'text-orange-600'
                }`}>
                  {(order.paymentStatus || order.payment_status) === 'paid' ? '✓ Paid' : 'Pending'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delivery Agent Info (if out for delivery) */}
        {order.status === 'out_for_delivery' && order.deliveryAgent && (
          <Card>
            <CardHeader>
              <CardTitle>Delivery Partner</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                  {order.deliveryAgent.name?.charAt(0) || 'D'}
                </div>
                <div>
                  <p className="font-semibold">{order.deliveryAgent.name}</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {order.deliveryAgent.phone}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CustomerOrderDetails;