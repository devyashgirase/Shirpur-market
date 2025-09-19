import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Phone, CheckCircle, Navigation, Play, Square } from "lucide-react";
import { mockDeliveryTasks } from "@/lib/mockData";
import { useToast } from "@/hooks/use-toast";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import RouteMap from "@/components/RouteMap";
import { WhatsAppService } from "@/lib/whatsappService";

const DeliveryTaskDetail = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [loadingMap, setLoadingMap] = useState(false);
  const [isDeliveryStarted, setIsDeliveryStarted] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);


  // Fix Leaflet default marker icons
  useEffect(() => {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
  }, []);

  // Leaflet marker icons
  const defaultIcon = L.divIcon({
    html: `<div style="background-color: #dc2626; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.4);"><span style="color: white; font-size: 16px;">📍</span></div>`,
    className: 'custom-div-icon',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
  
  const currentLocationIcon = L.divIcon({
    html: `<div style="background-color: #2563eb; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.4); animation: pulse 2s infinite;"><span style="color: white; font-size: 14px;">🚚</span></div>`,
    className: 'custom-div-icon',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });

  const task = mockDeliveryTasks.find((t) => t.id === taskId);

  useEffect(() => {
    if (!task) return;
    async function fetchCoords() {
      setLoadingMap(true);
      setMapError(null);
      
      // Check for stored customer address with coordinates
      const storedAddress = localStorage.getItem('customerAddress');
      if (storedAddress) {
        const addressData = JSON.parse(storedAddress);
        if (addressData.coordinates) {
          setCoords(addressData.coordinates);
          setLoadingMap(false);
          return;
        }
      }
      
      // Fallback to geocoding
      const result = await geocodeAddress(task.customer_address || "");
      if (result) {
        setCoords(result);
      } else {
        setMapError("Using default Shirpur location");
        setCoords({ lat: 21.3486, lng: 74.8811 });
      }
      setLoadingMap(false);
    }
    fetchCoords();
  }, [task?.customer_address]);

  useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  // Add CSS for pulsing animation
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.1); opacity: 0.7; }
        100% { transform: scale(1); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  if (!task) {
    return <div className="container mx-auto px-4 py-8">Task not found</div>;
  }

  const handleStartDelivery = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Location not supported",
        description: "Your device doesn't support location tracking.",
        variant: "destructive",
      });
      return;
    }

    setIsDeliveryStarted(true);
    const id = navigator.geolocation.watchPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setCurrentLocation(newLocation);
        
        // Store delivery agent location for admin/customer tracking
        const deliveryData = {
          orderId: task.order_id,
          deliveryAgentLocation: newLocation,
          timestamp: new Date().toISOString(),
          status: 'out_for_delivery'
        };
        localStorage.setItem('liveDelivery', JSON.stringify(deliveryData));
        
        // Store agent location with details for admin tracking
        const agentData = {
          lat: newLocation.lat,
          lng: newLocation.lng,
          name: 'Delivery Agent',
          phone: '+91 98765 43210',
          orderId: task.order_id,
          timestamp: new Date().toISOString()
        };
        localStorage.setItem('deliveryAgentLocation', JSON.stringify(agentData));
        
        // Simple distance calculation for demo
        if (coords) {
          const distance = calculateDistance(newLocation, coords);
          console.log(`Distance to destination: ${distance.toFixed(2)} km`);
        }
      },
      (error) => {
        toast({
          title: "Location error",
          description: "Unable to get your current location.",
          variant: "destructive",
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
    setWatchId(id);
    
    toast({
      title: "Delivery started!",
      description: "Real-time tracking is now active.",
    });
  };

  const handleStopDelivery = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    setIsDeliveryStarted(false);
    setCurrentLocation(null);

    
    toast({
      title: "Delivery stopped",
      description: "Location tracking has been disabled.",
    });
  };

  const handleOpenMaps = () => {
    if (!coords) return;
    
    const destination = `${coords.lat},${coords.lng}`;
    const address = encodeURIComponent(task?.customer_address || '');
    
    // Try Google Maps first, fallback to Apple Maps on iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    
    if (isIOS) {
      window.open(`maps://maps.google.com/maps?daddr=${destination}&dirflg=d`, '_blank');
    } else {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving`, '_blank');
    }
  };

  const handleVerifyOTP = async () => {
    setIsVerifying(true);
    setTimeout(() => {
      const isValidOTP = WhatsAppService.verifyOTP(task.order_id, otp);
      
      if (isValidOTP) {
        handleStopDelivery();
        
        // Update order status to delivered
        const allOrders = JSON.parse(localStorage.getItem('allOrders') || '[]');
        const updatedOrders = allOrders.map((order: any) => 
          order.orderId === task.order_id ? { ...order, status: 'delivered' } : order
        );
        localStorage.setItem('allOrders', JSON.stringify(updatedOrders));
        
        const currentOrder = JSON.parse(localStorage.getItem('currentOrder') || '{}');
        if (currentOrder.orderId === task.order_id) {
          currentOrder.status = 'delivered';
          localStorage.setItem('currentOrder', JSON.stringify(currentOrder));
          
          // Send delivery confirmation WhatsApp
          WhatsAppService.sendStatusUpdate(
            currentOrder.customerAddress,
            currentOrder,
            'delivered'
          );
        }
        
        toast({
          title: "Delivery confirmed!",
          description: "Order has been successfully delivered. Customer notified via WhatsApp.",
        });
        navigate("/delivery");
      } else {
        toast({
          title: "Invalid OTP",
          description: "Please check the OTP provided by customer and try again.",
          variant: "destructive",
        });
      }
      setIsVerifying(false);
    }, 1000);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Delivery Details - Order #{task.order_id}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Customer Information */}
            {(() => {
              const storedAddress = localStorage.getItem('customerAddress');
              const storedOrder = localStorage.getItem('currentOrder');
              const allOrders = JSON.parse(localStorage.getItem('allOrders') || '[]');
              
              let customerData = null;
              let orderData = null;
              
              if (storedAddress) {
                customerData = JSON.parse(storedAddress);
              }
              
              if (storedOrder) {
                orderData = JSON.parse(storedOrder);
              } else {
                orderData = allOrders.find((order: any) => order.orderId === task.order_id);
              }
              
              return (
                <div className="space-y-4">
                  {/* Customer Details Card */}
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
                      <Phone className="w-4 h-4 mr-2" />
                      Customer Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs text-blue-700">Name</Label>
                        <p className="font-medium">{customerData?.name || orderData?.customerAddress?.name || task.customer_name}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-blue-700">Phone</Label>
                        <p className="font-medium">{customerData?.phone || orderData?.customerAddress?.phone || 'Not available'}</p>
                      </div>
                      <div className="md:col-span-2">
                        <Label className="text-xs text-blue-700">Full Address</Label>
                        <p className="text-sm bg-white p-2 rounded border">
                          {customerData?.address || orderData?.customerAddress?.address || task.customer_address}
                        </p>
                        {customerData?.coordinates && (
                          <p className="text-xs text-green-600 mt-1">📍 GPS coordinates available</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Order Details Card */}
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h4 className="font-semibold text-green-900 mb-3">Order Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs text-green-700">Order Value</Label>
                        <p className="text-xl font-bold text-primary">
                          ₹{orderData?.total?.toFixed(2) || task.total_amount?.toFixed(2) || '0.00'}
                        </p>
                      </div>
                      <div>
                        <Label className="text-xs text-green-700">Payment Status</Label>
                        <p className="font-medium text-green-600">
                          {orderData?.paymentStatus?.toUpperCase() || 'PAID'}
                        </p>
                      </div>
                      {orderData?.items && (
                        <div className="md:col-span-2">
                          <Label className="text-xs text-green-700">Items ({orderData.items.length})</Label>
                          <div className="space-y-1 mt-1">
                            {orderData.items.map((item: any, index: number) => (
                              <div key={index} className="flex justify-between items-center bg-white p-2 rounded text-sm">
                                <span>{item.product.name} x{item.quantity}</span>
                                <span className="font-medium">₹{(item.product.price * item.quantity).toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Map */}
            {loadingMap && <div>Loading map...</div>}
            {mapError && <div className="text-orange-600">{mapError}</div>}
            {coords && !loadingMap && (
              <div className="space-y-2">
                {isDeliveryStarted && (
                  <div className="bg-green-100 text-green-800 p-2 rounded text-sm flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                    Live tracking active
                  </div>
                )}
                <MapContainer
                  center={[currentLocation?.lat || coords.lat, currentLocation?.lng || coords.lng]}
                  zoom={15}
                  style={{ height: "300px", width: "100%", borderRadius: "0.5rem" }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  />
                  <Marker position={[coords.lat, coords.lng]} icon={defaultIcon}>
                    <Popup>Delivery Address</Popup>
                  </Marker>
                  {currentLocation && (
                    <Marker position={[currentLocation.lat, currentLocation.lng]} icon={currentLocationIcon}>
                      <Popup>Your Current Location</Popup>
                    </Marker>
                  )}
                  <RouteMap 
                    start={currentLocation} 
                    end={coords} 
                    isActive={isDeliveryStarted} 
                  />
                </MapContainer>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex space-x-2">
                {!isDeliveryStarted ? (
                  <Button onClick={handleStartDelivery} className="flex-1 bg-gradient-primary">
                    <Play className="w-4 h-4 mr-2" />
                    Start Delivery
                  </Button>
                ) : (
                  <Button onClick={handleStopDelivery} variant="destructive" className="flex-1">
                    <Square className="w-4 h-4 mr-2" />
                    Stop Tracking
                  </Button>
                )}
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" className="flex-1">
                  <Phone className="w-4 h-4 mr-2" />
                  Call Customer
                </Button>
                <Button onClick={handleOpenMaps} variant="outline" className="flex-1">
                  <Navigation className="w-4 h-4 mr-2" />
                  Open Maps
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* OTP Verification */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              Confirm Delivery
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Enter the OTP provided by the customer to confirm delivery
            </p>

            <div className="space-y-2">
              <Label htmlFor="otp">6-Digit OTP</Label>
              <Input
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter 6-digit OTP from customer"
                maxLength={6}
                className="text-center text-lg tracking-wider"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Customer received OTP via WhatsApp. Ask them to share the 6-digit code.
              </p>
            </div>

            <Button
              onClick={handleVerifyOTP}
              disabled={otp.length !== 6 || isVerifying}
              className="w-full bg-gradient-success"
            >
              {isVerifying ? "Verifying..." : "Confirm Delivery"}
            </Button>

            <div className="text-center pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Your delivery fee:{" "}
                <span className="font-semibold text-success">
                  ${((task.total_amount || 0) * 0.15).toFixed(2)}
                </span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

async function geocodeAddress(address: string) {
  // Use OpenStreetMap Nominatim for free geocoding
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
    );
    const data = await response.json();
    
    if (data.length > 0) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    }
  } catch (error) {
    console.error('Geocoding error:', error);
  }
  
  // Fallback to Shirpur coordinates
  return { lat: 21.3486, lng: 74.8811 };
}

function calculateDistance(pos1: {lat: number, lng: number}, pos2: {lat: number, lng: number}) {
  const R = 6371; // Earth's radius in km
  const dLat = (pos2.lat - pos1.lat) * Math.PI / 180;
  const dLng = (pos2.lng - pos1.lng) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(pos1.lat * Math.PI / 180) * Math.cos(pos2.lat * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}
export default DeliveryTaskDetail;