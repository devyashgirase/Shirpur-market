import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Map, MapPin, Clock, Fuel, Navigation, Zap } from "lucide-react";

interface DeliveryStop {
  id: string;
  orderId: string;
  customerName: string;
  address: string;
  coordinates: { lat: number; lng: number };
  estimatedTime: number;
  priority: 'high' | 'medium' | 'low';
  timeWindow: string;
}

interface OptimizedRoute {
  id: string;
  agentName: string;
  stops: DeliveryStop[];
  totalDistance: number;
  estimatedDuration: number;
  fuelCost: number;
  efficiency: number;
}

const RouteOptimization = () => {
  const [routes] = useState<OptimizedRoute[]>([
    {
      id: "route-1",
      agentName: "Rahul Sharma",
      stops: [
        {
          id: "stop-1",
          orderId: "ORD-001",
          customerName: "Amit Kumar",
          address: "Shirpur Market Area",
          coordinates: { lat: 21.3486, lng: 74.8811 },
          estimatedTime: 15,
          priority: "high",
          timeWindow: "10:00-11:00 AM"
        },
        {
          id: "stop-2",
          orderId: "ORD-002",
          customerName: "Priya Patel",
          address: "Gandhi Chowk",
          coordinates: { lat: 21.3500, lng: 74.8825 },
          estimatedTime: 12,
          priority: "medium",
          timeWindow: "11:30-12:30 PM"
        },
        {
          id: "stop-3",
          orderId: "ORD-003",
          customerName: "Rajesh Singh",
          address: "Station Road",
          coordinates: { lat: 21.3520, lng: 74.8840 },
          estimatedTime: 18,
          priority: "low",
          timeWindow: "2:00-3:00 PM"
        }
      ],
      totalDistance: 12.5,
      estimatedDuration: 95,
      fuelCost: 85,
      efficiency: 92
    }
  ]);

  const [optimizing, setOptimizing] = useState(false);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const optimizeRoutes = () => {
    setOptimizing(true);
    setTimeout(() => {
      setOptimizing(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Map className="h-5 w-5" />
            Route Optimization
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Navigation className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">3</div>
              <p className="text-sm text-blue-600">Active Routes</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Clock className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">25%</div>
              <p className="text-sm text-green-600">Time Saved</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Fuel className="h-8 w-8 text-purple-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-600">₹340</div>
              <p className="text-sm text-purple-600">Fuel Savings</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <Zap className="h-8 w-8 text-orange-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-orange-600">92%</div>
              <p className="text-sm text-orange-600">Efficiency</p>
            </div>
          </div>

          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Optimized Routes</h3>
            <Button 
              onClick={optimizeRoutes}
              disabled={optimizing}
              className="bg-blue-500 hover:bg-blue-600"
            >
              {optimizing ? 'Optimizing...' : 'Re-optimize Routes'}
            </Button>
          </div>

          <div className="space-y-4">
            {routes.map((route) => (
              <div key={route.id} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">{route.agentName}</h4>
                    <p className="text-sm text-gray-600">Route ID: {route.id}</p>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-green-100 text-green-800">
                      {route.efficiency}% Efficient
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Total Distance</p>
                    <p className="font-semibold">{route.totalDistance} km</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Est. Duration</p>
                    <p className="font-semibold">{route.estimatedDuration} min</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Fuel Cost</p>
                    <p className="font-semibold">₹{route.fuelCost}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Stops</p>
                    <p className="font-semibold">{route.stops.length} deliveries</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h5 className="font-medium">Delivery Stops</h5>
                  {route.stops.map((stop, index) => (
                    <div key={stop.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium">{stop.customerName}</p>
                          <Badge className={getPriorityColor(stop.priority)}>
                            {stop.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {stop.address}
                        </p>
                      </div>
                      <div className="text-right text-sm">
                        <p className="font-medium">{stop.timeWindow}</p>
                        <p className="text-gray-600">{stop.estimatedTime} min</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 pt-3 border-t">
                  <Button variant="outline" size="sm">
                    View on Map
                  </Button>
                  <Button variant="outline" size="sm">
                    Send to Agent
                  </Button>
                  <Button variant="outline" size="sm">
                    Track Progress
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Route Optimization Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Optimization Priority</label>
              <select className="w-full p-2 border rounded-lg">
                <option value="time">Minimize Time</option>
                <option value="distance">Minimize Distance</option>
                <option value="fuel">Minimize Fuel Cost</option>
                <option value="balanced">Balanced Approach</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Vehicle Type</label>
              <select className="w-full p-2 border rounded-lg">
                <option value="bike">Motorcycle</option>
                <option value="auto">Auto Rickshaw</option>
                <option value="van">Delivery Van</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input type="checkbox" defaultChecked />
              <span className="text-sm">Consider traffic conditions</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" defaultChecked />
              <span className="text-sm">Respect delivery time windows</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" />
              <span className="text-sm">Allow route modifications during delivery</span>
            </label>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RouteOptimization;