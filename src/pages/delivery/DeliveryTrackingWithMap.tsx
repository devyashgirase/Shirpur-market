import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Navigation, MapPin, Phone, Package, CheckCircle } from 'lucide-react';
import { LocationService } from '@/lib/locationService';
import { supabaseApi } from '@/lib/supabase';
import LeafletMap from '@/components/LeafletMap';
import DeliveryOTPVerification from '@/components/DeliveryOTPVerification';

const DeliveryTrackingWithMap = () => {
  const [currentOrder, setCurrentOrder] = useState<any>(null);
  const [agentLocation, setAgentLocation] = useState<[number, number] | null>(null);
  const [customerLocation, setCustomerLocation] = useState<[number, number] | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [isDelivered, setIsDelivered] = useState(false);
  const [showOTPVerification, setShowOTPVerification] = useState(false);

  useEffect(() => {
    loadCurrentOrder();
    initializeTracking();
  }, []);

  const loadCurrentOrder = async () => {
    const order = JSON.parse(localStorage.getItem('currentOrder') || '{}');
    
    if (order.orderId) {
      setCurrentOrder(order);
      
      // Geocode customer address
      if (order.customer_address || order.customerAddress?.address) {
        const address = order.customer_address || order.customerAddress?.address;
        const coords = await geocodeAddress(address);
        setCustomerLocation(coords);
      }
      
      // Get agent's current location
      const currentLocation = await LocationService.getCurrentLocation();
      if (currentLocation) {
        setAgentLocation([currentLocation.lat, currentLocation.lng]);
      }
    }
  };

  const geocodeAddress = async (address: string): Promise<[number, number]> => {
    try {
      const encodedAddress = encodeURIComponent(`${address}, Shirpur, Maharashtra, India`);
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1`);
      
      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
        }
      }
    } catch (error) {
      console.error('Geocoding failed:', error);
    }
    
    // Fallback to Shirpur coordinates
    return [21.3487, 74.8831];
  };

  const initializeTracking = async () => {
    // Request location permission
    const hasPermission = await LocationService.requestLocationPermission();
    if (hasPermission) {
      const location = await LocationService.getCurrentLocation();
      if (location) {
        setAgentLocation([location.lat, location.lng]);
      }
    }
  };

  const startDelivery = async () => {
    if (!currentOrder) return;

    try {
      const agentId = localStorage.getItem('deliveryAgentId') || localStorage.getItem('agentPhone') || 'current_agent';
      
      // Get current GPS location
      const location = await LocationService.getCurrentLocation();
      if (!location) {
        alert('GPS permission required for delivery tracking!');
        return;
      }

      // Start GPS tracking
      const trackingStarted = await LocationService.startTracking(agentId, currentOrder.orderId);
      if (trackingStarted) {
        setIsTracking(true);
        setAgentLocation([location.lat, location.lng]);

        // Update database with real location
        await supabaseApi.updateAgentLocation(agentId, location.lat, location.lng, currentOrder.orderId);

        // Broadcast to customers
        window.dispatchEvent(new CustomEvent('trackingStarted', {
          detail: {
            orderId: currentOrder.orderId,
            location: location,
            agentId: agentId,
            agentName: 'Delivery Agent',
            status: 'out_for_delivery',
            accuracy: location.accuracy,
            timestamp: new Date().toISOString(),
            isRealGPS: true
          }
        }));

        // Open Google Maps for navigation
        const customerAddress = currentOrder?.customerAddress?.address || currentOrder?.customer_address;
        if (customerAddress) {
          const encodedAddress = encodeURIComponent(customerAddress);
          const mapsUrl = `https://www.google.com/maps/dir/Current+Location/${encodedAddress}`;
          window.open(mapsUrl, '_blank');
        }

        alert('🚀 Live delivery tracking started!');
      }
    } catch (error) {
      console.error('Failed to start delivery:', error);
      alert('Failed to start delivery tracking');
    }
  };

  const stopDelivery = () => {
    LocationService.stopTracking();
    setIsTracking(false);
    
    const trackingInterval = localStorage.getItem('trackingInterval');
    if (trackingInterval) {
      clearInterval(parseInt(trackingInterval));
      localStorage.removeItem('trackingInterval');
    }
  };

  const handleCompleteDelivery = () => {
    setShowOTPVerification(true);
  };

  const handleOTPSuccess = () => {
    setIsDelivered(true);
    setShowOTPVerification(false);
    stopDelivery();
    
    // Clear order data
    localStorage.removeItem('currentOrder');
    
    alert('✅ Order delivered successfully!');
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
              <h1 className="text-2xl font-bold">Live GPS Tracking</h1>
              <p className="text-blue-100">Order #{currentOrder?.orderId}</p>
            </div>
          </div>
          <Badge className={`${isDelivered ? 'bg-green-500' : isTracking ? 'bg-orange-500' : 'bg-gray-500'} text-white`}>
            {isDelivered ? 'Delivered' : isTracking ? 'In Transit' : 'Ready'}
          </Badge>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Live Map */}
        {customerLocation && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-500" />
                Live Delivery Map
              </CardTitle>
            </CardHeader>
            <CardContent>
              <LeafletMap
                customerLocation={customerLocation}
                customerAddress={currentOrder?.customer_address || currentOrder?.customerAddress?.address || 'Delivery Address'}
                agentLocation={agentLocation}
                deliveryAgent={{
                  id: isTracking ? 'real_gps' : 999,
                  name: 'Delivery Agent',
                  phone: '+91 98765 43210',
                  current_lat: agentLocation?.[0],
                  current_lng: agentLocation?.[1],
                  last_updated: new Date().toISOString()
                }}
                userType="admin"
                orderId={currentOrder.orderId}
              />
            </CardContent>
          </Card>
        )}

        {/* Customer Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-red-500" />
              Customer Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-gray-600">Customer Name</p>
                    <p className="font-semibold text-lg">{currentOrder?.customerAddress?.name || currentOrder?.customer_name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Delivery Address</p>
                    <p className="text-gray-700">{currentOrder?.customerAddress?.address || currentOrder?.customer_address || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone Number</p>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-blue-500" />
                      <span className="text-blue-600 font-medium">{currentOrder?.customerAddress?.phone || currentOrder?.customer_phone || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">Order Value</p>
                <p className="text-2xl font-bold text-green-600">₹{currentOrder.total || currentOrder.total_amount || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delivery Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Delivery Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {!isTracking && !isDelivered && (
                <Button 
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3"
                  size="lg"
                  onClick={startDelivery}
                >
                  <Navigation className="w-5 h-5 mr-2" />
                  🚀 Start Live Delivery Tracking
                </Button>
              )}

              {isTracking && !isDelivered && (
                <div className="space-y-3">
                  <Button 
                    className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-3"
                    size="lg"
                    onClick={stopDelivery}
                  >
                    ⏹️ Stop Tracking
                  </Button>
                  
                  <Button
                    onClick={handleCompleteDelivery}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3"
                    size="lg"
                  >
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Complete Delivery (OTP Required)
                  </Button>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="outline"
                  onClick={() => {
                    const phoneNumber = currentOrder.customerAddress?.phone || currentOrder.customer_phone;
                    if (phoneNumber) {
                      window.location.href = `tel:${phoneNumber}`;
                    }
                  }}
                  className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Call Customer
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={() => {
                    const message = `Hi! I'm your delivery agent for order #${currentOrder.orderId}. I'm on my way to deliver your order.`;
                    const phoneNumber = (currentOrder.customerAddress?.phone || currentOrder.customer_phone)?.replace(/^\\+?91/, '91');
                    if (phoneNumber) {
                      window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');
                    }
                  }}
                  className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                >
                  📱 WhatsApp
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* OTP Verification Modal */}
        {showOTPVerification && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <DeliveryOTPVerification
              orderId={currentOrder.orderId}
              customerPhone={currentOrder.customerAddress?.phone || currentOrder.customer_phone || ''}
              customerName={currentOrder.customerAddress?.name || currentOrder.customer_name || ''}
              onVerificationSuccess={handleOTPSuccess}
              onCancel={() => setShowOTPVerification(false)}
            />
          </div>
        )}

        {/* Delivered State */}
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

export default DeliveryTrackingWithMap;