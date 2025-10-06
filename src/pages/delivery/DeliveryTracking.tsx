import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Navigation, MapPin, Phone, Package, CheckCircle, Map, Truck } from 'lucide-react';
import { TrackingDashboard } from '@/components/TrackingDashboard';
import { deliveryCoordinationService } from '@/lib/deliveryCoordinationService';
import { EnhancedTrackingService } from '@/lib/enhancedTrackingService';
import DeliveryOTPVerification from '@/components/DeliveryOTPVerification';

const DeliveryTracking = () => {
  const [currentOrder, setCurrentOrder] = useState<any>(null);
  const [agentLocation, setAgentLocation] = useState({ lat: 21.3486, lng: 74.8811 });
  const [customerLocation, setCustomerLocation] = useState({ lat: 21.3099, lng: 75.1178 });
  const [agentLocationName, setAgentLocationName] = useState('Getting location...');
  const [route, setRoute] = useState<[number, number][]>([]);
  const [isDelivered, setIsDelivered] = useState(false);
  const [showOTPVerification, setShowOTPVerification] = useState(false);
  
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };
  
  // Reverse geocoding to get location name
  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=YOUR_API_KEY&language=en&pretty=1`
      );
      
      if (!response.ok) {
        // Fallback to Nominatim (free service)
        const nominatimResponse = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
        );
        
        if (nominatimResponse.ok) {
          const data = await nominatimResponse.json();
          const locationName = data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
          setAgentLocationName(`📍 ${locationName.split(',').slice(0, 3).join(', ')}`);
        } else {
          setAgentLocationName(`📍 ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
        }
      }
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
      setAgentLocationName(`📍 ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    }
  };

  useEffect(() => {
    // Load current order from localStorage
    const order = JSON.parse(localStorage.getItem('currentOrder') || '{}');
    if (order.orderId) {
      setCurrentOrder(order);
      if (order.customerAddress?.coordinates) {
        setCustomerLocation({
          lat: order.customerAddress.coordinates.lat,
          lng: order.customerAddress.coordinates.lng
        });
      }
      if (order.deliveryAgent?.location) {
        setAgentLocation({
          lat: order.deliveryAgent.location.lat,
          lng: order.deliveryAgent.location.lng
        });
      }
    }

    // Initialize enhanced tracking
    EnhancedTrackingService.initializeTracking();
    
    // Start enhanced tracking for this order
    if (order.orderId) {
      const customerLocation = {
        lat: order.customerAddress?.coordinates?.lat || 21.3150,
        lng: order.customerAddress?.coordinates?.lng || 75.1200,
        accuracy: 5,
        timestamp: Date.now()
      };
      EnhancedTrackingService.startOrderTracking(order.orderId, 'agent_001', customerLocation);
    }
    
    // Listen for location updates
    const handleLocationUpdate = (data: any) => {
      setAgentLocation({ lat: data.lat, lng: data.lng });
      setRoute(prev => [...prev, [data.lat, data.lng]]);
    };

    deliveryCoordinationService.subscribe('liveLocationUpdate', handleLocationUpdate);

    // Get real GPS location and update continuously
    const startRealGPSTracking = () => {
      if (navigator.geolocation) {
        // Get initial location
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const newLocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            setAgentLocation(newLocation);
            setRoute(prev => [...prev, [newLocation.lat, newLocation.lng]]);
            reverseGeocode(newLocation.lat, newLocation.lng);
          },
          (error) => {
            console.error('GPS Error:', error);
            setAgentLocationName('GPS not available');
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
        );
        
        // Watch position changes
        const watchId = navigator.geolocation.watchPosition(
          (position) => {
            const newLocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            setAgentLocation(newLocation);
            setRoute(prev => [...prev, [newLocation.lat, newLocation.lng]]);
            reverseGeocode(newLocation.lat, newLocation.lng);
          },
          (error) => {
            console.error('GPS Watch Error:', error);
          },
          { enableHighAccuracy: true, timeout: 5000, maximumAge: 30000 }
        );
        
        return () => navigator.geolocation.clearWatch(watchId);
      } else {
        setAgentLocationName('GPS not supported');
      }
    };
    
    const cleanup = startRealGPSTracking();

    return () => {
      deliveryCoordinationService.unsubscribe('liveLocationUpdate', handleLocationUpdate);
      EnhancedTrackingService.stopOrderTracking(order.orderId || '');
      if (cleanup) cleanup();
    };
  }, [isDelivered]);

  const handleMarkDelivered = () => {
    // Show OTP verification instead of directly marking as delivered
    setShowOTPVerification(true);
  };

  const handleOTPVerificationSuccess = () => {
    if (currentOrder?.orderId) {
      deliveryCoordinationService.markAsDelivered(currentOrder.orderId);
      setIsDelivered(true);
      setShowOTPVerification(false);
      alert('✅ Order delivered successfully with OTP verification!');
    }
  };

  const handleOTPVerificationCancel = () => {
    setShowOTPVerification(false);
  };

  if (!currentOrder?.orderId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-8 text-center">
            <Package className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No Active Delivery</h3>
            <p className="text-gray-500">Accept an order to start GPS tracking</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Navigation className="h-8 w-8" />
            <div>
              <h1 className="text-2xl font-bold">GPS Tracking</h1>
              <p className="text-blue-100">Order #{currentOrder.orderId}</p>
            </div>
          </div>
          <Badge className={`${isDelivered ? 'bg-green-500' : 'bg-orange-500'} text-white`}>
            {isDelivered ? 'Delivered' : 'In Transit'}
          </Badge>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Customer Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-red-500" />
              Customer Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="font-semibold">{currentOrder.customerAddress?.name}</p>
              <p className="text-gray-600">{currentOrder.customerAddress?.address}</p>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-blue-500" />
                <span className="text-blue-600">{currentOrder.customerAddress?.phone}</span>
              </div>
              <p className="text-lg font-bold text-green-600">₹{currentOrder.total}</p>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Tracking Dashboard */}
        <Card className="bg-gradient-to-r from-blue-50 to-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-6 w-6 text-blue-600" />
              Enhanced Delivery Tracking
              <Badge className="bg-green-500 text-white animate-pulse">
                🔴 LIVE
              </Badge>
            </CardTitle>
            <p className="text-sm text-gray-600 mt-2">
              AI-powered route optimization with real-time traffic analysis
            </p>
          </CardHeader>
        </Card>
        
        <TrackingDashboard orderId={currentOrder.orderId} userType="delivery" />
        
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant="outline"
                onClick={() => window.open(`https://www.google.com/maps/dir/${agentLocation.lat},${agentLocation.lng}/${customerLocation.lat},${customerLocation.lng}`, '_blank')}
              >
                <Navigation className="w-4 h-4 mr-2" />
                Google Maps
              </Button>
              <Button 
                variant="outline"
                onClick={() => window.open(`tel:${currentOrder.customerAddress?.phone}`, '_self')}
              >
                <Phone className="w-4 h-4 mr-2" />
                Call Customer
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* OTP Verification Modal */}
        {showOTPVerification && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <DeliveryOTPVerification
              orderId={currentOrder.orderId}
              customerPhone={currentOrder.customerAddress?.phone || ''}
              customerName={currentOrder.customerAddress?.name || ''}
              onVerificationSuccess={handleOTPVerificationSuccess}
              onCancel={handleOTPVerificationCancel}
            />
          </div>
        )}

        {/* Action Button */}
        {!isDelivered && !showOTPVerification && (
          <Button
            onClick={handleMarkDelivered}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3"
            size="lg"
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            Complete Delivery (OTP Required)
          </Button>
        )}

        {isDelivered && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-6 text-center">
              <CheckCircle className="h-16 w-16 mx-auto text-green-500 mb-4" />
              <h3 className="text-lg font-semibold text-green-800 mb-2">Order Delivered!</h3>
              <p className="text-green-600">Thank you for completing this delivery</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DeliveryTracking;