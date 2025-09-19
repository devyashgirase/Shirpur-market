import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Package, Truck, CheckCircle, Eye, MapPin, Navigation } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import WhatsAppStatus from "@/components/WhatsAppStatus";

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
      let allOrders = JSON.parse(localStorage.getItem('allOrders') || '[]');
      
      // Add sample orders if none exist
      if (allOrders.length === 0) {
        const sampleOrders = [
          {
            orderId: 'ORD1001',
            status: 'pending_delivery',
            timestamp: new Date().toISOString(),
            customerAddress: {
              name: 'John Doe',
              phone: '+91 98765 43210',
              address: '123 Main Street, Shirpur, Maharashtra 425405'
            },
            items: [
              {
                product: { id: '1', name: 'Fresh Apples', price: 120 },
                quantity: 2
              },
              {
                product: { id: '2', name: 'Organic Bananas', price: 80 },
                quantity: 1
              }
            ],
            total: 320,
            paymentStatus: 'paid'
          },
          {
            orderId: 'ORD1002',
            status: 'confirmed',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            customerAddress: {
              name: 'Jane Smith',
              phone: '+91 87654 32109',
              address: '456 Park Avenue, Shirpur, Maharashtra 425405'
            },
            items: [
              {
                product: { id: '3', name: 'Rice (5kg)', price: 250 },
                quantity: 1
              }
            ],
            total: 250,
            paymentStatus: 'paid'
          }
        ];
        localStorage.setItem('allOrders', JSON.stringify(sampleOrders));
        allOrders = sampleOrders;
      }
      
      setOrders([...allOrders].reverse()); // Show newest first
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
    <div className="container mx-auto px-4 py-4 md:py-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">Recent Orders</h1>
      
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
              <CardContent className="p-4 md:p-6">
                {/* Mobile Layout */}
                <div className="md:hidden space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(order.status)}
                      <div>
                        <h3 className="font-semibold text-base">#{order.orderId}</h3>
                        <p className="text-xs text-muted-foreground">
                          {new Date(order.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge className={`${getStatusColor(order.status)} text-white text-xs`}>
                      {order.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">₹{order.total.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">{order.items.length} items</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openOrderDetails(order)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                  </div>
                </div>
                
                {/* Desktop Layout */}
                <div className="hidden md:flex items-center justify-between">
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details - #{selectedOrder?.orderId}</DialogTitle>
            <DialogDescription>
              View and manage order details, tracking, and WhatsApp communications
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Order Details</TabsTrigger>
                <TabsTrigger value="tracking">Live Tracking</TabsTrigger>
                <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="space-y-6">
                {/* Customer Info */}
                <div>
                  <h4 className="font-semibold mb-2">Customer Information</h4>
                  <div className="bg-muted p-4 rounded-lg">
                    <p><strong>Name:</strong> {selectedOrder.customerAddress?.name || 'N/A'}</p>
                    <p><strong>Phone:</strong> {selectedOrder.customerAddress?.phone || 'N/A'}</p>
                    <p><strong>Address:</strong> {selectedOrder.customerAddress?.address || 'N/A'}</p>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Button
                      onClick={() => updateOrderStatus(selectedOrder.orderId, 'preparing')}
                      disabled={selectedOrder.status !== 'confirmed' && selectedOrder.status !== 'pending_delivery'}
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
              </TabsContent>
              
              <TabsContent value="tracking" className="space-y-4">
                <LiveTrackingMap order={selectedOrder} />
              </TabsContent>
              
              <TabsContent value="whatsapp" className="space-y-4">
                <WhatsAppStatus orderId={selectedOrder?.orderId || ''} />
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Live Tracking Map Component
const LiveTrackingMap = ({ order }: { order: Order }) => {
  const [deliveryLocation, setDeliveryLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [customerLocation, setCustomerLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [deliveryAgent, setDeliveryAgent] = useState<any>(null);

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-blue-500';
      case 'preparing': return 'bg-yellow-500';
      case 'packing': return 'bg-orange-500';
      case 'out_for_delivery': return 'bg-purple-500';
      case 'delivered': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  useEffect(() => {
    // Get delivery agent location from localStorage
    const updateLocations = () => {
      const agentLocation = JSON.parse(localStorage.getItem('deliveryAgentLocation') || 'null');
      const custAddress = JSON.parse(localStorage.getItem('customerAddress') || 'null');
      
      if (agentLocation) {
        setDeliveryLocation({ lat: agentLocation.lat, lng: agentLocation.lng });
        setDeliveryAgent(agentLocation);
      }
      
      // Set customer location (using sample coordinates for Shirpur)
      if (custAddress) {
        setCustomerLocation({ lat: 21.3487, lng: 74.8831 }); // Shirpur coordinates
      }
    };
    
    updateLocations();
    const interval = setInterval(updateLocations, 3000); // Update every 3 seconds
    return () => clearInterval(interval);
  }, []);

  // Create custom icons
  const deliveryIcon = L.divIcon({
    html: '<div style="background: #3B82F6; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-size: 16px; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">🚚</div>',
    className: 'custom-div-icon',
    iconSize: [30, 30],
    iconAnchor: [15, 15]
  });

  const customerIcon = L.divIcon({
    html: '<div style="background: #EF4444; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-size: 16px; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">📍</div>',
    className: 'custom-div-icon',
    iconSize: [30, 30],
    iconAnchor: [15, 15]
  });

  const mapCenter = deliveryLocation || customerLocation || { lat: 21.3487, lng: 74.8831 };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold flex items-center gap-2">
          <Navigation className="w-5 h-5" />
          Live Delivery Tracking
        </h4>
        <Badge className={`${getOrderStatusColor(order.status)} text-white`}>
          {order.status.replace('_', ' ').toUpperCase()}
        </Badge>
      </div>
      
      {/* Tracking Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Truck className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h5 className="font-medium">Delivery Agent</h5>
                <p className="text-sm text-muted-foreground">
                  {deliveryAgent ? `${deliveryAgent.name} - ${deliveryAgent.phone}` : 'Not assigned yet'}
                </p>
                <p className="text-xs text-green-600">
                  {deliveryLocation ? 'Location: Live' : 'Location: Offline'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <MapPin className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h5 className="font-medium">Customer</h5>
                <p className="text-sm text-muted-foreground">{order.customerAddress?.name || 'N/A'}</p>
                <p className="text-xs text-muted-foreground">{order.customerAddress?.phone || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Map */}
      <div className="h-96 rounded-lg overflow-hidden border">
        <MapContainer
          center={[mapCenter.lat, mapCenter.lng]}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          {deliveryLocation && (
            <Marker position={[deliveryLocation.lat, deliveryLocation.lng]} icon={deliveryIcon}>
              <Popup>
                <div className="text-center">
                  <strong>Delivery Agent</strong><br />
                  {deliveryAgent?.name}<br />
                  <span className="text-green-600">Live Location</span>
                </div>
              </Popup>
            </Marker>
          )}
          
          {customerLocation && (
            <Marker position={[customerLocation.lat, customerLocation.lng]} icon={customerIcon}>
              <Popup>
                <div className="text-center">
                  <strong>Customer Location</strong><br />
                  {order.customerAddress?.name || 'Customer'}<br />
                  {order.customerAddress?.address || 'Address not available'}
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>
      
      {/* Delivery Status */}
      <div className="bg-muted p-4 rounded-lg">
        <h5 className="font-medium mb-2">Delivery Information</h5>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Order ID:</span>
            <span className="font-medium">#{order.orderId}</span>
          </div>
          <div className="flex justify-between">
            <span>Customer Address:</span>
            <span className="font-medium text-right">{order.customerAddress?.address || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span>Payment Status:</span>
            <Badge variant="outline" className="bg-green-100 text-green-800">
              {order.paymentStatus.toUpperCase()}
            </Badge>
          </div>
          <div className="flex justify-between">
            <span>Estimated Delivery:</span>
            <span className="font-medium">30-45 minutes</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;