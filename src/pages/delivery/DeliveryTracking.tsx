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
  
  // Simple location display without external API
  const reverseGeocode = async (lat: number, lng: number) => {
    setAgentLocationName(`📍 ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
  };

  useEffect(() => {
    // Load current order from localStorage
    const order = JSON.parse(localStorage.getItem('currentOrder') || '{}');
    console.log('📦 Current order loaded:', order);
    
    if (order.orderId) {
      // Ensure proper structure
      const orderData = {
        orderId: order.orderId,
        customerAddress: {
          name: order.customerAddress?.name || order.customer_name || 'Customer Name',
          address: order.customerAddress?.address || order.customer_address || 'Delivery Address',
          phone: order.customerAddress?.phone || order.customer_phone || 'Phone Number'
        },
        total: order.total || order.total_amount || 0,
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
            
            // Send real-time location to customers
            if (currentOrder?.orderId) {
              const locationUpdate = {
                ...newLocation,
                timestamp: new Date().toISOString()
              };
              
              // Store location history
              const existingTracking = JSON.parse(localStorage.getItem(`tracking_${currentOrder.orderId}`) || '[]');
              existingTracking.push(locationUpdate);
              localStorage.setItem(`tracking_${currentOrder.orderId}`, JSON.stringify(existingTracking));
              
              // Trigger real-time update for customers
              window.dispatchEvent(new CustomEvent('trackingStarted', {
                detail: { 
                  orderId: currentOrder.orderId, 
                  location: newLocation,
                  agentId: 'current_agent',
                  agentName: 'Delivery Agent',
                  status: 'out_for_delivery'
                }
              }));
            }
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
      
      // Stop GPS tracking
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
                    <p className="font-semibold text-lg">{currentOrder?.customerAddress?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Delivery Address</p>
                    <p className="text-gray-700">{currentOrder?.customerAddress?.address}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone Number</p>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-blue-500" />
                      <span className="text-blue-600 font-medium">{currentOrder?.customerAddress?.phone}</span>
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
                  // Open live Google Maps with real-time navigation
                  const mapsUrl = `https://www.google.com/maps/dir/${agentLocation.lat},${agentLocation.lng}/${customerLocation.lat},${customerLocation.lng}/@${agentLocation.lat},${agentLocation.lng},15z/data=!3m1!4b1!4m2!4m1!3e0`;
                  window.open(mapsUrl, '_blank');
                  
                  // Start continuous GPS tracking
                  if (navigator.geolocation) {
                    const trackingInterval = setInterval(() => {
                      navigator.geolocation.getCurrentPosition((position) => {
                        const newLocation = {
                          lat: position.coords.latitude,
                          lng: position.coords.longitude
                        };
                        
                        // Update real-time location for customers
                        window.dispatchEvent(new CustomEvent('trackingStarted', {
                          detail: { 
                            orderId: currentOrder.orderId, 
                            location: newLocation,
                            agentId: 'current_agent',
                            agentName: 'Delivery Agent',
                            status: 'out_for_delivery'
                          }
                        }));
                      });
                    }, 10000); // Update every 10 seconds
                    
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
                    const phoneNumber = currentOrder.customerAddress?.phone;
                    if (phoneNumber) {
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
                    const phoneNumber = currentOrder.customerAddress?.phone?.replace(/^\+?91/, '91');
                    if (phoneNumber) {
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