import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { MapPin, Truck, Clock, CheckCircle, Package, Bell, RefreshCw } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import RouteMap from "@/components/RouteMap";
import { OrderService, Order } from "@/lib/orderService";
import { NotificationService } from "@/lib/notificationService";
import { useToast } from "@/hooks/use-toast";

const CustomerOrderTracking = () => {
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [customerAddress, setCustomerAddress] = useState<any>(null);
  const [lastStatus, setLastStatus] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

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
          const orderData = JSON.parse(storedOrder);
          const apiOrder = apiOrders.find(order => order.orderId === orderData.orderId);
          if (apiOrder) {
            setCurrentOrder(apiOrder);
            setLastStatus(apiOrder.status);
          } else {
            setCurrentOrder(orderData);
            setLastStatus(orderData.status);
          }
        }
        
        if (storedAddress) {
          setCustomerAddress(JSON.parse(storedAddress));
        }
      } catch (error) {
        console.error('Failed to load order data:', error);
        const storedOrder = localStorage.getItem('currentOrder');
        const storedAddress = localStorage.getItem('customerAddress');
        
        if (storedOrder) {
          const orderData = JSON.parse(storedOrder);
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
        <div className="text-center mb-6 md:mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-center gap-2 md:gap-4 mb-4">
            <h1 className="text-2xl md:text-3xl font-bold">Track Your Order</h1>
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

        {currentOrder && currentOrder.status === 'out_for_delivery' && currentOrder.deliveryAgent?.location && customerAddress?.coordinates && (
          <Card>
            <CardHeader className="p-6">
              <CardTitle className="flex items-center text-lg">
                <MapPin className="w-5 h-5 mr-2" />
                Live Tracking
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

export default CustomerOrderTracking;