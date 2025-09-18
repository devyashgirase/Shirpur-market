import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { MapPin, Truck, Clock, CheckCircle, Package } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import RouteMap from "@/components/RouteMap";

const CustomerOrderTracking = () => {
  const [deliveryData, setDeliveryData] = useState<any>(null);
  const [customerAddress, setCustomerAddress] = useState<any>(null);

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
    // Load delivery and customer data
    const loadTrackingData = () => {
      const liveDelivery = localStorage.getItem('liveDelivery');
      const storedAddress = localStorage.getItem('customerAddress');
      
      if (liveDelivery) {
        setDeliveryData(JSON.parse(liveDelivery));
      }
      
      if (storedAddress) {
        setCustomerAddress(JSON.parse(storedAddress));
      }
    };

    loadTrackingData();
    
    // Refresh every 5 seconds for live updates
    const interval = setInterval(loadTrackingData, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100', text: 'Order Placed' };
      case 'confirmed':
        return { icon: Package, color: 'text-blue-600', bg: 'bg-blue-100', text: 'Order Confirmed' };
      case 'preparing':
        return { icon: Package, color: 'text-orange-600', bg: 'bg-orange-100', text: 'Preparing Order' };
      case 'out_for_delivery':
        return { icon: Truck, color: 'text-primary', bg: 'bg-blue-100', text: 'Out for Delivery' };
      case 'delivered':
        return { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100', text: 'Delivered' };
      default:
        return { icon: Clock, color: 'text-gray-600', bg: 'bg-gray-100', text: 'Processing' };
    }
  };

  const statusInfo = getStatusInfo(deliveryData?.status || 'pending');
  const StatusIcon = statusInfo.icon;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Track Your Order</h1>
          <p className="text-muted-foreground">Real-time delivery tracking</p>
        </div>

        {/* Order Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <StatusIcon className={`w-6 h-6 mr-2 ${statusInfo.color}`} />
              Order #{deliveryData?.orderId || '1001'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <Badge className={`${statusInfo.bg} ${statusInfo.color} border-0`}>
                {statusInfo.text}
              </Badge>
              {deliveryData?.timestamp && (
                <span className="text-sm text-muted-foreground">
                  Last updated: {new Date(deliveryData.timestamp).toLocaleTimeString()}
                </span>
              )}
            </div>
            
            {deliveryData?.status === 'out_for_delivery' && (
              <div className="bg-blue-50 p-3 rounded text-sm text-blue-800">
                🚚 Your order is on the way! The delivery partner is heading to your location.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Live Map Tracking */}
        {deliveryData?.deliveryAgentLocation && customerAddress?.coordinates && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Live Tracking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 bg-green-50 p-3 rounded text-sm text-green-800">
                📍 Live tracking is active. You can see your delivery partner's real-time location.
              </div>
              
              <MapContainer
                center={[
                  deliveryData.deliveryAgentLocation.lat,
                  deliveryData.deliveryAgentLocation.lng
                ]}
                zoom={14}
                style={{ height: "400px", width: "100%", borderRadius: "0.5rem" }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />
                
                {/* Delivery Agent Location */}
                <Marker 
                  position={[
                    deliveryData.deliveryAgentLocation.lat,
                    deliveryData.deliveryAgentLocation.lng
                  ]} 
                  icon={deliveryIcon}
                >
                  <Popup>
                    <div className="p-2">
                      <p className="font-semibold">🚚 Delivery Partner</p>
                      <p className="text-sm">On the way to your location</p>
                      <p className="text-xs text-muted-foreground">
                        Last updated: {new Date(deliveryData.timestamp).toLocaleTimeString()}
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
                  start={deliveryData.deliveryAgentLocation}
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
            <CardHeader>
              <CardTitle>Delivery Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Delivery Address</h4>
                <div className="bg-muted p-3 rounded">
                  <p className="font-medium">{customerAddress.name}</p>
                  <p className="text-sm text-muted-foreground">📞 {customerAddress.phone}</p>
                  <p className="text-sm">{customerAddress.address}</p>
                  {customerAddress.landmark && (
                    <p className="text-sm text-muted-foreground">Near: {customerAddress.landmark}</p>
                  )}
                  <p className="text-sm">📮 {customerAddress.pincode}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
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

        {/* No tracking data message */}
        {!deliveryData && (
          <Card>
            <CardContent className="text-center py-8">
              <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Active Delivery</h3>
              <p className="text-muted-foreground">
                Place an order to see live tracking information here.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CustomerOrderTracking;