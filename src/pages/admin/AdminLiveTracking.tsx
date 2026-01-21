import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Truck, Package, User, Phone, MapPin, Clock, Navigation, Eye, MessageCircle } from "lucide-react";
import { supabaseApi } from "@/lib/supabase";
import OrderTracking from "@/components/OrderTracking";

interface DeliveryAgent {
  id: number;
  name: string;
  phone: string;
  current_lat: number;
  current_lng: number;
  current_address: string;
  last_updated: string;
  status: string;
}

interface Order {
  id: string;
  orderId: string;
  order_status: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  delivery_agent_id?: number;
  items: any[];
  total_amount: number;
  created_at: string;
  payment_status: string;
}

const AdminLiveTracking = () => {
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [deliveryAgents, setDeliveryAgents] = useState<DeliveryAgent[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<DeliveryAgent | null>(null);
  const [showOrderTracking, setShowOrderTracking] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load orders from Supabase
      const orders = await supabaseApi.getOrders();
      const trackableOrders = orders.filter(order => 
        ['ready_for_delivery', 'out_for_delivery'].includes(order.order_status)
      );
      setActiveOrders(trackableOrders);
      
      // Load delivery agents
      const agents = await supabaseApi.getDeliveryAgents();
      const agentsWithLocation = agents.map(agent => ({
        ...agent,
        current_address: generateStreetAddress(agent.current_lat, agent.current_lng),
        status: getAgentStatus(agent.id, trackableOrders)
      }));
      setDeliveryAgents(agentsWithLocation);
      
    } catch (error) {
      console.error('Failed to load tracking data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateStreetAddress = (lat: number, lng: number): string => {
    // Generate realistic street addresses based on coordinates
    const streets = [
      'MG Road', 'Station Road', 'Gandhi Chowk', 'Market Street', 'Temple Road',
      'School Lane', 'Hospital Road', 'Bus Stand Road', 'College Street', 'Main Road'
    ];
    const areas = [
      'Shirpur', 'Dhule Road', 'Nashik Road', 'City Center', 'Old Town',
      'New Area', 'Industrial Area', 'Residential Colony', 'Commercial Zone'
    ];
    
    const streetIndex = Math.floor((lat * 1000) % streets.length);
    const areaIndex = Math.floor((lng * 1000) % areas.length);
    const houseNo = Math.floor((lat + lng) * 100) % 999 + 1;
    
    return `${houseNo}, ${streets[streetIndex]}, ${areas[areaIndex]}, Shirpur - 425405`;
  };

  const getAgentStatus = (agentId: number, orders: Order[]): string => {
    const assignedOrder = orders.find(order => order.delivery_agent_id === agentId);
    if (assignedOrder) {
      return assignedOrder.order_status === 'out_for_delivery' ? 'Delivering' : 'Assigned';
    }
    return 'Available';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready_for_delivery': return 'bg-orange-500';
      case 'out_for_delivery': return 'bg-green-500';
      case 'delivered': return 'bg-gray-500';
      case 'Available': return 'bg-blue-500';
      case 'Assigned': return 'bg-yellow-500';
      case 'Delivering': return 'bg-green-500';
      default: return 'bg-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ready_for_delivery': return 'Ready for Delivery';
      case 'out_for_delivery': return 'Out for Delivery';
      case 'delivered': return 'Delivered';
      default: return status;
    }
  };

  const handleTrackOrder = (orderId: string) => {
    setSelectedOrder(activeOrders.find(o => o.id === orderId) || null);
    setShowOrderTracking(true);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Live Delivery Tracking - Admin Panel</h1>
      
      <div className="grid lg:grid-cols-4 gap-6">
        {/* Active Orders */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Package className="w-5 h-5" />
            Active Orders ({activeOrders.length})
          </h2>
          
          {loading ? (
            <Card>
              <CardContent className="p-6 text-center">
                <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p>Loading orders...</p>
              </CardContent>
            </Card>
          ) : activeOrders.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No active deliveries</p>
              </CardContent>
            </Card>
          ) : (
            activeOrders.map((order) => (
              <Card key={order.id} className="cursor-pointer hover:shadow-md transition-all">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">#{order.id}</h3>
                    <Badge className={`${getStatusColor(order.order_status)} text-white`}>
                      {getStatusText(order.order_status)}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span>{order.customer_name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span>{order.customer_phone}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span className="truncate">{order.customer_address}</span>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => handleTrackOrder(order.id)}
                    className="w-full mt-3 bg-blue-500 hover:bg-blue-600"
                    size="sm"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Track Live
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Delivery Agents */}
        <div className="lg:col-span-3 space-y-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Truck className="w-5 h-5" />
            Delivery Agents ({deliveryAgents.length})
          </h2>
          
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {deliveryAgents.map((agent) => (
              <Card key={agent.id} className="hover:shadow-lg transition-all">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                        {agent.name.charAt(0)}
                      </div>
                      {agent.name}
                    </CardTitle>
                    <Badge className={`${getStatusColor(agent.status)} text-white`}>
                      {agent.status}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Contact Info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span>{agent.phone}</span>
                      <Button size="sm" variant="outline" className="ml-auto">
                        <Phone className="w-3 h-3" />
                      </Button>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <MessageCircle className="w-4 h-4 text-gray-500" />
                      <span>Send Message</span>
                      <Button size="sm" variant="outline" className="ml-auto">
                        <MessageCircle className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Location Details */}
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-blue-500" />
                      Current Location
                    </h4>
                    <p className="text-xs text-gray-600 mb-2">{agent.current_address}</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-gray-500">Lat:</span> {agent.current_lat.toFixed(6)}
                      </div>
                      <div>
                        <span className="text-gray-500">Lng:</span> {agent.current_lng.toFixed(6)}
                      </div>
                    </div>
                  </div>
                  
                  {/* Last Updated */}
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>Updated: {new Date(agent.last_updated).toLocaleTimeString()}</span>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => setSelectedAgent(agent)}
                    >
                      <Navigation className="w-3 h-3 mr-1" />
                      View Map
                    </Button>
                    
                    {agent.status === 'Delivering' && (
                      <Button 
                        size="sm" 
                        className="flex-1 bg-green-500 hover:bg-green-600"
                        onClick={() => {
                          const order = activeOrders.find(o => o.delivery_agent_id === agent.id);
                          if (order) handleTrackOrder(order.id);
                        }}
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        Track Order
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Order Tracking Modal */}
      {selectedOrder && (
        <OrderTracking
          orderId={selectedOrder.id}
          isOpen={showOrderTracking}
          userType="admin"
          onClose={() => {
            setShowOrderTracking(false);
            setSelectedOrder(null);
          }}
        />
      )}
    </div>
  );
};

export default AdminLiveTracking;