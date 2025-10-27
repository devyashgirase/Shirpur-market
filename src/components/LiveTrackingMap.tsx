import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation, Clock, Zap, Phone } from 'lucide-react';
import { realTimeTrackingService, DeliveryAgent, LiveLocation } from '@/lib/realTimeTrackingService';

interface LiveTrackingMapProps {
  orderId?: string;
  agentId?: string;
  customerLocation?: { lat: number; lng: number };
}

const LiveTrackingMap = ({ orderId, agentId, customerLocation }: LiveTrackingMapProps) => {
  const [agents, setAgents] = useState<DeliveryAgent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<DeliveryAgent | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const subscriptionRef = useRef<string | null>(null);

  useEffect(() => {
    loadAgents();
    startRealTimeUpdates();

    return () => {
      stopRealTimeUpdates();
    };
  }, []);

  const loadAgents = async () => {
    const activeAgents = await realTimeTrackingService.getActiveAgents();
    setAgents(activeAgents);
    
    if (agentId) {
      const agent = activeAgents.find(a => a.id === agentId);
      if (agent) setSelectedAgent(agent);
    }
  };

  const startRealTimeUpdates = () => {
    setIsTracking(true);
    
    subscriptionRef.current = realTimeTrackingService.subscribe('locationUpdate', (update) => {
      const { agentId: updatedAgentId, location } = update.data;
      
      setAgents(prev => prev.map(agent => 
        agent.id === updatedAgentId 
          ? { ...agent, currentLocation: location }
          : agent
      ));

      if (selectedAgent && selectedAgent.id === updatedAgentId) {
        setSelectedAgent(prev => prev ? { ...prev, currentLocation: location } : null);
      }
    });

    // Refresh agents every 30 seconds
    const refreshInterval = setInterval(loadAgents, 30000);
    
    return () => {
      clearInterval(refreshInterval);
    };
  };

  const stopRealTimeUpdates = () => {
    setIsTracking(false);
    if (subscriptionRef.current) {
      realTimeTrackingService.unsubscribe(subscriptionRef.current);
    }
  };

  const getAgentStatusColor = (agent: DeliveryAgent) => {
    const timeDiff = Date.now() - agent.currentLocation.timestamp;
    if (timeDiff < 30000) return 'bg-green-500'; // Active (< 30s)
    if (timeDiff < 120000) return 'bg-yellow-500'; // Recent (< 2min)
    return 'bg-red-500'; // Offline (> 2min)
  };

  const formatLastUpdate = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`;
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    return `${Math.floor(diff / 3600000)}h ago`;
  };

  const calculateETA = (agent: DeliveryAgent) => {
    if (!customerLocation) return null;
    return realTimeTrackingService.calculateETA(agent.currentLocation, customerLocation);
  };

  return (
    <div className="space-y-4">
      {/* Live Status */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${isTracking ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
              Live Tracking {isTracking ? 'Active' : 'Inactive'}
            </CardTitle>
            <Badge variant="outline" className="text-xs">
              {agents.length} Agents Online
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Map Container */}
      <Card>
        <CardContent className="p-0">
          <div 
            ref={mapRef}
            className="relative w-full h-80 bg-gradient-to-br from-blue-50 to-green-50 overflow-hidden rounded-lg"
          >
            {/* Map Grid */}
            <div className="absolute inset-0 opacity-10">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="absolute border-gray-400" style={{
                  left: `${i * 8.33}%`,
                  top: 0,
                  bottom: 0,
                  borderLeft: '1px solid'
                }} />
              ))}
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="absolute border-gray-400" style={{
                  top: `${i * 12.5}%`,
                  left: 0,
                  right: 0,
                  borderTop: '1px solid'
                }} />
              ))}
            </div>

            {/* Customer Location */}
            {customerLocation && (
              <div 
                className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
                style={{
                  left: `${50 + (customerLocation.lng - 74.8831) * 5000}%`,
                  top: `${50 - (customerLocation.lat - 21.3487) * 5000}%`
                }}
              >
                <div className="relative">
                  <div className="w-6 h-6 bg-blue-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                    Customer
                  </div>
                </div>
              </div>
            )}

            {/* Delivery Agents */}
            {agents.map((agent) => (
              <div 
                key={agent.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer"
                style={{
                  left: `${50 + (agent.currentLocation.lng - 74.8831) * 5000}%`,
                  top: `${50 - (agent.currentLocation.lat - 21.3487) * 5000}%`
                }}
                onClick={() => setSelectedAgent(agent)}
              >
                <div className="relative">
                  <div className={`w-8 h-8 ${getAgentStatusColor(agent)} rounded-full border-2 border-white shadow-lg flex items-center justify-center animate-pulse`}>
                    <Navigation className="w-4 h-4 text-white" style={{
                      transform: `rotate(${agent.currentLocation.heading || 0}deg)`
                    }} />
                  </div>
                  {selectedAgent?.id === agent.id && (
                    <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-green-600 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                      {agent.name}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Map Labels */}
            <div className="absolute top-2 left-2 bg-white/90 px-2 py-1 rounded text-xs font-medium">
              Shirpur Live Map
            </div>
            <div className="absolute bottom-2 right-2 bg-white/90 px-2 py-1 rounded text-xs">
              Updates every 5s
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Agent Details */}
      {selectedAgent && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{selectedAgent.name}</CardTitle>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${getAgentStatusColor(selectedAgent)}`} />
                <span className="text-sm text-gray-600">
                  {formatLastUpdate(selectedAgent.currentLocation.timestamp)}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Speed</p>
                <p className="font-medium">{Math.round(selectedAgent.currentLocation.speed || 0)} km/h</p>
              </div>
              <div>
                <p className="text-gray-600">Location</p>
                <p className="font-medium text-xs">
                  {selectedAgent.currentLocation.lat.toFixed(4)}, {selectedAgent.currentLocation.lng.toFixed(4)}
                </p>
              </div>
            </div>
            
            {customerLocation && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">ETA</span>
                  </div>
                  <span className="text-lg font-bold text-blue-600">
                    {calculateETA(selectedAgent)} min
                  </span>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="flex-1">
                <Phone className="w-4 h-4 mr-1" />
                Call
              </Button>
              <Button size="sm" className="flex-1">
                <Zap className="w-4 h-4 mr-1" />
                Track Live
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Agents List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Active Delivery Agents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {agents.map((agent) => (
              <div 
                key={agent.id}
                className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedAgent?.id === agent.id ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                }`}
                onClick={() => setSelectedAgent(agent)}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${getAgentStatusColor(agent)}`} />
                  <div>
                    <p className="font-medium text-sm">{agent.name}</p>
                    <p className="text-xs text-gray-600">
                      {Math.round(agent.currentLocation.speed || 0)} km/h • {formatLastUpdate(agent.currentLocation.timestamp)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  {customerLocation && (
                    <p className="text-sm font-medium text-blue-600">
                      {calculateETA(agent)} min
                    </p>
                  )}
                  <p className="text-xs text-gray-500">ETA</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LiveTrackingMap;