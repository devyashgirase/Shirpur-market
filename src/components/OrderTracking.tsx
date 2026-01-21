import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Phone, MessageCircle, Navigation, Clock, MapPin, Truck, X } from 'lucide-react';
import { supabaseApi } from '@/lib/supabase';
import OpenStreetMap from '@/components/OpenStreetMap';
import GPSDataVerification from '@/components/GPSDataVerification';

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

// OpenStreetMap container component
const MapContainer = ({ customerLocation, agentLocation, deliveryAgent, userType = 'customer' }: {
  customerLocation: [number, number];
  agentLocation?: [number, number];
  deliveryAgent?: DeliveryAgent;
  userType?: 'customer' | 'admin';
}) => {
  return (
    <OpenStreetMap 
      customerLocation={customerLocation}
      agentLocation={agentLocation}
      deliveryAgent={deliveryAgent}
      userType={userType}
    />
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
      
      // Get order details from Supabase
      const orders = await supabaseApi.getOrders();
      const currentOrder = orders.find(o => String(o.id) === String(orderId));
      
      if (currentOrder) {
        setOrder(currentOrder);
        console.log('📦 Order loaded:', currentOrder);
        
        // Get customer location using real GPS or address
        const customerCoords = await getCustomerLocation(currentOrder);
        setCustomerLocation(customerCoords);
        console.log('📍 Customer location set:', customerCoords);
        
        // Get real delivery agent from Supabase if assigned
        if (currentOrder.delivery_agent_id) {
          await loadDeliveryAgent(currentOrder.delivery_agent_id, customerCoords);
        } else if (['ready_for_delivery', 'out_for_delivery'].includes(currentOrder.order_status)) {
          console.log('🚚 No agent assigned, creating demo agent for trackable order');
          createDemoAgent(customerCoords);
        }
      } else {
        console.error('❌ Order not found:', orderId);
      }
    } catch (error) {
      console.error('Failed to load order data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const getCustomerLocation = async (order: any): Promise<[number, number]> => {
    // Get customer location from order address using geocoding
    const address = order.customer_address || order.delivery_address;
    if (address) {
      console.log('📍 Geocoding customer address:', address);
      return await geocodeAddress(address);
    }
    
    // Fallback to Shirpur coordinates
    return [21.3487, 74.8831];
  };
  
  const loadDeliveryAgent = async (agentId: number, customerCoords: [number, number]) => {
    try {
      const agents = await supabaseApi.getDeliveryAgents();
      const assignedAgent = agents.find(a => a.id === agentId);
      console.log('🚚 Looking for agent ID:', agentId);
      console.log('🚚 Available agents:', agents);
      
      if (assignedAgent) {
        // Use real agent GPS coordinates if available
        const hasRealLocation = assignedAgent.current_lat && assignedAgent.current_lng;
        
        if (hasRealLocation) {
          console.log('🛰️ Using real agent GPS coordinates');
          const agentWithLocation = {
            ...assignedAgent,
            current_lat: assignedAgent.current_lat,
            current_lng: assignedAgent.current_lng,
            last_updated: assignedAgent.last_location_update || assignedAgent.last_updated || new Date().toISOString()
          };
          
          setDeliveryAgent(agentWithLocation);
          setAgentLocation([assignedAgent.current_lat, assignedAgent.current_lng]);
          
          console.log('🚚 Real agent location set:', [assignedAgent.current_lat, assignedAgent.current_lng]);
          
          // Calculate real distance and ETA
          const distance = calculateDistance([assignedAgent.current_lat, assignedAgent.current_lng], customerCoords);
          const estimatedMinutes = Math.max(1, Math.round(distance * 2));
          setEstimatedTime(`${estimatedMinutes} minutes`);
        } else {
          console.log('📍 No real GPS, creating demo location near customer');
          createDemoAgent(customerCoords);
        }
      } else {
        console.log('🚚 No agent found, creating demo agent');
        createDemoAgent(customerCoords);
      }
    } catch (error) {
      console.error('Failed to load delivery agent:', error);
      createDemoAgent(customerCoords);
    }
  };
  
  const createDemoAgent = (customerCoords: [number, number]) => {
    const demoAgent: DeliveryAgent = {
      id: 999,
      name: 'Delivery Partner',
      phone: '+91 98765 43210',
      current_lat: customerCoords[0] + 0.005,
      current_lng: customerCoords[1] + 0.008,
      last_updated: new Date().toISOString()
    };
    setDeliveryAgent(demoAgent);
    setAgentLocation([demoAgent.current_lat, demoAgent.current_lng]);
    setEstimatedTime('15 minutes');
    console.log('🚚 Demo agent created:', demoAgent);
  };

  const startLocationTracking = () => {
    console.log('🔄 Starting real-time location tracking...');
    
    // Listen for real-time location updates from delivery agents
    const handleLocationUpdate = (event: CustomEvent) => {
      const { agentId, latitude, longitude, timestamp } = event.detail;
      console.log('📍 Real-time location update:', { agentId, latitude, longitude });
      
      if (deliveryAgent && (agentId === deliveryAgent.id || agentId === deliveryAgent.user_id)) {
        const updatedAgent = {
          ...deliveryAgent,
          current_lat: latitude,
          current_lng: longitude,
          last_updated: timestamp
        };
        
        setDeliveryAgent(updatedAgent);
        setAgentLocation([latitude, longitude]);
        
        // Update estimated time based on real location
        if (customerLocation) {
          const distance = calculateDistance([latitude, longitude], customerLocation);
          const estimatedMinutes = Math.max(1, Math.round(distance * 2));
          setEstimatedTime(`${estimatedMinutes} minutes`);
        }
      }
    };
    
    // Listen for location updates
    window.addEventListener('locationUpdate', handleLocationUpdate as EventListener);
    
    // Fetch latest agent location every 3 seconds from database
    intervalRef.current = setInterval(async () => {
      if (order?.delivery_agent_id && order.delivery_agent_id !== 999) {
        try {
          const agents = await supabaseApi.getDeliveryAgents();
          const agent = agents.find(a => a.id === order.delivery_agent_id);
          
          if (agent && (agent.current_lat && agent.current_lng)) {
            console.log('🔄 Database location update:', agent);
            
            const updatedAgent = {
              ...agent,
              last_updated: agent.last_location_update || new Date().toISOString()
            };
            
            setDeliveryAgent(updatedAgent);
            setAgentLocation([agent.current_lat, agent.current_lng]);
            
            // Update estimated time
            if (customerLocation) {
              const distance = calculateDistance([agent.current_lat, agent.current_lng], customerLocation);
              const estimatedMinutes = Math.max(1, Math.round(distance * 2));
              setEstimatedTime(`${estimatedMinutes} minutes`);
            }
          }
        } catch (error) {
          console.error('Failed to fetch agent location:', error);
        }
      } else if (deliveryAgent && customerLocation) {
        // Simulate movement for demo agents only
        const currentLat = deliveryAgent.current_lat;
        const currentLng = deliveryAgent.current_lng;
        const targetLat = customerLocation[0];
        const targetLng = customerLocation[1];
        
        // Move agent towards customer (8% closer each update)
        const newLat = currentLat + (targetLat - currentLat) * 0.08;
        const newLng = currentLng + (targetLng - currentLng) * 0.08;
        
        const updatedAgent = {
          ...deliveryAgent,
          current_lat: newLat,
          current_lng: newLng,
          last_updated: new Date().toISOString()
        };
        
        setDeliveryAgent(updatedAgent);
        setAgentLocation([newLat, newLng]);
        
        console.log('🔄 Demo agent movement:', [newLat, newLng]);
        
        // Update estimated time
        const distance = calculateDistance([newLat, newLng], customerLocation);
        const estimatedMinutes = Math.max(1, Math.round(distance * 2));
        setEstimatedTime(`${estimatedMinutes} minutes`);
      }
    }, 3000); // Update every 3 seconds
    
    return () => {
      window.removeEventListener('locationUpdate', handleLocationUpdate as EventListener);
    };
  };

  const geocodeAddress = async (address: string): Promise<[number, number]> => {
    try {
      // Try OpenStreetMap Nominatim API for real geocoding
      const encodedAddress = encodeURIComponent(`${address}, Shirpur, Maharashtra, India`);
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1`);
      
      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lon = parseFloat(data[0].lon);
          console.log('📍 Geocoded address:', { address, lat, lon });
          return [lat, lon];
        }
      }
    } catch (error) {
      console.log('📍 Geocoding API failed, using fallback');
    }
    
    // Fallback to Shirpur coordinates with address-based variation
    const baseCoords: [number, number] = [21.3487, 74.8831];
    const addressHash = address.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    const variation = 0.008; // Smaller variation for more realistic locations
    
    return [
      baseCoords[0] + (addressHash % 1000) / 100000 * variation,
      baseCoords[1] + (addressHash % 1000) / 100000 * variation
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
      <GPSDataVerification />
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
                    <MapContainer 
                      customerLocation={customerLocation}
                      agentLocation={agentLocation}
                      deliveryAgent={deliveryAgent}
                      userType={userType}
                    />
                    
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
                        <h4 className="font-semibold mb-3 text-gray-800">📍 Live Tracking Details</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <h5 className="font-medium text-gray-700 mb-2">🏠 Customer Order Address:</h5>
                            <div className="space-y-1 text-gray-600">
                              <p><strong>Address:</strong> {order?.customer_address}</p>
                              <p><strong>Coordinates:</strong> {customerLocation[0].toFixed(6)}, {customerLocation[1].toFixed(6)}</p>
                              <p><strong>Name:</strong> {order?.customer_name}</p>
                              <p><strong>Phone:</strong> {order?.customer_phone}</p>
                            </div>
                          </div>
                          <div>
                            <h5 className="font-medium text-gray-700 mb-2">🚚 Delivery Agent Live Location:</h5>
                            <div className="space-y-1 text-gray-600">
                              <p><strong>Name:</strong> {deliveryAgent.name}</p>
                              <p><strong>Phone:</strong> {deliveryAgent.phone}</p>
                              <p><strong>Current GPS:</strong> {agentLocation?.[0].toFixed(6)}, {agentLocation?.[1].toFixed(6)}</p>
                              <p><strong>Last Updated:</strong> {new Date(deliveryAgent.last_updated).toLocaleString()}</p>
                              <p><strong>Status:</strong> <span className={`font-medium ${
                                deliveryAgent.id === 999 ? 'text-orange-600' : 'text-green-600'
                              }`}>
                                {deliveryAgent.id === 999 ? '📍 Demo Mode' : '🛰️ Live GPS'}
                              </span></p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Real-time tracking info */}
                        <div className="mt-4 p-3 bg-blue-50 rounded">
                          <h5 className="font-medium text-blue-800 mb-2">🛣️ Live Route Tracking:</h5>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-blue-700">
                            <div>
                              <span className="font-medium">Real Distance:</span><br />
                              <span>{agentLocation ? calculateDistance(agentLocation, customerLocation).toFixed(3) : '0'} km</span>
                            </div>
                            <div>
                              <span className="font-medium">Live ETA:</span><br />
                              <span>{estimatedTime}</span>
                            </div>
                            <div>
                              <span className="font-medium">Tracking:</span><br />
                              <span className="text-green-600 font-medium">🔴 LIVE</span>
                            </div>
                            <div>
                              <span className="font-medium">Data Source:</span><br />
                              <span className={deliveryAgent.id === 999 ? 'text-orange-600' : 'text-green-600'}>
                                {deliveryAgent.id === 999 ? 'Simulated' : 'Real GPS'}
                              </span>
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