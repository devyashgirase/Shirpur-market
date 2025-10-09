import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Package, Truck, CheckCircle, Eye, MapPin, Navigation, Bell, RefreshCw } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import WhatsAppStatus from "@/components/WhatsAppStatus";
import SMSHistory from "@/components/SMSHistory";
import { OrderService, Order } from "@/lib/orderService";
import { NotificationService } from "@/lib/notificationService";
import { apiService } from "@/lib/apiService";
import { unifiedDB, useSupabase } from "@/lib/database";
import { useToast } from "@/hooks/use-toast";
import { deliveryCoordinationService } from "@/lib/deliveryCoordinationService";



const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadOrders();
    
    // Subscribe to real-time order updates
    const unsubscribe = OrderService.subscribe((updatedOrders) => {
      setOrders([...updatedOrders].reverse()); // Show newest first
    });
    
    // Listen for new order events
    const handleNewOrder = () => {
      console.log('🔔 New order detected, refreshing admin orders...');
      loadOrders();
    };
    
    const handleOrderUpdate = () => {
      console.log('🔄 Order update detected, refreshing admin orders...');
      loadOrders();
    };
    
    // Listen for delivery agent status changes
    const handleOrderStatusChanged = (event: CustomEvent) => {
      console.log('🚚 Delivery agent status change:', event.detail);
      loadOrders();
      toast({
        title: "Order Status Updated",
        description: `Order ${event.detail.orderId} is now out for delivery`,
      });
    };
    
    window.addEventListener('orderCreated', handleNewOrder);
    window.addEventListener('ordersUpdated', handleOrderUpdate);
    window.addEventListener('newOrderAlert', handleNewOrder);
    window.addEventListener('orderStatusChanged', handleOrderStatusChanged as EventListener);
    
    return () => {
      unsubscribe();
      window.removeEventListener('orderCreated', handleNewOrder);
      window.removeEventListener('ordersUpdated', handleOrderUpdate);
      window.removeEventListener('newOrderAlert', handleNewOrder);
      window.removeEventListener('orderStatusChanged', handleOrderStatusChanged as EventListener);
    };
  }, [toast]);
  
  const loadOrders = async () => {
    try {
      console.log('📊 Loading orders from all sources...');
      
      // Load from localStorage first for instant display
      const localOrders = [...OrderService.getAllOrders()].reverse();
      setOrders(localOrders);
      
      // Try to load from API service (which handles both Supabase and MySQL)
      try {
        const apiOrders = await OrderService.getOrdersFromAPI();
        if (apiOrders.length > 0) {
          console.log('✅ Loaded orders from API:', apiOrders.length);
          setOrders([...apiOrders].reverse());
        }
      } catch (apiError) {
        console.warn('⚠️ API orders failed, trying direct database:', apiError);
        
        // Fallback to direct database if available
        if (useSupabase) {
          const dbOrders = await unifiedDB.getOrders();
          const formattedOrders = dbOrders.map(order => ({
            orderId: order.orderId || order.order_id,
            status: order.status,
            timestamp: order.createdAt || order.created_at,
            customerAddress: {
              name: order.customerName || order.customer_name,
              phone: order.customerPhone || order.customer_phone,
              address: order.deliveryAddress || order.delivery_address,
              coordinates: { lat: 21.3486, lng: 74.8811 }
            },
            items: order.items ? order.items.map(item => ({
              product: {
                id: item.product_id?.toString() || '0',
                name: item.product_name,
                price: parseFloat(item.price)
              },
              quantity: item.quantity
            })) : [],
            total: parseFloat(order.total),
            paymentStatus: order.paymentStatus || order.payment_status || 'paid',
            databaseId: order.id
          }));
          if (formattedOrders.length > 0) {
            console.log('✅ Loaded orders from database:', formattedOrders.length);
            setOrders(formattedOrders);
          }
        }
      }
    } catch (error) {
      console.warn('⚠️ All database sources failed, using local data:', error);
      // Already loaded localStorage data above
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      console.log('🔄 Updating order status:', orderId, '→', newStatus);
      
      // Validate status
      const validStatuses = ['pending', 'confirmed', 'packing', 'out_for_delivery', 'delivered'];
      if (!validStatuses.includes(newStatus)) {
        throw new Error(`Invalid status: ${newStatus}`);
      }
      
      // Update in OrderService (localStorage) - this always works
      const success = await OrderService.updateOrderStatus(orderId, newStatus as any);
      
      if (success) {
        console.log('✅ Local status update successful');
        
        // Try to update in database if available
        if (useSupabase) {
          try {
            const order = orders.find(o => o.orderId === orderId);
            if (order && order.databaseId) {
              await unifiedDB.updateOrderStatus(order.databaseId, newStatus);
              console.log('✅ Database status update successful');
            }
          } catch (dbError) {
            console.warn('⚠️ Database update failed, but local update succeeded:', dbError);
          }
        }
        
        // Create delivery notification for nearby agents when status is packing
        if (newStatus === 'packing') {
          const orderData = OrderService.getOrderById(orderId);
          if (orderData) {
            console.log('📦 Creating delivery notification for packing status');
            OrderService.createDeliveryNotification(orderData);
            NotificationService.sendDeliveryRequestNotification(
              orderId, 
              orderData.customerAddress.address, 
              orderData.total
            );
            
            // Trigger delivery agent refresh
            window.dispatchEvent(new CustomEvent('deliveryNotificationCreated', { detail: orderData }));
            window.dispatchEvent(new CustomEvent('ordersUpdated'));
          }
        }
        
        // Trigger order status change event for delivery agents
        if (newStatus === 'out_for_delivery') {
          window.dispatchEvent(new CustomEvent('orderStatusChanged', {
            detail: { orderId, status: newStatus }
          }));
        }
        
        toast({
          title: "Status Updated Successfully",
          description: `Order ${orderId} is now ${newStatus.replace('_', ' ')}`,
        });
        
        // Reload orders to reflect changes
        await loadOrders();
        
        // Send admin notification
        NotificationService.sendOrderStatusNotification(orderId, newStatus, 'admin');
      } else {
        throw new Error('OrderService.updateOrderStatus returned false');
      }
    } catch (error) {
      console.error('❌ Failed to update order status:', error);
      toast({
        title: "Update Failed",
        description: `Failed to update order status: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gray-500';
      case 'confirmed': return 'bg-blue-500';
      case 'packing': return 'bg-orange-500';
      case 'out_for_delivery': return 'bg-purple-500';
      case 'delivered': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'confirmed': return <CheckCircle className="w-4 h-4" />;
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
    <div className="container mx-auto px-3 md:px-4 py-4 md:py-8">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h1 className="text-xl md:text-3xl font-bold">Recent Orders</h1>
        <Button 
          onClick={loadOrders}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Orders
        </Button>
      </div>
      
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
              <CardContent className="p-3 md:p-6">
                {/* Mobile Layout */}
                <div className="md:hidden space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(order.status)}
                      <div>
                        <h3 className="font-semibold text-sm">#{order.orderId}</h3>
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
                    <div className="flex gap-1">
                      <QuickStatusChanger order={order} onStatusUpdate={updateOrderStatus} />
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
                    
                    <QuickStatusChanger order={order} onStatusUpdate={updateOrderStatus} />
                    
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
                <StatusManagement 
                  order={selectedOrder} 
                  onStatusUpdate={updateOrderStatus}
                />
              </TabsContent>
              
              <TabsContent value="tracking" className="space-y-4">
                <LiveTrackingMap order={selectedOrder} />
              </TabsContent>
              
              <TabsContent value="whatsapp" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <WhatsAppStatus orderId={selectedOrder?.orderId || ''} />
                  <SMSHistory />
                </div>
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
  const [mapReady, setMapReady] = useState(false);
  const [distance, setDistance] = useState<number | null>(null);

  // Calculate distance between two points
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + 
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Fix Leaflet default marker icons
  useEffect(() => {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
    setMapReady(true);
  }, []);

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
    // Get delivery agent location and customer location
    const updateLocations = () => {
      // Get delivery agent location from order or localStorage
      if (order.deliveryAgent?.location) {
        setDeliveryLocation(order.deliveryAgent.location);
        setDeliveryAgent(order.deliveryAgent);
      } else {
        const agentLocation = JSON.parse(localStorage.getItem('deliveryAgentLocation') || 'null');
        if (agentLocation && agentLocation.orderId === order.orderId) {
          setDeliveryLocation({ lat: agentLocation.lat, lng: agentLocation.lng });
          setDeliveryAgent(agentLocation);
        }
      }
      
      // Set customer location from order
      if (order.customerAddress.coordinates) {
        setCustomerLocation(order.customerAddress.coordinates);
      }
    };
    
    updateLocations();
    const interval = setInterval(updateLocations, 3000); // Update every 3 seconds
    return () => clearInterval(interval);
  }, [order]);

  // Calculate distance when both locations are available
  useEffect(() => {
    if (deliveryLocation && customerLocation) {
      const dist = calculateDistance(
        deliveryLocation.lat, deliveryLocation.lng,
        customerLocation.lat, customerLocation.lng
      );
      setDistance(dist);
    } else {
      setDistance(null);
    }
  }, [deliveryLocation, customerLocation]);

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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Truck className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h5 className="font-medium">Delivery Agent</h5>
                <p className="text-sm text-muted-foreground">
                  {order.deliveryAgent ? `${order.deliveryAgent.name}` : 'Not assigned yet'}
                </p>
                <p className="text-xs text-green-600">
                  {deliveryLocation ? '📍 Live' : '⚫ Offline'}
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

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Navigation className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h5 className="font-medium">Distance</h5>
                <p className="text-lg font-bold text-green-600">
                  {distance ? `${distance.toFixed(2)} km` : 'Calculating...'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {distance ? `~${Math.round(distance * 3)} min` : 'ETA pending'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Map */}
      <div className="h-96 rounded-lg overflow-hidden border">
        {mapReady ? (
          <MapContainer
            center={[mapCenter.lat, mapCenter.lng]}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
            key={`map-${order.orderId}`}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            
            {deliveryLocation && (
              <Marker position={[deliveryLocation.lat, deliveryLocation.lng]} icon={deliveryIcon}>
                <Popup>
                  <div className="text-center">
                    <strong>🚚 Delivery Agent</strong><br />
                    {order.deliveryAgent?.name || 'Agent'}<br />
                    <span className="text-green-600">📍 Live Location</span>
                  </div>
                </Popup>
              </Marker>
            )}
            
            {customerLocation && (
              <Marker position={[customerLocation.lat, customerLocation.lng]} icon={customerIcon}>
                <Popup>
                  <div className="text-center">
                    <strong>🏠 Customer Location</strong><br />
                    {order.customerAddress?.name || 'Customer'}<br />
                    <span className="text-xs">{order.customerAddress?.address || 'Address not available'}</span>
                  </div>
                </Popup>
              </Marker>
            )}
          </MapContainer>
        ) : (
          <div className="flex items-center justify-center h-full bg-muted">
            <div className="text-center">
              <div className="loading-spinner mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">Loading map...</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Delivery Status */}
      <div className="bg-muted p-4 rounded-lg">
        <h5 className="font-medium mb-2">📋 Delivery Information</h5>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Order ID:</span>
            <span className="font-medium">#{order.orderId}</span>
          </div>
          <div className="flex justify-between">
            <span>Customer:</span>
            <span className="font-medium">{order.customerAddress?.name || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span>Phone:</span>
            <span className="font-medium">{order.customerAddress?.phone || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span>Address:</span>
            <span className="font-medium text-right text-xs">{order.customerAddress?.address || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span>Payment Status:</span>
            <Badge variant="outline" className="bg-green-100 text-green-800">
              ✅ {order.paymentStatus.toUpperCase()}
            </Badge>
          </div>
          <div className="flex justify-between">
            <span>Order Status:</span>
            <Badge className={`${getOrderStatusColor(order.status)} text-white`}>
              {order.status.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>
          {order.status === 'out_for_delivery' && (
            <div className="mt-3 p-2 bg-blue-50 rounded border border-blue-200">
              <p className="text-blue-800 text-xs font-medium">🚚 Live tracking active - Updates every 3 seconds</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Status Management Component with Apply Button
const StatusManagement = ({ order, onStatusUpdate }: { order: Order; onStatusUpdate: (orderId: string, status: string) => void }) => {
  const [selectedStatus, setSelectedStatus] = useState(order.status);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { toast } = useToast();

  const statusOptions = [
    { value: 'pending', label: 'Pending', color: 'bg-gray-500', disabled: false },
    { value: 'confirmed', label: 'Confirmed', color: 'bg-blue-500', disabled: false },
    { value: 'packing', label: 'Ready for Delivery', color: 'bg-orange-500', disabled: false },
    { value: 'out_for_delivery', label: 'Out for Delivery', color: 'bg-purple-500', disabled: false },
    { value: 'delivered', label: 'Delivered', color: 'bg-green-500', disabled: false }
  ];

  const handleApplyStatus = () => {
    if (selectedStatus === order.status) {
      toast({
        title: "No Change",
        description: "Status is already set to this value",
        variant: "destructive"
      });
      return;
    }
    setShowConfirmation(true);
  };

  const confirmStatusChange = () => {
    onStatusUpdate(order.orderId, selectedStatus);
    setShowConfirmation(false);
    toast({
      title: "Status Updated",
      description: `Order status changed to ${selectedStatus.replace('_', ' ')}`
    });
  };

  return (
    <div>
      <h4 className="font-semibold mb-3">Order Status Management</h4>
      
      <div className="space-y-4">
        {/* Current Status Display */}
        <div className="p-3 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground mb-1">Current Status:</p>
          <Badge className={`${statusOptions.find(s => s.value === order.status)?.color} text-white`}>
            {order.status.replace('_', ' ').toUpperCase()}
          </Badge>
        </div>

        {/* Status Selection */}
        <div>
          <p className="text-sm font-medium mb-2">Change Status To:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {statusOptions.map((status) => (
              <Button
                key={status.value}
                variant={selectedStatus === status.value ? "default" : "outline"}
                onClick={() => setSelectedStatus(status.value)}
                className={selectedStatus === status.value ? `${status.color} text-white` : ''}
                size="sm"
              >
                {status.label}
                {status.value === order.status && " (Current)"}
              </Button>
            ))}
          </div>
        </div>

        {/* Apply Button */}
        <div className="flex justify-center">
          <Button
            onClick={handleApplyStatus}
            disabled={selectedStatus === order.status}
            className="bg-primary hover:bg-primary/90 px-8"
            size="lg"
          >
            Apply Status Change
          </Button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Status Change</DialogTitle>
            <DialogDescription>
              Are you sure you want to change the order status from "{order.status.replace('_', ' ')}" to "{selectedStatus.replace('_', ' ')}"?
              {selectedStatus === 'packing' && (
                <div className="mt-2 p-2 bg-orange-50 rounded border border-orange-200">
                  <p className="text-orange-800 text-sm font-medium">
                    ⚠️ This will make the order available for delivery agents
                  </p>
                </div>
              )}
              {selectedStatus === 'out_for_delivery' && (
                <div className="mt-2 p-2 bg-purple-50 rounded border border-purple-200">
                  <p className="text-purple-800 text-sm font-medium">
                    🚚 This will mark the order as out for delivery
                  </p>
                </div>
              )}
              {selectedStatus === 'delivered' && (
                <div className="mt-2 p-2 bg-green-50 rounded border border-green-200">
                  <p className="text-green-800 text-sm font-medium">
                    ✅ This will mark the order as completed
                  </p>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowConfirmation(false)}>
              Cancel
            </Button>
            <Button onClick={confirmStatusChange} className="bg-primary">
              Confirm Change
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Quick Status Changer Component for inline status updates
const QuickStatusChanger = ({ order, onStatusUpdate }: { order: Order; onStatusUpdate: (orderId: string, status: string) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const statusOptions = [
    { value: 'pending', label: 'Pending', color: 'bg-gray-500', icon: <Clock className="w-3 h-3" /> },
    { value: 'confirmed', label: 'Confirmed', color: 'bg-blue-500', icon: <CheckCircle className="w-3 h-3" /> },
    { value: 'packing', label: 'Packing', color: 'bg-orange-500', icon: <Package className="w-3 h-3" /> },
    { value: 'out_for_delivery', label: 'Out for Delivery', color: 'bg-purple-500', icon: <Truck className="w-3 h-3" /> },
    { value: 'delivered', label: 'Delivered', color: 'bg-green-500', icon: <CheckCircle className="w-3 h-3" /> }
  ];

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === order.status) {
      toast({
        title: "No Change",
        description: "Status is already set to this value",
        variant: "destructive"
      });
      return;
    }

    try {
      await onStatusUpdate(order.orderId, newStatus);
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1"
      >
        <RefreshCw className="w-3 h-3" />
        <span className="hidden sm:inline">Status</span>
      </Button>
      
      {isOpen && (
        <div className="absolute top-full right-0 mt-1 bg-white border rounded-lg shadow-lg z-50 min-w-48">
          <div className="p-2">
            <p className="text-xs font-medium text-gray-600 mb-2">Change Status:</p>
            <div className="space-y-1">
              {statusOptions.map((status) => (
                <button
                  key={status.value}
                  onClick={() => handleStatusChange(status.value)}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-gray-50 transition-colors ${
                    status.value === order.status ? 'bg-blue-50 border border-blue-200' : ''
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full ${status.color} flex items-center justify-center text-white`}>
                    {status.icon}
                  </div>
                  <span className={status.value === order.status ? 'font-medium text-blue-700' : ''}>
                    {status.label}
                    {status.value === order.status && ' (Current)'}
                  </span>
                </button>
              ))}
            </div>
          </div>
          
          <div className="border-t p-2">
            <button
              onClick={() => setIsOpen(false)}
              className="w-full text-xs text-gray-500 hover:text-gray-700 py-1"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      
      {/* Backdrop to close dropdown */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminOrders;