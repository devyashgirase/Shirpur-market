import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { MapPin, Truck, Clock, CheckCircle, Package, Bell } from "lucide-react";
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
  const { toast } = useToast();

  // Fix Leaflet default marker icons
  useEffect(() => {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
  }, []);

  // Leaflet icons
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
    // Load initial data
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

    // Subscribe to real-time order updates
    const unsubscribe = OrderService.subscribe((orders) => {
      const storedOrderId = JSON.parse(localStorage.getItem('currentOrder') || '{}').orderId;
      if (storedOrderId) {
        const updatedOrder = orders.find(order => order.orderId === storedOrderId);
        if (updatedOrder) {
          setCurrentOrder(updatedOrder);
          
          // Show toast notification for status changes
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

    // Request notification permission
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
    <div className="container mx-auto px-4 py-4 md:py-8">
      <div className="max-w-4xl mx-auto space-y-4 md:space-y-6">
        <div className="text-center mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2 md:mb-4">Track Your Order</h1>
          <p className="text-sm md:text-base text-muted-foreground">Real-time delivery tracking</p>
        </div>

        {/* Order Status */}
        <Card>
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="flex items-center text-base md:text-lg">
              <StatusIcon className={`w-5 h-5 md:w-6 md:h-6 mr-2 ${statusInfo.color}`} />
              Order #{currentOrder?.orderId || 'No active order'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-3 md:mb-4 gap-2">
              <Badge className={`${statusInfo.bg} ${statusInfo.color} border-0 text-xs md:text-sm w-fit`}>
                {statusInfo.text}
              </Badge>
              {currentOrder?.timestamp && (
                <span className="text-xs md:text-sm text-muted-foreground">
                  Last updated: {new Date(currentOrder.timestamp).toLocaleTimeString()}
                </span>
              )}
            </div>
            
            {currentOrder?.status === 'confirmed' && (
              <div className="bg-blue-50 p-3 rounded text-xs md:text-sm text-blue-800">
                ✅ Your order has been confirmed and is being prepared by our team.
              </div>
            )}
            {currentOrder?.status === 'packing' && (
              <div className="bg-orange-50 p-3 rounded text-xs md:text-sm text-orange-800">
                📦 Your order is being packed and will be assigned to a delivery partner soon.
              </div>
            )}
            {currentOrder?.status === 'out_for_delivery' && (
              <div className="bg-blue-50 p-3 rounded text-xs md:text-sm text-blue-800">
                🚚 Your order is on the way! {currentOrder.deliveryAgent?.name} is heading to your location.
                {currentOrder.deliveryAgent?.phone && (
                  <div className="mt-1">📞 Contact: {currentOrder.deliveryAgent.phone}</div>
                )}
              </div>
            )}
            {currentOrder?.status === 'delivered' && (
              <div className="bg-green-50 p-3 rounded text-xs md:text-sm text-green-800">
                🎉 Your order has been delivered successfully! Thank you for choosing Shirpur Delivery.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Live Map Tracking */}
        {currentOrder?.status === 'out_for_delivery' && currentOrder?.deliveryAgent?.location && customerAddress?.coordinates && (
          <Card>
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="flex items-center text-base md:text-lg">
                <MapPin className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                Live Tracking
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              <div className="mb-3 md:mb-4 bg-green-50 p-3 rounded text-xs md:text-sm text-green-800">
                📍 Live tracking is active. You can see your delivery partner's real-time location.
              </div>
              
              <MapContainer
                center={[
                  currentOrder.deliveryAgent.location.lat,
                  currentOrder.deliveryAgent.location.lng
                ]}
                zoom={14}
                style={{ height: "300px", width: "100%", borderRadius: "0.5rem" }}
                className="md:h-[400px]"
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />
                
                {/* Delivery Agent Location */}
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
                      <p className="text-xs text-muted-foreground">
                        📞 {currentOrder.deliveryAgent.phone}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Last updated: {new Date(currentOrder.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </Popup>
                </Marker>

                {/* Customer Location */}
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
                      <p className="text-xs text-muted-foreground">{customerAddress.address}</p>
                    </div>
                  </Popup>
                </Marker>

                {/* Route between delivery agent and customer */}
                <RouteMap 
                  start={currentOrder.deliveryAgent.location}
                  end={customerAddress.coordinates}
                  isActive={true}
                />
              </MapContainer>
            </CardContent>
          </Card>
        )}

        {/* Delivery Information */}
        {customerAddress && (
          <Card>
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="text-base md:text-lg">Delivery Information</CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0 space-y-3 md:space-y-4">
              <div>
                <h4 className="font-semibold mb-2 text-sm md:text-base">Delivery Address</h4>
                <div className="bg-muted p-3 rounded">
                  <p className="font-medium text-sm md:text-base">{customerAddress.name}</p>
                  <p className="text-xs md:text-sm text-muted-foreground">📞 {customerAddress.phone}</p>
                  <p className="text-xs md:text-sm leading-relaxed">{customerAddress.address}</p>
                  {customerAddress.landmark && (
                    <p className="text-xs md:text-sm text-muted-foreground">Near: {customerAddress.landmark}</p>
                  )}
                  <p className="text-xs md:text-sm">📮 {customerAddress.pincode}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 md:gap-4 text-xs md:text-sm">
                <div>
                  <p className="text-muted-foreground">Estimated Delivery</p>
                  <p className="font-semibold">15-30 minutes</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Delivery Fee</p>
                  <p className="font-semibold">₹4.99</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Order Status Messages */}
        {currentOrder?.status === 'confirmed' && (
          <Card>
            <CardContent className="text-center py-6 md:py-8">
              <CheckCircle className="w-12 h-12 md:w-16 md:h-16 text-blue-500 mx-auto mb-3 md:mb-4" />
              <h3 className="text-base md:text-lg font-semibold mb-2">Order Confirmed</h3>
              <p className="text-sm md:text-base text-muted-foreground">
                Your order has been confirmed and our team is preparing it for delivery.
              </p>
            </CardContent>
          </Card>
        )}
        
        {currentOrder?.status === 'packing' && (
          <Card>
            <CardContent className="text-center py-6 md:py-8">
              <Package className="w-12 h-12 md:w-16 md:h-16 text-orange-500 mx-auto mb-3 md:mb-4" />
              <h3 className="text-base md:text-lg font-semibold mb-2">Order Being Packed</h3>
              <p className="text-sm md:text-base text-muted-foreground">
                Your order is being packed and will be assigned to a delivery partner soon.
              </p>
            </CardContent>
          </Card>
        )}
        
        {currentOrder?.status === 'delivered' && (
          <Card>
            <CardContent className="text-center py-6 md:py-8">
              <CheckCircle className="w-12 h-12 md:w-16 md:h-16 text-green-500 mx-auto mb-3 md:mb-4" />
              <h3 className="text-base md:text-lg font-semibold mb-2">Order Delivered</h3>
              <p className="text-sm md:text-base text-muted-foreground">
                Your order has been delivered successfully! Thank you for choosing Shirpur Delivery.
              </p>
            </CardContent>
          </Card>
        )}
        
        {/* No tracking data message */}
        {!currentOrder && (
          <Card>
            <CardContent className="text-center py-6 md:py-8">
              <Package className="w-12 h-12 md:w-16 md:h-16 text-muted-foreground mx-auto mb-3 md:mb-4" />
              <h3 className="text-base md:text-lg font-semibold mb-2">No Active Order</h3>
              <p className="text-sm md:text-base text-muted-foreground">
                Place an order to see real-time tracking information here.
              </p>
            </CardContent>
          </Card>
        )}
        
        {/* Order Items Summary */}
        {currentOrder && (
          <Card>
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="text-base md:text-lg">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              <div className="space-y-2">
                {currentOrder.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
                    <div>
                      <p className="font-medium text-sm md:text-base">{item.product.name}</p>
                      <p className="text-xs md:text-sm text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-sm md:text-base">₹{(item.product.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-3 font-bold text-base md:text-lg">
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