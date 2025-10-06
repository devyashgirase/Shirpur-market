import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Truck, Clock, CheckCircle, Package, RefreshCw, ArrowLeft } from "lucide-react";
import { TrackingDashboard } from "@/components/TrackingDashboard";
import { OrderService, Order } from "@/lib/orderService";
import { NotificationService } from "@/lib/notificationService";
import { EnhancedTrackingService } from "@/lib/enhancedTrackingService";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const CustomerOrderTracking = () => {
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [customerAddress, setCustomerAddress] = useState<any>(null);
  const [lastStatus, setLastStatus] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const refreshOrderData = async () => {
    setIsLoading(true);
    try {
      const apiOrders = await OrderService.getOrdersFromAPI();
      const storedOrder = localStorage.getItem('currentOrder');
      
      if (storedOrder) {
        const orderData = JSON.parse(storedOrder);
        const apiOrder = apiOrders.find(order => order.orderId === orderData.orderId);
        if (apiOrder) {
          setCurrentOrder(apiOrder);
          localStorage.setItem('currentOrder', JSON.stringify(apiOrder));
          toast({
            title: "Order Updated",
            description: "Latest order status loaded",
          });
        }
      }
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Could not fetch latest order status",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
  }, []);

  const deliveryIcon = L.divIcon({
    html: `<div style="background-color: #2563eb; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"><span style="color: white; font-size: 16px;">🚚</span></div>`,
    className: 'custom-div-icon',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });

  const customerIcon = L.divIcon({
    html: `<div style="background-color: #dc2626; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"><span style="color: white; font-size: 16px;">📍</span></div>`,
    className: 'custom-div-icon',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });

  useEffect(() => {
    const loadOrderData = async () => {
      try {
        const apiOrders = await OrderService.getOrdersFromAPI();
        const storedOrder = localStorage.getItem('currentOrder');
        const storedAddress = localStorage.getItem('customerAddress');
        
        if (storedOrder) {
          let orderData = JSON.parse(storedOrder);
          const apiOrder = apiOrders.find(order => order.orderId === orderData.orderId);
          if (apiOrder) {
            orderData = apiOrder;
          }
          
          // Add mock delivery agent and customer address for demo
          if (orderData.status === 'out_for_delivery') {
            if (!orderData.deliveryAgent) {
              orderData.deliveryAgent = {
                name: 'Rahul Sharma',
                phone: '+91 98765 43210',
                location: {
                  lat: 21.3099 + (Math.random() - 0.5) * 0.01,
                  lng: 75.1178 + (Math.random() - 0.5) * 0.01
                }
              };
            }
            
            if (!customerAddress) {
              const mockAddress = {
                name: 'Customer',
                phone: orderData.customerPhone || '+91 98765 43210',
                address: orderData.deliveryAddress || 'Shirpur, Maharashtra',
                coordinates: {
                  lat: 21.3099,
                  lng: 75.1178
                }
              };
              setCustomerAddress(mockAddress);
              localStorage.setItem('customerAddress', JSON.stringify(mockAddress));
            }
          }
          
          setCurrentOrder(orderData);
          setLastStatus(orderData.status);
        }
        
        if (storedAddress) {
          setCustomerAddress(JSON.parse(storedAddress));
        }
      } catch (error) {
        console.error('Failed to load order data:', error);
        const storedOrder = localStorage.getItem('currentOrder');
        const storedAddress = localStorage.getItem('customerAddress');
        
        if (storedOrder) {
          let orderData = JSON.parse(storedOrder);
          
          // Add mock data for demo even in error case
          if (orderData.status === 'out_for_delivery') {
            if (!orderData.deliveryAgent) {
              orderData.deliveryAgent = {
                name: 'Rahul Sharma',
                phone: '+91 98765 43210',
                location: {
                  lat: 21.3099 + (Math.random() - 0.5) * 0.01,
                  lng: 75.1178 + (Math.random() - 0.5) * 0.01
                }
              };
            }
            
            if (!customerAddress) {
              const mockAddress = {
                name: 'Customer',
                phone: orderData.customerPhone || '+91 98765 43210',
                address: orderData.deliveryAddress || 'Shirpur, Maharashtra',
                coordinates: {
                  lat: 21.3099,
                  lng: 75.1178
                }
              };
              setCustomerAddress(mockAddress);
              localStorage.setItem('customerAddress', JSON.stringify(mockAddress));
            }
          }
          
          setCurrentOrder(orderData);
          setLastStatus(orderData.status);
        }
        
        if (storedAddress) {
          setCustomerAddress(JSON.parse(storedAddress));
        }
      }
    };

    loadOrderData();

    const unsubscribe = OrderService.subscribe((orders) => {
      const storedOrderId = JSON.parse(localStorage.getItem('currentOrder') || '{}').orderId;
      if (storedOrderId) {
        const updatedOrder = orders.find(order => order.orderId === storedOrderId);
        if (updatedOrder) {
          setCurrentOrder(updatedOrder);
          
          if (lastStatus && updatedOrder.status !== lastStatus) {
            const statusMessages = {
              confirmed: '✅ Your order has been confirmed!',
              packing: '📦 Your order is being packed',
              out_for_delivery: '🚚 Your order is out for delivery!',
              delivered: '🎉 Your order has been delivered!'
            };
            
            const message = statusMessages[updatedOrder.status as keyof typeof statusMessages];
            if (message) {
              toast({
                title: "Order Update",
                description: message,
              });
            }
            
            // Start enhanced tracking when status changes to out_for_delivery
            if (updatedOrder.status === 'out_for_delivery') {
              // Get real customer GPS location
              if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                  (position) => {
                    const customerLocation = {
                      lat: position.coords.latitude,
                      lng: position.coords.longitude,
                      accuracy: position.coords.accuracy,
                      timestamp: Date.now()
                    };
                    EnhancedTrackingService.startOrderTracking(updatedOrder.orderId, 'agent_001', customerLocation);
                  },
                  (error) => {
                    console.error('GPS error:', error);
                    // Fallback to Shirpur Main Market location
                    const customerLocation = {
                      lat: 21.3486,
                      lng: 74.8811,
                      accuracy: 10,
                      timestamp: Date.now()
                    };
                    EnhancedTrackingService.startOrderTracking(updatedOrder.orderId, 'agent_001', customerLocation);
                  },
                  { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
                );
              } else {
                // Fallback if geolocation not supported
                const customerLocation = {
                  lat: 21.3486,
                  lng: 74.8811,
                  accuracy: 10,
                  timestamp: Date.now()
                };
                EnhancedTrackingService.startOrderTracking(updatedOrder.orderId, 'agent_001', customerLocation);
              }
            }
          }
          
          setLastStatus(updatedOrder.status);
        }
      }
    });

    NotificationService.requestPermission();
    
    return unsubscribe;
  }, [lastStatus, toast]);

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100', text: 'Order Placed' };
      case 'confirmed':
        return { icon: Package, color: 'text-blue-600', bg: 'bg-blue-100', text: 'Order Confirmed' };
      case 'packing':
        return { icon: Package, color: 'text-orange-600', bg: 'bg-orange-100', text: 'Packing Your Order' };
      case 'out_for_delivery':
        return { icon: Truck, color: 'text-primary', bg: 'bg-blue-100', text: 'Out for Delivery' };
      case 'delivered':
        return { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100', text: 'Delivered' };
      default:
        return { icon: Clock, color: 'text-gray-600', bg: 'bg-gray-100', text: 'Processing' };
    }
  };

  const statusInfo = getStatusInfo(currentOrder?.status || 'pending');
  const StatusIcon = statusInfo.icon;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-4 md:space-y-6">
        <div className="mb-6 md:mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="flex-1 text-center">
              <h1 className="text-2xl md:text-3xl font-bold">Track Your Order</h1>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refreshOrderData}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          <p className="text-sm md:text-base text-muted-foreground px-4">Real-time delivery tracking from database</p>
        </div>

        <Card>
          <CardHeader className="p-6">
            <CardTitle className="flex items-center text-lg">
              <StatusIcon className={`w-6 h-6 mr-2 ${statusInfo.color}`} />
              <span className="truncate">Order #{currentOrder?.orderId || 'No active order'}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="flex items-center justify-between mb-4 gap-2">
              {currentOrder ? (
                <>
                  <Badge className={`${statusInfo.bg} ${statusInfo.color} border-0 text-sm w-fit`}>
                    {statusInfo.text}
                  </Badge>
                  {currentOrder.timestamp && (
                    <span className="text-sm text-muted-foreground block mt-2">
                      Last updated: {new Date(currentOrder.timestamp).toLocaleTimeString()}
                    </span>
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg font-medium text-muted-foreground mb-2">No Active Orders</p>
                  <p className="text-sm text-muted-foreground px-4">Place an order from our products to start tracking</p>
                  <Button className="mt-4" onClick={() => navigate('/customer')}>
                    Browse Products
                  </Button>
                </div>
              )}
            </div>
            
            {currentOrder && (
              <>
                {currentOrder.status === 'confirmed' && (
                  <div className="bg-blue-50 p-3 rounded text-sm text-blue-800 mt-3">
                    ✅ Your order has been confirmed and is being prepared by our team.
                  </div>
                )}
                {currentOrder.status === 'packing' && (
                  <div className="bg-orange-50 p-3 rounded text-sm text-orange-800 mt-3">
                    📦 Your order is being packed and will be assigned to a delivery partner soon.
                  </div>
                )}
                {currentOrder.status === 'out_for_delivery' && (
                  <div className="bg-blue-50 p-3 rounded text-sm text-blue-800 mt-3">
                    🚚 Your order is on the way! {currentOrder.deliveryAgent?.name} is heading to your location.
                    {currentOrder.deliveryAgent?.phone && (
                      <div className="mt-1 text-sm">📞 Contact: {currentOrder.deliveryAgent.phone}</div>
                    )}
                  </div>
                )}
                {currentOrder.status === 'delivered' && (
                  <div className="bg-green-50 p-3 rounded text-sm text-green-800 mt-3">
                    🎉 Your order has been delivered successfully! Thank you for choosing Shirpur Delivery.
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Enhanced Live Tracking Dashboard - Show when out for delivery */}
        {currentOrder && currentOrder.status === 'out_for_delivery' && (
          <div className="space-y-4">
            <Card className="bg-gradient-to-r from-green-50 to-blue-50">
              <CardHeader className="p-6">
                <CardTitle className="flex items-center text-lg">
                  <MapPin className="w-6 h-6 mr-2 text-green-600" />
                  Enhanced Live Tracking System
                  <Badge className="ml-2 bg-green-500 text-white animate-pulse px-3 py-1">
                    🔴 LIVE
                  </Badge>
                </CardTitle>
                <p className="text-sm text-gray-600 mt-2">
                  Real-time GPS tracking with AI-powered route optimization and traffic analysis
                </p>
              </CardHeader>
            </Card>
            
            <TrackingDashboard orderId={currentOrder.orderId} userType="customer" />
          </div>
        )}

        {false && currentOrder && currentOrder.status === 'out_for_delivery' && currentOrder.deliveryAgent?.location && customerAddress?.coordinates && (
          <Card>
            <CardHeader className="p-6">
              <CardTitle className="flex items-center text-lg">
                <MapPin className="w-5 h-5 mr-2" />
                Live Map View
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="mb-3 bg-green-50 p-3 rounded text-sm text-green-800">
                📍 Live tracking is active. You can see your delivery partner's real-time location.
              </div>
              
              <div className="h-96 rounded-lg overflow-hidden">
                <MapContainer
                  center={[
                    currentOrder.deliveryAgent.location.lat,
                    currentOrder.deliveryAgent.location.lng
                  ]}
                  zoom={14}
                  style={{ height: "100%", width: "100%", borderRadius: "0.5rem" }}
                >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />
                
                <Marker 
                  position={[
                    currentOrder.deliveryAgent.location.lat,
                    currentOrder.deliveryAgent.location.lng
                  ]} 
                  icon={deliveryIcon}
                >
                  <Popup>
                    <div className="p-2">
                      <p className="font-semibold">🚚 {currentOrder.deliveryAgent.name}</p>
                      <p className="text-sm">On the way to your location</p>
                      <p className="text-sm text-muted-foreground">
                        📞 {currentOrder.deliveryAgent.phone}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Last updated: {new Date(currentOrder.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </Popup>
                </Marker>

                <Marker 
                  position={[
                    customerAddress.coordinates.lat,
                    customerAddress.coordinates.lng
                  ]} 
                  icon={customerIcon}
                >
                  <Popup>
                    <div className="p-2">
                      <p className="font-semibold">📍 Your Location</p>
                      <p className="text-sm">{customerAddress.name}</p>
                      <p className="text-sm text-muted-foreground">{customerAddress.address}</p>
                    </div>
                  </Popup>
                </Marker>

                <RouteMap 
                  start={currentOrder.deliveryAgent.location}
                  end={customerAddress.coordinates}
                  isActive={true}
                />
              </MapContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {currentOrder && customerAddress && (
          <Card>
            <CardHeader className="p-6">
              <CardTitle className="text-lg">Delivery Information</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-3">
              <div>
                <h4 className="font-semibold mb-2 text-base">Delivery Address</h4>
                <div className="bg-muted p-3 rounded">
                  <p className="font-medium text-base">{customerAddress.name}</p>
                  <p className="text-sm text-muted-foreground">📞 {customerAddress.phone}</p>
                  <p className="text-sm leading-relaxed">{customerAddress.address}</p>
                  {customerAddress.landmark && (
                    <p className="text-sm text-muted-foreground">Near: {customerAddress.landmark}</p>
                  )}
                  <p className="text-sm">📮 {customerAddress.pincode}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-gray-50 p-2 rounded">
                  <p className="text-muted-foreground">Estimated Delivery</p>
                  <p className="font-semibold">15-30 minutes</p>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <p className="text-muted-foreground">Delivery Fee</p>
                  <p className="font-semibold">₹4.99</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {currentOrder && currentOrder.items && (
          <Card>
            <CardHeader className="p-6">
              <CardTitle className="text-lg">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="space-y-2">
                {currentOrder.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-base truncate">{item.product.name}</p>
                      <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-base ml-2">₹{(item.product.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-3 font-bold text-lg bg-gray-50 p-2 rounded">
                  <span>Total Amount:</span>
                  <span>₹{currentOrder.total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

// Live Tracking Component for Customer
const LiveTrackingComponent = ({ orderId }: { orderId: string }) => {
  const [agentLocation, setAgentLocation] = useState<{lat: number, lng: number} | null>(null);
  const [customerLocation, setCustomerLocation] = useState<{lat: number, lng: number} | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [distance, setDistance] = useState<number | null>(null);

  useEffect(() => {
    // Get customer location
    const customerAddr = JSON.parse(localStorage.getItem('customerAddress') || '{}');
    if (customerAddr.coordinates) {
      setCustomerLocation(customerAddr.coordinates);
    }

    // Listen for live location updates
    const handleLocationUpdate = (event: any) => {
      const { orderId: updateOrderId, location } = event.detail;
      if (updateOrderId === orderId) {
        console.log('📍 Customer received live location update:', location);
        setAgentLocation(location);
        setLastUpdate(new Date().toLocaleTimeString());
      }
    };

    // Load existing tracking data
    const loadTrackingData = () => {
      const trackingData = localStorage.getItem(`customerTracking_${orderId}`);
      if (trackingData) {
        const data = JSON.parse(trackingData);
        if (data.agentLocation) {
          setAgentLocation(data.agentLocation);
          setLastUpdate(new Date(data.lastUpdate).toLocaleTimeString());
        }
      }
    };

    loadTrackingData();
    window.addEventListener('liveLocationUpdate', handleLocationUpdate);

    // Poll for updates every 5 seconds
    const interval = setInterval(loadTrackingData, 5000);

    return () => {
      window.removeEventListener('liveLocationUpdate', handleLocationUpdate);
      clearInterval(interval);
    };
  }, [orderId]);

  // Calculate distance
  useEffect(() => {
    if (agentLocation && customerLocation) {
      const R = 6371;
      const dLat = (customerLocation.lat - agentLocation.lat) * Math.PI / 180;
      const dLng = (customerLocation.lng - agentLocation.lng) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) + 
                Math.cos(agentLocation.lat * Math.PI / 180) * Math.cos(customerLocation.lat * Math.PI / 180) * 
                Math.sin(dLng/2) * Math.sin(dLng/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const dist = R * c;
      setDistance(dist);
    }
  }, [agentLocation, customerLocation]);

  return (
    <div className="space-y-4">
      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-semibold text-green-800">🚚 Delivery Agent Location</h4>
          <Badge className="bg-green-500 text-white">
            {agentLocation ? 'LIVE' : 'Waiting...'}
          </Badge>
        </div>
        
        {agentLocation ? (
          <div className="space-y-2 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-green-700">Distance: <span className="font-bold">{distance ? `${distance.toFixed(2)} km` : 'Calculating...'}</span></p>
                <p className="text-green-700">ETA: <span className="font-bold">{distance ? `${Math.round(distance * 3)} min` : 'Calculating...'}</span></p>
              </div>
              <div>
                <p className="text-green-700">Last Update: <span className="font-bold">{lastUpdate}</span></p>
                <p className="text-green-700">Status: <span className="font-bold text-green-600">On the way</span></p>
              </div>
            </div>
            
            <div className="mt-3 p-2 bg-white rounded border">
              <p className="text-xs text-gray-600">GPS Coordinates:</p>
              <p className="text-xs font-mono">Agent: {agentLocation.lat.toFixed(6)}, {agentLocation.lng.toFixed(6)}</p>
              {customerLocation && (
                <p className="text-xs font-mono">You: {customerLocation.lat.toFixed(6)}, {customerLocation.lng.toFixed(6)}</p>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="loading-spinner mx-auto mb-2"></div>
            <p className="text-green-700 text-sm">Waiting for delivery agent to accept order...</p>
          </div>
        )}
      </div>
      
      {agentLocation && customerLocation && (
        <div className="h-64 rounded-lg overflow-hidden border">
          <MapContainer
            center={[agentLocation.lat, agentLocation.lng]}
            zoom={14}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap contributors'
            />
            
            <Marker position={[agentLocation.lat, agentLocation.lng]}>
              <Popup>
                <div className="text-center">
                  <strong>🚚 Delivery Agent</strong><br />
                  Live Location<br />
                  <small>Updated: {lastUpdate}</small>
                </div>
              </Popup>
            </Marker>
            
            <Marker position={[customerLocation.lat, customerLocation.lng]}>
              <Popup>
                <div className="text-center">
                  <strong>🏠 Your Location</strong><br />
                  Delivery Address
                </div>
              </Popup>
            </Marker>
          </MapContainer>
        </div>
      )}
    </div>
  );
};

export default CustomerOrderTracking;