import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Phone, MessageCircle, Navigation, Clock, MapPin, Truck, X } from 'lucide-react';
import { supabaseApi } from '@/lib/supabase';

interface OrderTrackingProps {
  orderId: string;
  isOpen: boolean;
  onClose: () => void;
  userType?: 'customer' | 'admin';
}

interface DeliveryAgent {
  id: number;
  name: string;
  phone: string;
  current_lat: number;
  current_lng: number;
  last_updated: string;
}

interface Order {
  id: string;
  customer_address: string;
  delivery_agent_id?: number;
  order_status: string;
  estimated_delivery: string;
}

// Simple map component without external dependencies
const SimpleMap = ({ customerLocation, agentLocation, deliveryAgent, userType = 'customer' }: {
  customerLocation: [number, number];
  agentLocation?: [number, number];
  deliveryAgent?: DeliveryAgent;
  userType?: 'customer' | 'admin';
}) => {
  const distance = agentLocation ? 
    Math.sqrt(
      Math.pow(agentLocation[0] - customerLocation[0], 2) + 
      Math.pow(agentLocation[1] - customerLocation[1], 2)
    ) * 111 : 0; // Rough km conversion

  return (
    <div className="relative bg-gradient-to-br from-blue-100 to-green-100 rounded-lg overflow-hidden h-96 border-2 border-gray-200">
      {/* Background grid pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="grid grid-cols-10 grid-rows-10 h-full w-full">
          {Array.from({ length: 100 }).map((_, i) => (
            <div key={i} className="border border-gray-400"></div>
          ))}
        </div>
      </div>
      
      {/* Map Title */}
      <div className="absolute top-4 left-4 bg-white px-3 py-2 rounded-lg shadow-md z-10">
        <h3 className="font-bold text-gray-800 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-blue-500" />
          {userType === 'admin' ? 'Admin Live Tracking' : 'Live Tracking'}
        </h3>
      </div>
      
      {/* Admin-only coordinates display */}
      {userType === 'admin' && (
        <div className="absolute top-4 right-4 bg-white px-3 py-2 rounded-lg shadow-md z-10 text-xs">
          <div className="font-medium text-gray-800 mb-1">📍 Coordinates</div>
          <div className="text-gray-600">
            <div>Customer: {customerLocation[0].toFixed(4)}, {customerLocation[1].toFixed(4)}</div>
            {agentLocation && (
              <div>Agent: {agentLocation[0].toFixed(4)}, {agentLocation[1].toFixed(4)}</div>
            )}
          </div>
        </div>
      )}
      
      {/* Customer Location */}
      <div className="absolute top-1/4 left-1/3 transform -translate-x-1/2 -translate-y-1/2 z-20">
        <div className="relative">
          <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white text-xl shadow-lg animate-pulse border-4 border-white">
            🏠
          </div>
          <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-3 py-1 rounded-full shadow text-xs font-medium whitespace-nowrap">
            {userType === 'admin' ? 'Customer Location' : 'Your Location'}
          </div>
          {/* Ripple effect */}
          <div className="absolute inset-0 w-12 h-12 bg-blue-400 rounded-full animate-ping opacity-30"></div>
        </div>
      </div>
      
      {/* Delivery Agent Location */}
      {agentLocation && (
        <div className="absolute top-3/4 right-1/4 transform translate-x-1/2 -translate-y-1/2 z-20">
          <div className="relative">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white text-xl shadow-lg animate-bounce border-4 border-white">
              🚚
            </div>
            <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-3 py-1 rounded-full shadow text-xs font-medium whitespace-nowrap">
              {deliveryAgent?.name || 'Delivery Partner'}
            </div>
            {/* Movement indicator */}
            <div className="absolute -top-2 -right-2 w-4 h-4 bg-yellow-400 rounded-full animate-pulse"></div>
          </div>
        </div>
      )}
      
      {/* Route Line */}
      {agentLocation && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
          <defs>
            <pattern id="dashed-line" patternUnits="userSpaceOnUse" width="20" height="4">
              <rect width="10" height="4" fill="#3B82F6" />
              <rect x="10" width="10" height="4" fill="transparent" />
            </pattern>
          </defs>
          <line 
            x1="33%" y1="25%" 
            x2="75%" y2="75%" 
            stroke="url(#dashed-line)" 
            strokeWidth="4"
            className="animate-pulse"
          />
          {/* Arrow indicator */}
          <polygon 
            points="70,290 80,285 80,295" 
            fill="#3B82F6" 
            className="animate-pulse"
          />
        </svg>
      )}
      
      {/* Distance and ETA Info */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
        <div className="bg-white px-4 py-2 rounded-lg shadow-md">
          <div className="text-sm font-medium text-gray-800">
            📍 Distance: ~{distance.toFixed(1)} km
          </div>
        </div>
        
        {agentLocation && (
          <div className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-md">
            <div className="text-sm font-medium flex items-center gap-2">
              <Clock className="w-4 h-4" />
              ETA: {Math.max(1, Math.round(distance * 2))} min
            </div>
          </div>
        )}
      </div>
      
      {/* Live indicator */}
      <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 animate-pulse">
        <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
        LIVE
      </div>
    </div>
  );
};

const OrderTracking = ({ orderId, isOpen, onClose, userType = 'customer' }: OrderTrackingProps) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [deliveryAgent, setDeliveryAgent] = useState<DeliveryAgent | null>(null);
  const [customerLocation, setCustomerLocation] = useState<[number, number] | null>(null);
  const [agentLocation, setAgentLocation] = useState<[number, number] | null>(null);
  const [loading, setLoading] = useState(true);
  const [estimatedTime, setEstimatedTime] = useState('');
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (isOpen && orderId) {
      loadOrderData();
      startLocationTracking();
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isOpen, orderId]);

  const loadOrderData = async () => {
    try {
      setLoading(true);
      
      // Get order details
      const orders = await supabaseApi.getOrders();
      const currentOrder = orders.find(o => o.id === orderId);
      
      if (currentOrder) {
        setOrder(currentOrder);
        
        // Get customer location from address (simulate geocoding)
        const customerCoords = await geocodeAddress(currentOrder.customer_address);
        setCustomerLocation(customerCoords);
        
        // For demo: Always show a delivery agent if order is trackable
        if (['ready_for_delivery', 'out_for_delivery'].includes(currentOrder.order_status)) {
          // Create demo delivery agent
          const demoAgent: DeliveryAgent = {
            id: 1,
            name: 'Rahul Kumar',
            phone: '+91 98765 43210',
            current_lat: customerCoords[0] + 0.005, // Slightly offset from customer
            current_lng: customerCoords[1] + 0.008,
            last_updated: new Date().toISOString()
          };
          
          setDeliveryAgent(demoAgent);
          setAgentLocation([demoAgent.current_lat, demoAgent.current_lng]);
          
          // Calculate estimated delivery time
          const distance = calculateDistance(
            [demoAgent.current_lat, demoAgent.current_lng],
            customerCoords
          );
          const estimatedMinutes = Math.round(distance * 2); // 2 minutes per km
          setEstimatedTime(`${estimatedMinutes} minutes`);
        }
      }
    } catch (error) {
      console.error('Failed to load order data:', error);
    } finally {
      setLoading(false);
    }
  };

  const startLocationTracking = () => {
    // Update delivery agent location every 10 seconds
    intervalRef.current = setInterval(async () => {
      if (deliveryAgent && customerLocation) {
        try {
          // Simulate agent movement towards customer
          const currentLat = deliveryAgent.current_lat;
          const currentLng = deliveryAgent.current_lng;
          const targetLat = customerLocation[0];
          const targetLng = customerLocation[1];
          
          // Move agent slightly towards customer
          const newLat = currentLat + (targetLat - currentLat) * 0.1;
          const newLng = currentLng + (targetLng - currentLng) * 0.1;
          
          const updatedAgent = {
            ...deliveryAgent,
            current_lat: newLat,
            current_lng: newLng,
            last_updated: new Date().toISOString()
          };
          
          setDeliveryAgent(updatedAgent);
          setAgentLocation([newLat, newLng]);
          
          // Update estimated time
          const distance = calculateDistance([newLat, newLng], customerLocation);
          const estimatedMinutes = Math.max(1, Math.round(distance * 2));
          setEstimatedTime(`${estimatedMinutes} minutes`);
          
        } catch (error) {
          console.error('Failed to update agent location:', error);
        }
      }
    }, 10000);
  };

  const geocodeAddress = async (address: string): Promise<[number, number]> => {
    // Simulate geocoding - in real app, use Google Maps API or similar
    // For demo, return Shirpur coordinates with some variation
    const baseCoords: [number, number] = [21.3487, 74.8831];
    const variation = 0.01;
    return [
      baseCoords[0] + (Math.random() - 0.5) * variation,
      baseCoords[1] + (Math.random() - 0.5) * variation
    ];
  };

  const calculateDistance = (point1: [number, number], point2: [number, number]): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (point2[0] - point1[0]) * Math.PI / 180;
    const dLon = (point2[1] - point1[1]) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(point1[0] * Math.PI / 180) * Math.cos(point2[0] * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-blue-500';
      case 'preparing': return 'bg-yellow-500';
      case 'ready_for_delivery': return 'bg-orange-500';
      case 'out_for_delivery': return 'bg-green-500';
      case 'delivered': return 'bg-gray-500';
      default: return 'bg-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Order Confirmed';
      case 'preparing': return 'Preparing Order';
      case 'ready_for_delivery': return 'Ready for Delivery';
      case 'out_for_delivery': return 'Out for Delivery';
      case 'delivered': return 'Delivered';
      default: return 'Unknown Status';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Track Your Order</h2>
            <Button variant="ghost" onClick={onClose}>✕</Button>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p>Loading tracking information...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Order Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="w-5 h-5" />
                    Order #{orderId}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Badge className={`${getStatusColor(order?.order_status || '')} text-white`}>
                      {getStatusText(order?.order_status || '')}
                    </Badge>
                    {estimatedTime && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        ETA: {estimatedTime}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Delivery Agent Info */}
              {deliveryAgent && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Navigation className="w-5 h-5" />
                      Your Delivery Partner
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{deliveryAgent.name}</p>
                        <p className="text-sm text-gray-600">
                          Last updated: {new Date(deliveryAgent.last_updated).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Phone className="w-4 h-4 mr-2" />
                          Call
                        </Button>
                        <Button size="sm" variant="outline">
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Chat
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Live Map */}
              {customerLocation && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      Live Tracking {userType === 'admin' && '- Admin View'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-96 rounded-lg overflow-hidden">
                      <SimpleMap 
                        customerLocation={customerLocation}
                        agentLocation={agentLocation}
                        deliveryAgent={deliveryAgent}
                        userType={userType}
                      />
                    </div>
                    
                    <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span>Customer Location</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span>Delivery Partner</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-0.5 bg-blue-500" style={{ borderTop: '2px dashed #3B82F6' }}></div>
                        <span>Route</span>
                      </div>
                    </div>
                    
                    {/* Admin-only detailed info */}
                    {userType === 'admin' && deliveryAgent && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-semibold mb-3 text-gray-800">📍 Detailed Location Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <h5 className="font-medium text-gray-700 mb-2">🏠 Customer Details:</h5>
                            <div className="space-y-1 text-gray-600">
                              <p><strong>Address:</strong> {order?.customer_address}</p>
                              <p><strong>Coordinates:</strong> {customerLocation[0].toFixed(6)}, {customerLocation[1].toFixed(6)}</p>
                              <p><strong>Area:</strong> Shirpur, Maharashtra</p>
                            </div>
                          </div>
                          <div>
                            <h5 className="font-medium text-gray-700 mb-2">🚚 Delivery Agent Details:</h5>
                            <div className="space-y-1 text-gray-600">
                              <p><strong>Name:</strong> {deliveryAgent.name}</p>
                              <p><strong>Phone:</strong> {deliveryAgent.phone}</p>
                              <p><strong>Current Location:</strong> {agentLocation?.[0].toFixed(6)}, {agentLocation?.[1].toFixed(6)}</p>
                              <p><strong>Last Updated:</strong> {new Date(deliveryAgent.last_updated).toLocaleString()}</p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Route Information */}
                        <div className="mt-4 p-3 bg-blue-50 rounded">
                          <h5 className="font-medium text-blue-800 mb-2">🛣️ Route Information:</h5>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-blue-700">
                            <div>
                              <span className="font-medium">Distance:</span><br />
                              <span>{agentLocation ? calculateDistance(agentLocation, customerLocation).toFixed(2) : '0'} km</span>
                            </div>
                            <div>
                              <span className="font-medium">ETA:</span><br />
                              <span>{estimatedTime}</span>
                            </div>
                            <div>
                              <span className="font-medium">Speed:</span><br />
                              <span>~15 km/h</span>
                            </div>
                            <div>
                              <span className="font-medium">Status:</span><br />
                              <span className="text-green-600 font-medium">Moving</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Order Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { status: 'confirmed', label: 'Order Confirmed', time: '2 min ago' },
                      { status: 'preparing', label: 'Preparing Your Order', time: '5 min ago' },
                      { status: 'ready_for_delivery', label: 'Ready for Delivery', time: 'In progress' },
                      { status: 'out_for_delivery', label: 'Out for Delivery', time: 'Pending' },
                      { status: 'delivered', label: 'Delivered', time: 'Pending' }
                    ].map((step, index) => (
                      <div key={step.status} className="flex items-center gap-4">
                        <div className={`w-4 h-4 rounded-full ${
                          order?.order_status === step.status ? 'bg-green-500' : 
                          index < ['confirmed', 'preparing', 'ready_for_delivery', 'out_for_delivery', 'delivered'].indexOf(order?.order_status || '') 
                            ? 'bg-green-500' : 'bg-gray-300'
                        }`}></div>
                        <div className="flex-1">
                          <p className="font-medium">{step.label}</p>
                          <p className="text-sm text-gray-600">{step.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;