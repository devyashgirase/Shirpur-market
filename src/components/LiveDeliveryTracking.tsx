import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Navigation, Clock, Phone } from "lucide-react";

interface DeliveryAgent {
  id: string;
  name: string;
  phone: string;
  currentLat: number;
  currentLng: number;
  lastUpdate: string;
}

interface LiveTrackingProps {
  orderId: string;
  customerLat: number;
  customerLng: number;
}

const LiveDeliveryTracking = ({ orderId, customerLat, customerLng }: LiveTrackingProps) => {
  const [agent, setAgent] = useState<DeliveryAgent | null>(null);
  const [distance, setDistance] = useState<number>(0);
  const [eta, setEta] = useState<number>(0);

  useEffect(() => {
    const simulateAgentMovement = () => {
      // Simulate delivery agent moving towards customer
      const baseAgent = {
        id: "agent-1",
        name: "Rahul Sharma",
        phone: "+91 98765 43210",
        currentLat: 21.3486 + (Math.random() - 0.5) * 0.01,
        currentLng: 74.8811 + (Math.random() - 0.5) * 0.01,
        lastUpdate: new Date().toISOString()
      };

      setAgent(baseAgent);

      // Calculate distance (simplified)
      const dist = Math.sqrt(
        Math.pow(baseAgent.currentLat - customerLat, 2) + 
        Math.pow(baseAgent.currentLng - customerLng, 2)
      ) * 111000; // Convert to meters

      setDistance(Math.round(dist));
      setEta(Math.round(dist / 300)); // Assume 300m/min speed
    };

    simulateAgentMovement();
    const interval = setInterval(simulateAgentMovement, 5000);
    return () => clearInterval(interval);
  }, [customerLat, customerLng]);

  if (!agent) return null;

  return (
    <Card className="border-green-200 bg-green-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-700">
          <Navigation className="h-5 w-5 animate-pulse" />
          Live Delivery Tracking
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold">{agent.name}</p>
            <p className="text-sm text-gray-600 flex items-center gap-1">
              <Phone className="h-3 w-3" />
              {agent.phone}
            </p>
          </div>
          <Badge className="bg-green-500 text-white animate-pulse">
            On the way
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-white rounded-lg">
            <MapPin className="h-6 w-6 text-blue-500 mx-auto mb-1" />
            <p className="text-sm font-semibold">{distance}m away</p>
            <p className="text-xs text-gray-500">Distance</p>
          </div>
          <div className="text-center p-3 bg-white rounded-lg">
            <Clock className="h-6 w-6 text-orange-500 mx-auto mb-1" />
            <p className="text-sm font-semibold">{eta} min</p>
            <p className="text-xs text-gray-500">ETA</p>
          </div>
        </div>

        <div className="bg-white p-3 rounded-lg">
          <p className="text-xs text-gray-500 mb-1">Last Location Update</p>
          <p className="text-sm font-mono">
            {agent.currentLat.toFixed(6)}, {agent.currentLng.toFixed(6)}
          </p>
          <p className="text-xs text-gray-400">
            {new Date(agent.lastUpdate).toLocaleTimeString()}
          </p>
        </div>

        <div className="w-full h-32 bg-gray-200 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <MapPin className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Live Map View</p>
            <p className="text-xs text-gray-500">Agent moving to your location</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LiveDeliveryTracking;