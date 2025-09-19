import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import { divIcon } from "leaflet";
import { Truck, Package, User, Phone, MapPin, Clock } from "lucide-react";

interface Order {
  orderId: string;
  status: string;
  customerAddress: any;
  deliveryAgent: any;
  items: any[];
  total: number;
  timestamp: string;
  acceptedAt?: string;
}

const AdminLiveTracking = () => {
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    const loadActiveOrders = () => {
      const allOrders = JSON.parse(localStorage.getItem('allOrders') || '[]');
      const ordersWithAgents = allOrders.filter((order: Order) => 
        order.deliveryAgent && ['assigned_to_delivery', 'picked_up', 'out_for_delivery'].includes(order.status)
      );
      setActiveOrders(ordersWithAgents);
      
      if (selectedOrder) {
        const updatedSelected = ordersWithAgents.find((o: Order) => o.orderId === selectedOrder.orderId);
        setSelectedOrder(updatedSelected || null);
      }
    };

    loadActiveOrders();
    const interval = setInterval(loadActiveOrders, 3000);
    return () => clearInterval(interval);
  }, [selectedOrder]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'assigned_to_delivery': return 'bg-blue-500';
      case 'picked_up': return 'bg-yellow-500';
      case 'out_for_delivery': return 'bg-purple-500';
      case 'delivered': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const createCustomIcon = (emoji: string, color: string) => {
    return divIcon({
      html: `<div style="background-color: ${color}; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">${emoji}</div>`,
      className: 'custom-div-icon',
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });
  };

  const getRouteCoordinates = (order: Order) => {
    if (!order.deliveryAgent?.location || !order.customerAddress?.coordinates) return [];
    
    return [
      [order.deliveryAgent.location.lat, order.deliveryAgent.location.lng],
      [order.customerAddress.coordinates.lat, order.customerAddress.coordinates.lng]
    ];
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Live Order Tracking</h1>
      
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Orders List */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-xl font-semibold">Active Deliveries ({activeOrders.length})</h2>
          
          {activeOrders.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <Truck className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No active deliveries</p>
              </CardContent>
            </Card>
          ) : (
            activeOrders.map((order) => (
              <Card 
                key={order.orderId} 
                className={`cursor-pointer transition-all ${selectedOrder?.orderId === order.orderId ? 'ring-2 ring-primary' : 'hover:shadow-md'}`}
                onClick={() => setSelectedOrder(order)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">#{order.orderId}</h3>
                    <Badge className={`${getStatusColor(order.status)} text-white`}>
                      {order.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span>{order.customerAddress?.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Truck className="w-4 h-4 text-muted-foreground" />
                      <span>{order.deliveryAgent?.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Package className="w-4 h-4 text-muted-foreground" />
                      <span>₹{order.total.toFixed(2)} • {order.items.length} items</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Map and Details */}
        <div className="lg:col-span-2 space-y-6">
          {selectedOrder ? (
            <>
              {/* Order Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Details - #{selectedOrder.orderId}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        Customer Information
                      </h4>
                      <div className="space-y-2 text-sm">
                        <p><strong>Name:</strong> {selectedOrder.customerAddress?.name}</p>
                        <p><strong>Phone:</strong> {selectedOrder.customerAddress?.phone}</p>
                        <p><strong>Address:</strong> {selectedOrder.customerAddress?.address}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center">
                        <Truck className="w-4 h-4 mr-2" />
                        Delivery Agent
                      </h4>
                      <div className="space-y-2 text-sm">
                        <p><strong>Name:</strong> {selectedOrder.deliveryAgent?.name}</p>
                        <p><strong>Phone:</strong> {selectedOrder.deliveryAgent?.phone}</p>
                        <p><strong>Status:</strong> 
                          <Badge className={`ml-2 ${getStatusColor(selectedOrder.status)} text-white`}>
                            {selectedOrder.status.replace('_', ' ')}
                          </Badge>
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <h4 className="font-semibold mb-3 flex items-center">
                      <Package className="w-4 h-4 mr-2" />
                      Order Items
                    </h4>
                    <div className="space-y-2">
                      {selectedOrder.items.map((item, index) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-muted rounded">
                          <span className="text-sm">{item.quantity}x {item.product.name}</span>
                          <span className="text-sm font-medium">₹{(item.product.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                      <div className="flex justify-between items-center p-2 bg-primary/10 rounded font-semibold">
                        <span>Total Amount:</span>
                        <span>₹{selectedOrder.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Live Map */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="w-5 h-5 mr-2" />
                    Live Tracking Map
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-96 rounded-lg overflow-hidden">
                    <MapContainer
                      center={[20.7516, 74.2297]}
                      zoom={13}
                      style={{ height: '100%', width: '100%' }}
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      />
                      
                      {/* Delivery Agent Location */}
                      {selectedOrder.deliveryAgent?.location && (
                        <Marker
                          position={[selectedOrder.deliveryAgent.location.lat, selectedOrder.deliveryAgent.location.lng]}
                          icon={createCustomIcon('🚚', '#3b82f6')}
                        >
                          <Popup>
                            <div className="text-center">
                              <strong>{selectedOrder.deliveryAgent.name}</strong><br />
                              <span className="text-sm">Delivery Agent</span><br />
                              <span className="text-xs">{selectedOrder.deliveryAgent.phone}</span>
                            </div>
                          </Popup>
                        </Marker>
                      )}
                      
                      {/* Customer Location */}
                      {selectedOrder.customerAddress?.coordinates && (
                        <Marker
                          position={[selectedOrder.customerAddress.coordinates.lat, selectedOrder.customerAddress.coordinates.lng]}
                          icon={createCustomIcon('📍', '#ef4444')}
                        >
                          <Popup>
                            <div className="text-center">
                              <strong>{selectedOrder.customerAddress.name}</strong><br />
                              <span className="text-sm">Delivery Address</span><br />
                              <span className="text-xs">{selectedOrder.customerAddress.address}</span>
                            </div>
                          </Popup>
                        </Marker>
                      )}
                      
                      {/* Route Line */}
                      {getRouteCoordinates(selectedOrder).length > 0 && (
                        <Polyline
                          positions={getRouteCoordinates(selectedOrder)}
                          color="#8b5cf6"
                          weight={3}
                          opacity={0.7}
                          dashArray="10, 10"
                        />
                      )}
                    </MapContainer>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <MapPin className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Select an Order</h3>
                <p className="text-muted-foreground">Choose an active delivery from the list to view live tracking details</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminLiveTracking;