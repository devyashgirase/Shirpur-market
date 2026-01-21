import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Navigation, MapPin, Phone, Package, CheckCircle, Map, Truck } from 'lucide-react';
import { TrackingDashboard } from '@/components/TrackingDashboard';
import { deliveryCoordinationService } from '@/lib/deliveryCoordinationService';
import { EnhancedTrackingService } from '@/lib/enhancedTrackingService';
import DeliveryOTPVerification from '@/components/DeliveryOTPVerification';
import { LocationService } from '@/lib/locationService';

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
  
  // Enhanced location display with detailed address
  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const address = await LocationService.reverseGeocode(lat, lng);
      setAgentLocationName(`📍 ${address}`);
    } catch (error) {
      setAgentLocationName(`📍 ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    }
  };

  useEffect(() => {
    // Load current order from localStorage
    const order = JSON.parse(localStorage.getItem('currentOrder') || '{}');
    console.log('📦 Current order loaded:', order);
    console.log('🏠 Customer address fields:', {
      customer_address: order.customer_address,
      delivery_address: order.delivery_address,
      customerAddress: order.customerAddress
    });
    
    if (order.orderId) {
      // Ensure proper structure with real customer data
      const orderData = {
        orderId: order.orderId,
        customerAddress: {
          name: order.customer_name || order.customerAddress?.name || '',
          address: order.customer_address || order.customerAddress?.address || order.delivery_address || '',
          phone: order.customer_phone || order.customerAddress?.phone || ''
        },
        total: order.total_amount || order.total || 0,
        items: order.items || []
      };
      
      console.log('📝 Fixed order data:', orderData);
      setCurrentOrder(orderData);
      
      // Set customer location if available
      if (order.customerAddress?.coordinates) {
        setCustomerLocation({
          lat: order.customerAddress.coordinates.lat,
          lng: order.customerAddress.coordinates.lng
        });
      } else {
        // Default customer location (Shirpur area)
        setCustomerLocation({ lat: 21.3099, lng: 75.1178 });
      }
      
      // Set agent location if available
      if (order.deliveryAgent?.location) {
        setAgentLocation({
          lat: order.deliveryAgent.location.lat,
          lng: order.deliveryAgent.location.lng
        });
      }
    } else {
      console.log('⚠️ No current order found in localStorage');
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
    const startRealGPSTracking = async () => {
      // Request location permission first
      const hasPermission = await LocationService.requestLocationPermission();
      if (!hasPermission) {
        setAgentLocationName('📍 Location permission denied');
        return;
      }
      
      // Start continuous GPS tracking with enhanced service
      const agentId = localStorage.getItem('deliveryAgentId') || localStorage.getItem('agentPhone') || 'agent_001';
      console.log('📍 Starting GPS tracking for agent ID:', agentId);
      
      const trackingStarted = await LocationService.startTracking(agentId, order.orderId);
      
      if (trackingStarted) {
        console.log('📍 GPS tracking started successfully');
        setAgentLocationName('📍 GPS tracking active');
        
        // Listen for real-time location updates
        const handleLocationUpdate = (event: CustomEvent) => {
          const { latitude, longitude, accuracy, timestamp } = event.detail;
          const newLocation = { lat: latitude, lng: longitude };
          
          console.log('📍 Real-time location update:', newLocation, 'Accuracy:', accuracy + 'm');
          
          setAgentLocation(newLocation);
          setRoute(prev => [...prev.slice(-10), [latitude, longitude]]); // Keep last 10 points
          
          // Update location name with reverse geocoding
          LocationService.reverseGeocode(latitude, longitude).then(address => {
            setAgentLocationName(`📍 ${address}`);
          });
          
          // Send real-time update to customers
          if (currentOrder?.orderId) {
            window.dispatchEvent(new CustomEvent('trackingStarted', {
              detail: { 
                orderId: currentOrder.orderId, 
                location: newLocation,
                agentId: agentId,
                agentName: 'Delivery Agent',
                status: 'out_for_delivery',
                accuracy,
                timestamp
              }
            }));
          }
        };
        
        window.addEventListener('locationUpdate', handleLocationUpdate as EventListener);
        
        // Get initial location
        const initialLocation = await LocationService.getCurrentLocation();
        if (initialLocation) {
          setAgentLocation(initialLocation);
          const address = await LocationService.reverseGeocode(initialLocation.lat, initialLocation.lng);
          setAgentLocationName(`📍 ${address}`);
        }
        
        return () => {
          LocationService.stopTracking();
          window.removeEventListener('locationUpdate', handleLocationUpdate as EventListener);
        };
      } else {
        setAgentLocationName('📍 GPS tracking failed to start');
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
      
      // Stop GPS tracking
      LocationService.stopTracking();
      
      const trackingInterval = localStorage.getItem('trackingInterval');
      if (trackingInterval) {
        clearInterval(parseInt(trackingInterval));
        localStorage.removeItem('trackingInterval');
      }
      
      // Notify customers of delivery
      window.dispatchEvent(new CustomEvent('orderStatusUpdated', {
        detail: { 
          orderId: currentOrder.orderId, 
          status: 'delivered'
        }
      }));
      
      // Clear tracking data
      localStorage.removeItem(`tracking_${currentOrder.orderId}`);
      localStorage.removeItem('currentOrder');
      
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
            <div className="mt-4 p-3 bg-yellow-50 rounded text-left">
              <p className="text-xs text-yellow-700">Debug: {JSON.stringify(currentOrder)}</p>
            </div>
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
              <p className="text-blue-100">Order #{currentOrder?.orderId}</p>
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
            <div className="space-y-3">
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-gray-600">Customer Name</p>
                    <p className="font-semibold text-lg">{currentOrder?.customerAddress?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Delivery Address</p>
                    <p className="text-gray-700">{currentOrder?.customerAddress?.address || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone Number</p>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-blue-500" />
                      <span className="text-blue-600 font-medium">{currentOrder?.customerAddress?.phone || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">Order Value</p>
                <p className="text-2xl font-bold text-green-600">₹{currentOrder.total || 0}</p>
              </div>
              {currentOrder.items && (
                <div className="bg-orange-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 mb-2">Order Items:</p>
                  {currentOrder.items.slice(0, 3).map((item: any, idx: number) => (
                    <p key={idx} className="text-sm text-gray-600">
                      {item.quantity}x {item.name || item.product?.name || 'Item'}
                    </p>
                  ))}
                  {currentOrder.items.length > 3 && (
                    <p className="text-xs text-gray-500">+{currentOrder.items.length - 3} more items</p>
                  )}
                </div>
              )}
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
              <Button 
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3"
                size="lg"
                onClick={() => {
                  // Use real customer address for Google Maps navigation
                  const customerAddress = currentOrder?.customerAddress?.address || currentOrder?.customer_address || currentOrder?.delivery_address;
                  console.log('🗺️ Opening maps with customer address:', customerAddress);
                  
                  let mapsUrl;
                  if (customerAddress && customerAddress.trim() !== '') {
                    // Use address-based navigation
                    const encodedAddress = encodeURIComponent(customerAddress);
                    mapsUrl = `https://www.google.com/maps/dir/Current+Location/${encodedAddress}`;
                  } else {
                    // Fallback to coordinates
                    mapsUrl = `https://www.google.com/maps/dir/${agentLocation.lat},${agentLocation.lng}/${customerLocation.lat},${customerLocation.lng}/@${agentLocation.lat},${agentLocation.lng},15z/data=!3m1!4b1!4m2!4m1!3e0`;
                  }
                  
                  console.log('🚀 Opening Google Maps URL:', mapsUrl);
                  window.open(mapsUrl, '_blank');
                  
                  // Start continuous GPS tracking with enhanced updates
                  if (navigator.geolocation) {
                    const agentId = localStorage.getItem('deliveryAgentId') || localStorage.getItem('agentPhone') || 'current_agent';
                    
                    // Start enhanced GPS tracking
                    LocationService.startTracking(agentId, currentOrder.orderId);
                    
                    const trackingInterval = setInterval(async () => {
                      const currentLocation = await LocationService.getCurrentLocation();
                      if (currentLocation) {
                        // Update real-time location for customers with enhanced data
                        window.dispatchEvent(new CustomEvent('trackingStarted', {
                          detail: { 
                            orderId: currentOrder.orderId, 
                            location: currentLocation,
                            agentId: agentId,
                            agentName: 'Delivery Agent',
                            status: 'out_for_delivery',
                            accuracy: currentLocation.accuracy,
                            timestamp: new Date().toISOString()
                          }
                        }));
                      }
                    }, 8000); // Update every 8 seconds
                    
                    // Store interval ID to clear later
                    localStorage.setItem('trackingInterval', trackingInterval.toString());
                  }
                  
                  alert('🚀 Live delivery started! Google Maps opened with navigation.');
                }}
              >
                <Navigation className="w-5 h-5 mr-2" />
                🚀 Start Delivery (Live Maps)
              </Button>
              
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="outline"
                  onClick={() => {
                    const phoneNumber = currentOrder.customerAddress?.phone || currentOrder.customer_phone;
                    console.log('📞 Calling customer:', phoneNumber);
                    if (phoneNumber && phoneNumber.trim() !== '') {
                      window.location.href = `tel:${phoneNumber}`;
                    } else {
                      alert('Customer phone number not available');
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
                    const message = `Hi! I'm your delivery agent for order #${currentOrder.orderId}. I'm on my way to deliver your order. ETA: 15-20 minutes.`;
                    const phoneNumber = (currentOrder.customerAddress?.phone || currentOrder.customer_phone)?.replace(/^\+?91/, '91');
                    console.log('📱 WhatsApp to customer:', phoneNumber);
                    if (phoneNumber && phoneNumber.trim() !== '') {
                      window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');
                    } else {
                      alert('Customer phone number not available');
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