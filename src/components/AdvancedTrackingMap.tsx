import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle } from 'react-leaflet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Navigation, MapPin, Clock, Phone, Truck, Zap, Route, Eye } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface AdvancedTrackingMapProps {
  orderId: string;
  userType: 'customer' | 'delivery' | 'admin';
}

interface LocationPoint {
  lat: number;
  lng: number;
  timestamp: string;
  speed?: number;
  accuracy?: number;
}

interface TrackingData {
  agentLocation: LocationPoint;
  customerLocation: LocationPoint;
  route: LocationPoint[];
  estimatedArrival: number;
  distance: number;
  status: string;
  agentInfo: {
    name: string;
    phone: string;
    vehicle: string;
    rating: number;
  };
}

// Custom icons
const createCustomIcon = (emoji: string, color: string) => {
  return L.divIcon({
    html: `<div style="background: ${color}; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; font-size: 20px; border: 3px solid white; box-shadow: 0 2px 10px rgba(0,0,0,0.3);">${emoji}</div>`,
    className: 'custom-marker',
    iconSize: [40, 40],
    iconAnchor: [20, 20]
  });
};

export const AdvancedTrackingMap = ({ orderId, userType }: AdvancedTrackingMapProps) => {
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [viewMode, setViewMode] = useState<'satellite' | 'street' | 'terrain'>('street');
  const [showRoute, setShowRoute] = useState(true);
  const [showTrail, setShowTrail] = useState(true);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    // Simulate advanced tracking data
    const mockTrackingData: TrackingData = {
      agentLocation: {
        lat: 21.3099 + (Math.random() - 0.5) * 0.01,
        lng: 75.1178 + (Math.random() - 0.5) * 0.01,
        timestamp: new Date().toISOString(),
        speed: 25 + Math.random() * 10,
        accuracy: 5 + Math.random() * 10
      },
      customerLocation: {
        lat: 21.3150,
        lng: 75.1200,
        timestamp: new Date().toISOString()
      },
      route: [
        { lat: 21.3099, lng: 75.1178, timestamp: new Date(Date.now() - 300000).toISOString() },
        { lat: 21.3110, lng: 75.1185, timestamp: new Date(Date.now() - 240000).toISOString() },
        { lat: 21.3125, lng: 75.1192, timestamp: new Date(Date.now() - 180000).toISOString() },
        { lat: 21.3140, lng: 75.1198, timestamp: new Date(Date.now() - 120000).toISOString() },
        { lat: 21.3099 + (Math.random() - 0.5) * 0.01, lng: 75.1178 + (Math.random() - 0.5) * 0.01, timestamp: new Date().toISOString() }
      ],
      estimatedArrival: 8 + Math.random() * 5,
      distance: 1.2 + Math.random() * 0.5,
      status: 'on_the_way',
      agentInfo: {
        name: 'Rajesh Kumar',
        phone: '+91 98765 43210',
        vehicle: 'Bike - MH12AB1234',
        rating: 4.8
      }
    };

    setTrackingData(mockTrackingData);
    setLastUpdate(new Date().toLocaleTimeString());
    setIsLoading(false);

    // Update every 5 seconds for live effect
    const interval = setInterval(() => {
      setTrackingData(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          agentLocation: {
            ...prev.agentLocation,
            lat: prev.agentLocation.lat + (Math.random() - 0.5) * 0.0005,
            lng: prev.agentLocation.lng + (Math.random() - 0.5) * 0.0005,
            timestamp: new Date().toISOString(),
            speed: 20 + Math.random() * 15
          },
          route: [...prev.route.slice(-4), {
            lat: prev.agentLocation.lat + (Math.random() - 0.5) * 0.0005,
            lng: prev.agentLocation.lng + (Math.random() - 0.5) * 0.0005,
            timestamp: new Date().toISOString()
          }],
          estimatedArrival: Math.max(1, prev.estimatedArrival - 0.1),
          distance: Math.max(0.1, prev.distance - 0.02)
        };
      });
      setLastUpdate(new Date().toLocaleTimeString());
    }, 5000);

    return () => clearInterval(interval);
  }, [orderId]);

  const getTileLayer = () => {
    switch (viewMode) {
      case 'satellite':
        return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      case 'terrain':
        return 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
      default:
        return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    }
  };

  const getStatusInfo = (status: string) => {
    const configs = {
      assigned: { color: 'bg-yellow-500', text: 'Order Assigned', icon: '📋', progress: 20 },
      picked_up: { color: 'bg-blue-500', text: 'Order Picked Up', icon: '📦', progress: 40 },
      on_the_way: { color: 'bg-orange-500', text: 'On The Way', icon: '🚚', progress: 70 },
      nearby: { color: 'bg-green-500', text: 'Nearby (< 100m)', icon: '📍', progress: 90 },
      delivered: { color: 'bg-green-600', text: 'Delivered', icon: '✅', progress: 100 }
    };
    return configs[status as keyof typeof configs] || configs.assigned;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading advanced tracking...</p>
        </CardContent>
      </Card>
    );
  }

  if (!trackingData) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="font-semibold mb-2">Tracking Not Available</h3>
          <p className="text-gray-600">No delivery agent assigned yet.</p>
        </CardContent>
      </Card>
    );
  }

  const { agentLocation, customerLocation, route, estimatedArrival, distance, status, agentInfo } = trackingData;
  const statusInfo = getStatusInfo(status);

  return (
    <div className="space-y-4">
      {/* Enhanced Status Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Truck className="w-6 h-6 text-blue-500" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <div>
                <span className="text-lg">Advanced Live Tracking</span>
                <div className="text-sm text-gray-600">Order #{orderId}</div>
              </div>
            </div>
            <Badge className={`${statusInfo.color} text-white px-3 py-1`}>
              {statusInfo.icon} {statusInfo.text}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span>Delivery Progress</span>
              <span>{statusInfo.progress}%</span>
            </div>
            <Progress value={statusInfo.progress} className="h-2" />
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-3 bg-white rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-blue-600">{distance.toFixed(1)} km</div>
              <div className="text-xs text-gray-600">Distance</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-green-600">{Math.ceil(estimatedArrival)} min</div>
              <div className="text-xs text-gray-600">ETA</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-orange-600">{Math.round(agentLocation.speed || 0)} km/h</div>
              <div className="text-xs text-gray-600">Speed</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-purple-600">⭐ {agentInfo.rating}</div>
              <div className="text-xs text-gray-600">Rating</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg shadow-sm">
              <div className="text-xs font-bold text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mx-auto mb-1"></div>
                LIVE
              </div>
              <div className="text-xs text-gray-600">{lastUpdate}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Map Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2 justify-between items-center">
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={viewMode === 'street' ? 'default' : 'outline'}
                onClick={() => setViewMode('street')}
              >
                Street
              </Button>
              <Button
                size="sm"
                variant={viewMode === 'satellite' ? 'default' : 'outline'}
                onClick={() => setViewMode('satellite')}
              >
                Satellite
              </Button>
              <Button
                size="sm"
                variant={viewMode === 'terrain' ? 'default' : 'outline'}
                onClick={() => setViewMode('terrain')}
              >
                Terrain
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={showRoute ? 'default' : 'outline'}
                onClick={() => setShowRoute(!showRoute)}
              >
                <Route className="w-4 h-4 mr-1" />
                Route
              </Button>
              <Button
                size="sm"
                variant={showTrail ? 'default' : 'outline'}
                onClick={() => setShowTrail(!showTrail)}
              >
                <Eye className="w-4 h-4 mr-1" />
                Trail
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Map */}
      <Card>
        <CardContent className="p-0">
          <div className="h-[500px] w-full relative">
            <MapContainer
              ref={mapRef}
              center={[agentLocation.lat, agentLocation.lng]}
              zoom={16}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                url={getTileLayer()}
                attribution='&copy; OpenStreetMap contributors'
              />
              
              {/* Delivery Agent Marker with Animation */}
              <Marker 
                position={[agentLocation.lat, agentLocation.lng]}
                icon={createCustomIcon('🚚', '#3B82F6')}
              >
                <Popup>
                  <div className="text-center min-w-[200px]">
                    <div className="text-lg font-bold mb-2">🚚 {agentInfo.name}</div>
                    <div className="space-y-1 text-sm">
                      <div>📱 {agentInfo.phone}</div>
                      <div>🏍️ {agentInfo.vehicle}</div>
                      <div>⚡ {Math.round(agentLocation.speed || 0)} km/h</div>
                      <div>📍 Accuracy: {Math.round(agentLocation.accuracy || 5)}m</div>
                      <div>🕐 {new Date(agentLocation.timestamp).toLocaleTimeString()}</div>
                    </div>
                  </div>
                </Popup>
              </Marker>

              {/* Customer Marker */}
              <Marker 
                position={[customerLocation.lat, customerLocation.lng]}
                icon={createCustomIcon('🏠', '#10B981')}
              >
                <Popup>
                  <div className="text-center">
                    <div className="text-lg font-bold">🏠 Delivery Address</div>
                    <div className="text-sm text-gray-600">Your location</div>
                    <div className="text-xs text-gray-500 mt-2">
                      Distance: {distance.toFixed(1)} km<br/>
                      ETA: {Math.ceil(estimatedArrival)} minutes
                    </div>
                  </div>
                </Popup>
              </Marker>

              {/* Accuracy Circle */}
              <Circle
                center={[agentLocation.lat, agentLocation.lng]}
                radius={agentLocation.accuracy || 10}
                fillColor="blue"
                fillOpacity={0.1}
                color="blue"
                weight={1}
              />

              {/* Route Line */}
              {showRoute && (
                <Polyline
                  positions={[
                    [agentLocation.lat, agentLocation.lng],
                    [customerLocation.lat, customerLocation.lng]
                  ]}
                  color="#3B82F6"
                  weight={4}
                  opacity={0.8}
                  dashArray="10, 10"
                />
              )}

              {/* Movement Trail */}
              {showTrail && route.length > 1 && (
                <Polyline
                  positions={route.map(point => [point.lat, point.lng])}
                  color="#F59E0B"
                  weight={3}
                  opacity={0.6}
                />
              )}
            </MapContainer>

            {/* Floating Info Panel */}
            <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3 z-[1000]">
              <div className="text-sm space-y-1">
                <div className="font-semibold">Agent Info</div>
                <div>👤 {agentInfo.name}</div>
                <div>🏍️ {agentInfo.vehicle}</div>
                <div className="flex items-center">
                  ⭐ {agentInfo.rating} 
                  <span className="ml-1 text-xs text-gray-500">rating</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Action Buttons */}
      <Card>
        <CardContent className="p-4">
          {userType === 'customer' && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <Button className="bg-green-500 hover:bg-green-600">
                <Phone className="w-4 h-4 mr-2" />
                Call Agent
              </Button>
              <Button variant="outline">
                <Navigation className="w-4 h-4 mr-2" />
                Share Location
              </Button>
              <Button variant="outline">
                <Zap className="w-4 h-4 mr-2" />
                Emergency
              </Button>
              <Button variant="outline">
                <Clock className="w-4 h-4 mr-2" />
                Reschedule
              </Button>
            </div>
          )}

          {userType === 'delivery' && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              <Button className="bg-green-500 hover:bg-green-600">
                <MapPin className="w-4 h-4 mr-2" />
                Mark Delivered
              </Button>
              <Button variant="outline">
                <Phone className="w-4 h-4 mr-2" />
                Call Customer
              </Button>
              <Button variant="outline">
                <Navigation className="w-4 h-4 mr-2" />
                Get Directions
              </Button>
            </div>
          )}

          {userType === 'admin' && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <Button variant="outline">
                <Eye className="w-4 h-4 mr-2" />
                Monitor All
              </Button>
              <Button variant="outline">
                <Route className="w-4 h-4 mr-2" />
                Optimize Route
              </Button>
              <Button variant="outline">
                <Phone className="w-4 h-4 mr-2" />
                Contact Agent
              </Button>
              <Button variant="outline">
                <Zap className="w-4 h-4 mr-2" />
                Reassign
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};