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
const SimpleMap = ({ customerLocation, agentLocation, deliveryAgent }: {
  customerLocation: [number, number];
  agentLocation?: [number, number];
  deliveryAgent?: DeliveryAgent;
}) => {
  const distance = agentLocation ? 
    Math.sqrt(
      Math.pow(agentLocation[0] - customerLocation[0], 2) + 
      Math.pow(agentLocation[1] - customerLocation[1], 2)
    ) * 111 : 0; // Rough km conversion

  return (
    <div className="relative bg-gradient-to-br from-blue-50 to-green-50 rounded-lg overflow-hidden h-96 flex items-center justify-center">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="grid grid-cols-8 grid-rows-8 h-full w-full">
          {Array.from({ length: 64 }).map((_, i) => (
            <div key={i} className="border border-gray-300"></div>
          ))}
        </div>
      </div>
      
      {/* Customer Location */}
      <div className="absolute top-1/4 left-1/3 transform -translate-x-1/2 -translate-y-1/2">
        <div className="relative">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold animate-pulse">
            🏠
          </div>
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded shadow text-xs whitespace-nowrap">
            Your Location
          </div>
        </div>
      </div>
      
      {/* Delivery Agent Location */}
      {agentLocation && (
        <div className="absolute top-3/4 right-1/3 transform translate-x-1/2 -translate-y-1/2">
          <div className="relative">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold animate-bounce">
              🚚
            </div>
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded shadow text-xs whitespace-nowrap">
              {deliveryAgent?.name}
            </div>
          </div>
        </div>
      )}
      
      {/* Route Line */}
      {agentLocation && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <defs>
            <pattern id="dashed" patternUnits="userSpaceOnUse" width="10" height="2">
              <rect width="5" height="2" fill="#3B82F6" />
              <rect x="5" width="5" height="2" fill="transparent" />
            </pattern>
          </defs>
          <line 
            x1="33%" y1="25%" 
            x2="67%" y2="75%" 
            stroke="url(#dashed)" 
            strokeWidth="3"
            className="animate-pulse"
          />
        </svg>
      )}
      
      {/* Distance Info */}
      {agentLocation && (
        <div className="absolute bottom-4 left-4 bg-white px-3 py-2 rounded-lg shadow">
          <div className="text-sm font-medium text-gray-800">
            Distance: ~{distance.toFixed(1)} km
          </div>
        </div>
      )}
    </div>
  );
};

const OrderTracking = ({ orderId, isOpen, onClose }: OrderTrackingProps) => {
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
        
        // Get delivery agent if assigned
        if (currentOrder.delivery_agent_id) {
          const agents = await supabaseApi.getDeliveryAgents();
          const agent = agents.find(a => a.id === currentOrder.delivery_agent_id);
          
          if (agent && agent.current_lat && agent.current_lng) {
            setDeliveryAgent(agent);
            setAgentLocation([agent.current_lat, agent.current_lng]);
            
            // Calculate estimated delivery time
            if (customerCoords) {
              const distance = calculateDistance(
                [agent.current_lat, agent.current_lng],
                customerCoords
              );
              const estimatedMinutes = Math.round(distance * 2); // 2 minutes per km
              setEstimatedTime(`${estimatedMinutes} minutes`);
            }
          }
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
      if (order?.delivery_agent_id) {
        try {
          const agents = await supabaseApi.getDeliveryAgents();
          const agent = agents.find(a => a.id === order.delivery_agent_id);
          
          if (agent && agent.current_lat && agent.current_lng) {
            setDeliveryAgent(agent);
            setAgentLocation([agent.current_lat, agent.current_lng]);
            
            // Update estimated time
            if (customerLocation) {
              const distance = calculateDistance(
                [agent.current_lat, agent.current_lng],
                customerLocation
              );
              const estimatedMinutes = Math.round(distance * 2);
              setEstimatedTime(`${estimatedMinutes} minutes`);
            }
          }
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
                      Live Tracking
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-96 rounded-lg overflow-hidden">
                      <SimpleMap 
                        customerLocation={customerLocation}
                        agentLocation={agentLocation}
                        deliveryAgent={deliveryAgent}
                      />
                    </div>
                    
                    <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span>Your Location</span>
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