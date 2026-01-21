import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, MapPin, Clock, Phone, Eye } from 'lucide-react';
import { CustomerDataService } from '@/lib/customerDataService';
import OrderTracking from '@/components/OrderTracking';

interface Order {
  id: string;
  orderId: string;
  status: string;
  total: number;
  items: any[];
  createdAt: string;
  deliveryAddress: string;
  customerName: string;
  customerPhone: string;
  paymentStatus: string;
}

const CustomerOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [showTracking, setShowTracking] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const customerOrders = await CustomerDataService.getCustomerOrders();
      setOrders(customerOrders);
    } catch (error) {
      console.error('Failed to load orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-blue-500';
      case 'preparing': return 'bg-yellow-500';
      case 'ready_for_delivery': return 'bg-orange-500';
      case 'out_for_delivery': return 'bg-green-500';
      case 'delivered': return 'bg-gray-500';
      default: return 'bg-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Order Confirmed';
      case 'preparing': return 'Preparing Order';
      case 'ready_for_delivery': return 'Ready for Delivery';
      case 'out_for_delivery': return 'Out for Delivery';
      case 'delivered': return 'Delivered';
      default: return 'Unknown Status';
    }
  };

  const canTrackOrder = (status: string) => {
    return ['confirmed', 'preparing', 'ready_for_delivery', 'out_for_delivery'].includes(status);
  };

  const handleTrackOrder = (orderId: string) => {
    setSelectedOrderId(orderId);
    setShowTracking(true);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <Package className="w-24 h-24 text-gray-400 mx-auto mb-6" />
          <h2 className="text-2xl font-bold mb-4">No Orders Yet</h2>
          <p className="text-gray-600 mb-6">
            You haven't placed any orders yet. Start shopping to see your orders here.
          </p>
          <Button onClick={() => window.location.href = '/customer'}>
            Start Shopping
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Orders</h1>
        <p className="text-gray-600">Track and manage your orders</p>
      </div>

      <div className="space-y-6">
        {orders.map((order) => (
          <Card key={order.id} className="overflow-hidden">
            <CardHeader className="bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Order #{order.orderId}</CardTitle>
                  <p className="text-sm text-gray-600">
                    Placed on {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <Badge className={`${getStatusColor(order.status)} text-white mb-2`}>
                    {getStatusText(order.status)}
                  </Badge>
                  <p className="text-lg font-bold">₹{order.total.toFixed(2)}</p>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Order Items */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    Items ({order.items.length})
                  </h4>
                  <div className="space-y-2">
                    {order.items.slice(0, 3).map((item, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span>{item.product_name || item.name}</span>
                        <span className="text-gray-600">
                          {item.quantity}x ₹{item.price}
                        </span>
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <p className="text-sm text-gray-500">
                        +{order.items.length - 3} more items
                      </p>
                    )}
                  </div>
                </div>

                {/* Delivery Info */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Delivery Address
                  </h4>
                  <p className="text-sm text-gray-600 mb-4">
                    {order.deliveryAddress}
                  </p>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleTrackOrder(order.orderId)}
                      disabled={!canTrackOrder(order.status)}
                      className="flex items-center gap-2 bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                    >
                      <MapPin className="w-4 h-4" />
                      {canTrackOrder(order.status) ? 'Track Live' : 'Tracking Unavailable'}
                    </Button>
                    
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      View Details
                    </Button>
                    
                    {order.status === 'out_for_delivery' && (
                      <Button variant="outline" size="sm" className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        Call Delivery
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Order Timeline */}
              <div className="mt-6 pt-6 border-t">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Order Progress
                </h4>
                <div className="flex items-center gap-4 overflow-x-auto">
                  {[
                    { status: 'confirmed', label: 'Confirmed' },
                    { status: 'preparing', label: 'Preparing' },
                    { status: 'ready_for_delivery', label: 'Ready' },
                    { status: 'out_for_delivery', label: 'Out for Delivery' },
                    { status: 'delivered', label: 'Delivered' }
                  ].map((step, index) => {
                    const statusOrder = ['confirmed', 'preparing', 'ready_for_delivery', 'out_for_delivery', 'delivered'];
                    const currentIndex = statusOrder.indexOf(order.status);
                    const isCompleted = index <= currentIndex;
                    const isCurrent = index === currentIndex;
                    
                    return (
                      <div key={step.status} className="flex items-center gap-2 whitespace-nowrap">
                        <div className={`w-3 h-3 rounded-full ${
                          isCompleted ? 'bg-green-500' : 'bg-gray-300'
                        } ${isCurrent ? 'ring-2 ring-green-300' : ''}`}></div>
                        <span className={`text-sm ${
                          isCompleted ? 'text-green-600 font-medium' : 'text-gray-500'
                        }`}>
                          {step.label}
                        </span>
                        {index < 4 && (
                          <div className={`w-8 h-0.5 ${
                            index < currentIndex ? 'bg-green-500' : 'bg-gray-300'
                          }`}></div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Order Tracking Modal */}
      {selectedOrderId && (
        <OrderTracking
          orderId={selectedOrderId}
          isOpen={showTracking}
          onClose={() => {
            setShowTracking(false);
            setSelectedOrderId(null);
          }}
        />
      )}
    </div>
  );
};

export default CustomerOrders;