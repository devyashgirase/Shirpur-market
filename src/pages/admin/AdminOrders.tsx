import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Clock, Package, Truck, CheckCircle, Eye } from "lucide-react";

interface OrderItem {
  product: {
    id: string;
    name: string;
    price: number;
  };
  quantity: number;
}

interface Order {
  orderId: string;
  status: string;
  timestamp: string;
  customerAddress: {
    name: string;
    phone: string;
    address: string;
  };
  items: OrderItem[];
  total: number;
  paymentStatus: string;
}

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  useEffect(() => {
    const loadOrders = () => {
      const allOrders = JSON.parse(localStorage.getItem('allOrders') || '[]');
      setOrders(allOrders.reverse()); // Show newest first
    };
    
    loadOrders();
    const interval = setInterval(loadOrders, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const updateOrderStatus = (orderId: string, newStatus: string) => {
    const updatedOrders = orders.map(order => 
      order.orderId === orderId ? { ...order, status: newStatus } : order
    );
    
    setOrders(updatedOrders);
    localStorage.setItem('allOrders', JSON.stringify(updatedOrders.reverse()));
    
    // Update current order if it matches
    const currentOrder = JSON.parse(localStorage.getItem('currentOrder') || '{}');
    if (currentOrder.orderId === orderId) {
      currentOrder.status = newStatus;
      localStorage.setItem('currentOrder', JSON.stringify(currentOrder));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-blue-500';
      case 'preparing': return 'bg-yellow-500';
      case 'packing': return 'bg-orange-500';
      case 'out_for_delivery': return 'bg-purple-500';
      case 'delivered': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <Clock className="w-4 h-4" />;
      case 'preparing': return <Package className="w-4 h-4" />;
      case 'packing': return <Package className="w-4 h-4" />;
      case 'out_for_delivery': return <Truck className="w-4 h-4" />;
      case 'delivered': return <CheckCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const openOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Recent Orders</h1>
      
      {orders.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Orders Yet</h3>
            <p className="text-muted-foreground">Orders will appear here when customers make purchases</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.orderId} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(order.status)}
                      <div>
                        <h3 className="font-semibold text-lg">Order #{order.orderId}</h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="font-semibold">₹{order.total.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">{order.items.length} items</p>
                    </div>
                    
                    <Badge className={`${getStatusColor(order.status)} text-white`}>
                      {order.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openOrderDetails(order)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Order Details Dialog */}
      <Dialog open={showOrderDetails} onOpenChange={setShowOrderDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Order Details - #{selectedOrder?.orderId}</DialogTitle>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6">
              {/* Customer Info */}
              <div>
                <h4 className="font-semibold mb-2">Customer Information</h4>
                <div className="bg-muted p-4 rounded-lg">
                  <p><strong>Name:</strong> {selectedOrder.customerAddress.name}</p>
                  <p><strong>Phone:</strong> {selectedOrder.customerAddress.phone}</p>
                  <p><strong>Address:</strong> {selectedOrder.customerAddress.address}</p>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h4 className="font-semibold mb-2">Order Items</h4>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                      <div>
                        <p className="font-medium">{item.product.name}</p>
                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-semibold">₹{(item.product.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-primary/10 rounded-lg">
                  <div className="flex justify-between font-bold">
                    <span>Total Amount:</span>
                    <span>₹{selectedOrder.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Status Management */}
              <div>
                <h4 className="font-semibold mb-3">Order Status Management</h4>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={() => updateOrderStatus(selectedOrder.orderId, 'preparing')}
                    disabled={selectedOrder.status !== 'confirmed'}
                    className="bg-yellow-500 hover:bg-yellow-600"
                  >
                    Mark as Preparing
                  </Button>
                  
                  <Button
                    onClick={() => updateOrderStatus(selectedOrder.orderId, 'packing')}
                    disabled={selectedOrder.status !== 'preparing'}
                    className="bg-orange-500 hover:bg-orange-600"
                  >
                    Mark as Packing
                  </Button>
                  
                  <Button
                    onClick={() => updateOrderStatus(selectedOrder.orderId, 'out_for_delivery')}
                    disabled={selectedOrder.status !== 'packing'}
                    className="bg-purple-500 hover:bg-purple-600"
                  >
                    Send for Delivery
                  </Button>
                  
                  <Button
                    onClick={() => updateOrderStatus(selectedOrder.orderId, 'delivered')}
                    disabled={selectedOrder.status !== 'out_for_delivery'}
                    className="bg-green-500 hover:bg-green-600"
                  >
                    Mark as Delivered
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminOrders;