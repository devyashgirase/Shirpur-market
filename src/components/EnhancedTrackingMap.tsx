import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, LayersControl } from 'react-leaflet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Navigation, MapPin, Clock, Phone, Truck, Zap, Map, Eye, 
  Layers, Maximize2, RefreshCw, AlertTriangle, CheckCircle,
  Timer, Fuel, Users, Activity, Settings, Share2
} from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface EnhancedTrackingMapProps {
  orderId: string;
  userType: 'customer' | 'delivery' | 'admin';
}

interface LocationPoint {
  lat: number;
  lng: number;
  timestamp: string;
  speed?: number;
  accuracy?: number;
  altitude?: number;
  heading?: number;
}

interface TrafficInfo {
  level: 'low' | 'medium' | 'high';
  delay: number;
  alternateRoute?: LocationPoint[];
}

interface WeatherInfo {
  condition: string;
  temperature: number;
  visibility: number;
  impact: 'none' | 'low' | 'medium' | 'high';
}

interface EnhancedTrackingData {
  agentLocation: LocationPoint;
  customerLocation: LocationPoint;
  route: LocationPoint[];
  optimizedRoute?: LocationPoint[];
  estimatedArrival: number;
  distance: number;
  status: string;
  agentInfo: {
    name: string;
    phone: string;
    vehicle: string;
    rating: number;
    photo?: string;
  };
  traffic: TrafficInfo;
  weather: WeatherInfo;
  deliveryHistory: LocationPoint[];
  geofences: Array<{
    center: LocationPoint;
    radius: number;
    type: 'pickup' | 'delivery' | 'restricted';
  }>;
}

// Enhanced custom icons with animations
const createAnimatedIcon = (emoji: string, color: string, isMoving: boolean = false) => {
  const animation = isMoving ? 'animation: pulse 2s infinite;' : '';
  return L.divIcon({
    html: `
      <div style="
        background: ${color}; 
        border-radius: 50%; 
        width: 50px; 
        height: 50px; 
        display: flex; 
        align-items: center; 
        justify-content: center; 
        font-size: 24px; 
        border: 4px solid white; 
        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        ${animation}
      ">
        ${emoji}
      </div>
      <style>
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
      </style>
    `,
    className: 'custom-animated-marker',
    iconSize: [50, 50],
    iconAnchor: [25, 25]
  });
};

export const EnhancedTrackingMap = ({ orderId, userType }: EnhancedTrackingMapProps) => {
  const [trackingData, setTrackingData] = useState<EnhancedTrackingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [viewMode, setViewMode] = useState<'satellite' | 'street' | 'terrain' | 'hybrid'>('street');
  const [showRoute, setShowRoute] = useState(true);
  const [showTrail, setShowTrail] = useState(true);
  const [showTraffic, setShowTraffic] = useState(true);
  const [showGeofences, setShowGeofences] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState('map');
  const mapRef = useRef<any>(null);

  useEffect(() => {
    // Enhanced mock tracking data with more realistic features
    const mockTrackingData: EnhancedTrackingData = {
      agentLocation: {
        lat: 21.3099 + (Math.random() - 0.5) * 0.01,
        lng: 75.1178 + (Math.random() - 0.5) * 0.01,
        timestamp: new Date().toISOString(),
        speed: 25 + Math.random() * 10,
        accuracy: 3 + Math.random() * 7,
        altitude: 450 + Math.random() * 20,
        heading: Math.random() * 360
      },
      customerLocation: {
        lat: 21.3150,
        lng: 75.1200,
        timestamp: new Date().toISOString()
      },
      route: generateRoutePoints(),
      optimizedRoute: generateOptimizedRoute(),
      estimatedArrival: 8 + Math.random() * 5,
      distance: 1.2 + Math.random() * 0.5,
      status: 'on_the_way',
      agentInfo: {
        name: 'Rajesh Kumar',
        phone: '+91 98765 43210',
        vehicle: 'Bike - MH12AB1234',
        rating: 4.8,
        photo: '/api/placeholder/40/40'
      },
      traffic: {
        level: 'medium',
        delay: 3,
        alternateRoute: generateAlternateRoute()
      },
      weather: {
        condition: 'Clear',
        temperature: 28,
        visibility: 10,
        impact: 'none'
      },
      deliveryHistory: generateDeliveryHistory(),
      geofences: [
        {
          center: { lat: 21.3099, lng: 75.1178, timestamp: new Date().toISOString() },
          radius: 100,
          type: 'pickup'
        },
        {
          center: { lat: 21.3150, lng: 75.1200, timestamp: new Date().toISOString() },
          radius: 50,
          type: 'delivery'
        }
      ]
    };

    setTrackingData(mockTrackingData);
    setLastUpdate(new Date().toLocaleTimeString());
    setIsLoading(false);

    // Enhanced real-time updates
    const interval = setInterval(() => {
      setTrackingData(prev => {
        if (!prev) return prev;
        
        const newLat = prev.agentLocation.lat + (Math.random() - 0.5) * 0.0003;
        const newLng = prev.agentLocation.lng + (Math.random() - 0.5) * 0.0003;
        
        return {
          ...prev,
          agentLocation: {
            ...prev.agentLocation,
            lat: newLat,
            lng: newLng,
            timestamp: new Date().toISOString(),
            speed: 20 + Math.random() * 15,
            heading: (prev.agentLocation.heading || 0) + (Math.random() - 0.5) * 30
          },
          route: [...prev.route.slice(-9), {
            lat: newLat,
            lng: newLng,
            timestamp: new Date().toISOString(),
            speed: 20 + Math.random() * 15
          }],
          estimatedArrival: Math.max(1, prev.estimatedArrival - 0.08),
          distance: Math.max(0.1, prev.distance - 0.015),
          traffic: {
            ...prev.traffic,
            level: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as any,
            delay: Math.random() * 5
          }
        };
      });
      setLastUpdate(new Date().toLocaleTimeString());
    }, 3000);

    return () => clearInterval(interval);
  }, [orderId]);

  // Helper functions for generating mock data
  const generateRoutePoints = (): LocationPoint[] => {
    const points: LocationPoint[] = [];
    const startLat = 21.3099;
    const startLng = 75.1178;
    const endLat = 21.3150;
    const endLng = 75.1200;
    
    for (let i = 0; i <= 10; i++) {
      const ratio = i / 10;
      points.push({
        lat: startLat + (endLat - startLat) * ratio + (Math.random() - 0.5) * 0.001,
        lng: startLng + (endLng - startLng) * ratio + (Math.random() - 0.5) * 0.001,
        timestamp: new Date(Date.now() - (10 - i) * 60000).toISOString(),
        speed: 20 + Math.random() * 10
      });
    }
    return points;
  };

  const generateOptimizedRoute = (): LocationPoint[] => {
    return generateRoutePoints().map(point => ({
      ...point,
      lat: point.lat + (Math.random() - 0.5) * 0.0005,
      lng: point.lng + (Math.random() - 0.5) * 0.0005
    }));
  };

  const generateAlternateRoute = (): LocationPoint[] => {
    return generateRoutePoints().map(point => ({
      ...point,
      lat: point.lat + (Math.random() - 0.5) * 0.002,
      lng: point.lng + (Math.random() - 0.5) * 0.002
    }));
  };

  const generateDeliveryHistory = (): LocationPoint[] => {
    const history: LocationPoint[] = [];
    for (let i = 0; i < 5; i++) {
      history.push({
        lat: 21.3099 + (Math.random() - 0.5) * 0.02,
        lng: 75.1178 + (Math.random() - 0.5) * 0.02,
        timestamp: new Date(Date.now() - i * 3600000).toISOString()
      });
    }
    return history;
  };

  const getTileLayer = () => {
    switch (viewMode) {
      case 'satellite':
        return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      case 'terrain':
        return 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
      case 'hybrid':
        return 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}';
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

  const getTrafficColor = (level: string) => {
    switch (level) {
      case 'low': return '#22C55E';
      case 'medium': return '#F59E0B';
      case 'high': return '#EF4444';
      default: return '#6B7280';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading enhanced tracking system...</p>
        </CardContent>
      </Card>
    );
  }

  if (!trackingData) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="font-semibold mb-2">Enhanced Tracking Not Available</h3>
          <p className="text-gray-600">No delivery agent assigned yet.</p>
        </CardContent>
      </Card>
    );
  }

  const { agentLocation, customerLocation, route, optimizedRoute, estimatedArrival, distance, status, agentInfo, traffic, weather } = trackingData;
  const statusInfo = getStatusInfo(status);

  return (
    <div className={`space-y-4 ${isFullscreen ? 'fixed inset-0 z-50 bg-white p-4' : ''}`}>
      {/* Enhanced Header with Real-time Stats */}
      <Card className="bg-gradient-to-r from-blue-50 via-purple-50 to-green-50">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Truck className="w-7 h-7 text-blue-500" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-pulse flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
              <div>
                <span className="text-xl font-bold">Enhanced Live Tracking</span>
                <div className="text-sm text-gray-600 flex items-center gap-2">
                  Order #{orderId} • {weather.condition} {weather.temperature}°C
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={`${statusInfo.color} text-white px-4 py-2`}>
                {statusInfo.icon} {statusInfo.text}
              </Badge>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsFullscreen(!isFullscreen)}
              >
                <Maximize2 className="w-4 h-4" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Enhanced Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium">Delivery Progress</span>
              <span className="font-bold">{statusInfo.progress}%</span>
            </div>
            <Progress value={statusInfo.progress} className="h-3" />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Order Placed</span>
              <span>Picked Up</span>
              <span>On Route</span>
              <span>Delivered</span>
            </div>
          </div>

          {/* Enhanced Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            <div className="text-center p-3 bg-white rounded-lg shadow-sm border-l-4 border-blue-500">
              <div className="text-xl font-bold text-blue-600">{distance.toFixed(1)} km</div>
              <div className="text-xs text-gray-600">Distance</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg shadow-sm border-l-4 border-green-500">
              <div className="text-xl font-bold text-green-600">{Math.ceil(estimatedArrival)} min</div>
              <div className="text-xs text-gray-600">ETA</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg shadow-sm border-l-4 border-orange-500">
              <div className="text-xl font-bold text-orange-600">{Math.round(agentLocation.speed || 0)}</div>
              <div className="text-xs text-gray-600">km/h</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg shadow-sm border-l-4 border-purple-500">
              <div className="text-xl font-bold text-purple-600">⭐ {agentInfo.rating}</div>
              <div className="text-xs text-gray-600">Rating</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg shadow-sm border-l-4 border-red-500">
              <div className="text-xl font-bold" style={{ color: getTrafficColor(traffic.level) }}>
                {traffic.level.toUpperCase()}
              </div>
              <div className="text-xs text-gray-600">Traffic</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg shadow-sm border-l-4 border-green-400">
              <div className="text-xs font-bold text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mx-auto mb-1"></div>
                LIVE
              </div>
              <div className="text-xs text-gray-600">{lastUpdate}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Tabs Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="map">🗺️ Map</TabsTrigger>
          <TabsTrigger value="route">🛣️ Route</TabsTrigger>
          <TabsTrigger value="agent">👤 Agent</TabsTrigger>
          <TabsTrigger value="analytics">📊 Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="map" className="space-y-4">
          {/* Enhanced Map Controls */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-2 justify-between items-center">
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={viewMode === 'street' ? 'default' : 'outline'}
                    onClick={() => setViewMode('street')}
                  >
                    🗺️ Street
                  </Button>
                  <Button
                    size="sm"
                    variant={viewMode === 'satellite' ? 'default' : 'outline'}
                    onClick={() => setViewMode('satellite')}
                  >
                    🛰️ Satellite
                  </Button>
                  <Button
                    size="sm"
                    variant={viewMode === 'terrain' ? 'default' : 'outline'}
                    onClick={() => setViewMode('terrain')}
                  >
                    🏔️ Terrain
                  </Button>
                  <Button
                    size="sm"
                    variant={viewMode === 'hybrid' ? 'default' : 'outline'}
                    onClick={() => setViewMode('hybrid')}
                  >
                    🌐 Hybrid
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={showRoute ? 'default' : 'outline'}
                    onClick={() => setShowRoute(!showRoute)}
                  >
                    <Map className="w-4 h-4 mr-1" />
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
                  <Button
                    size="sm"
                    variant={showTraffic ? 'default' : 'outline'}
                    onClick={() => setShowTraffic(!showTraffic)}
                  >
                    <Activity className="w-4 h-4 mr-1" />
                    Traffic
                  </Button>
                  <Button
                    size="sm"
                    variant={showGeofences ? 'default' : 'outline'}
                    onClick={() => setShowGeofences(!showGeofences)}
                  >
                    <Settings className="w-4 h-4 mr-1" />
                    Zones
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Map with Multiple Layers */}
          <Card>
            <CardContent className="p-0">
              <div className="h-[600px] w-full relative">
                <MapContainer
                  ref={mapRef}
                  center={[agentLocation.lat, agentLocation.lng]}
                  zoom={16}
                  style={{ height: '100%', width: '100%' }}
                >
                  <LayersControl position="topright">
                    <LayersControl.BaseLayer checked name="Street Map">
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; OpenStreetMap contributors'
                      />
                    </LayersControl.BaseLayer>
                    <LayersControl.BaseLayer name="Satellite">
                      <TileLayer
                        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                        attribution='&copy; Esri'
                      />
                    </LayersControl.BaseLayer>
                  </LayersControl>
                  
                  {/* Enhanced Delivery Agent Marker */}
                  <Marker 
                    position={[agentLocation.lat, agentLocation.lng]}
                    icon={createAnimatedIcon('🚚', '#3B82F6', true)}
                  >
                    <Popup>
                      <div className="text-center min-w-[250px]">
                        <div className="text-lg font-bold mb-3 flex items-center justify-center gap-2">
                          🚚 {agentInfo.name}
                          <Badge className="bg-green-100 text-green-800">Online</Badge>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>📱 Phone:</span>
                            <span className="font-medium">{agentInfo.phone}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>🏍️ Vehicle:</span>
                            <span className="font-medium">{agentInfo.vehicle}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>⚡ Speed:</span>
                            <span className="font-medium">{Math.round(agentLocation.speed || 0)} km/h</span>
                          </div>
                          <div className="flex justify-between">
                            <span>📍 Accuracy:</span>
                            <span className="font-medium">{Math.round(agentLocation.accuracy || 5)}m</span>
                          </div>
                          <div className="flex justify-between">
                            <span>🧭 Heading:</span>
                            <span className="font-medium">{Math.round(agentLocation.heading || 0)}°</span>
                          </div>
                          <div className="flex justify-between">
                            <span>🕐 Updated:</span>
                            <span className="font-medium">{new Date(agentLocation.timestamp).toLocaleTimeString()}</span>
                          </div>
                        </div>
                      </div>
                    </Popup>
                  </Marker>

                  {/* Enhanced Customer Marker */}
                  <Marker 
                    position={[customerLocation.lat, customerLocation.lng]}
                    icon={createAnimatedIcon('🏠', '#10B981')}
                  >
                    <Popup>
                      <div className="text-center min-w-[200px]">
                        <div className="text-lg font-bold mb-2">🏠 Delivery Address</div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div>📍 Your delivery location</div>
                          <div>📏 Distance: {distance.toFixed(1)} km</div>
                          <div>⏱️ ETA: {Math.ceil(estimatedArrival)} minutes</div>
                          <div>🚦 Traffic: {traffic.level} (+{traffic.delay.toFixed(0)} min)</div>
                        </div>
                      </div>
                    </Popup>
                  </Marker>

                  {/* Enhanced Accuracy Circle */}
                  <Circle
                    center={[agentLocation.lat, agentLocation.lng]}
                    radius={agentLocation.accuracy || 10}
                    fillColor="blue"
                    fillOpacity={0.1}
                    color="blue"
                    weight={2}
                    dashArray="5, 5"
                  />

                  {/* Main Route */}
                  {showRoute && (
                    <Polyline
                      positions={[
                        [agentLocation.lat, agentLocation.lng],
                        [customerLocation.lat, customerLocation.lng]
                      ]}
                      color="#3B82F6"
                      weight={6}
                      opacity={0.8}
                      dashArray="15, 10"
                    />
                  )}

                  {/* Optimized Route */}
                  {showRoute && optimizedRoute && (
                    <Polyline
                      positions={optimizedRoute.map(point => [point.lat, point.lng])}
                      color="#10B981"
                      weight={4}
                      opacity={0.6}
                      dashArray="5, 5"
                    />
                  )}

                  {/* Traffic-aware Alternate Route */}
                  {showTraffic && traffic.alternateRoute && (
                    <Polyline
                      positions={traffic.alternateRoute.map(point => [point.lat, point.lng])}
                      color={getTrafficColor(traffic.level)}
                      weight={3}
                      opacity={0.5}
                      dashArray="10, 5"
                    />
                  )}

                  {/* Movement Trail with Speed Visualization */}
                  {showTrail && route.length > 1 && (
                    <Polyline
                      positions={route.map(point => [point.lat, point.lng])}
                      color="#F59E0B"
                      weight={4}
                      opacity={0.7}
                    />
                  )}

                  {/* Geofences */}
                  {showGeofences && trackingData.geofences.map((geofence, index) => (
                    <Circle
                      key={index}
                      center={[geofence.center.lat, geofence.center.lng]}
                      radius={geofence.radius}
                      fillColor={geofence.type === 'delivery' ? 'green' : geofence.type === 'pickup' ? 'blue' : 'red'}
                      fillOpacity={0.2}
                      color={geofence.type === 'delivery' ? 'green' : geofence.type === 'pickup' ? 'blue' : 'red'}
                      weight={2}
                      dashArray="10, 5"
                    />
                  ))}
                </MapContainer>

                {/* Enhanced Floating Panels */}
                <div className="absolute top-4 right-4 space-y-2 z-[1000]">
                  {/* Agent Info Panel */}
                  <div className="bg-white rounded-lg shadow-lg p-3 min-w-[200px]">
                    <div className="text-sm space-y-2">
                      <div className="font-semibold flex items-center gap-2">
                        👤 Agent Details
                        <Badge className="bg-green-100 text-green-800 text-xs">Active</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {agentInfo.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium">{agentInfo.name}</div>
                          <div className="text-xs text-gray-500">{agentInfo.vehicle}</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>⭐ {agentInfo.rating}</span>
                        <span className="text-xs text-gray-500">rating</span>
                      </div>
                    </div>
                  </div>

                  {/* Weather & Traffic Panel */}
                  <div className="bg-white rounded-lg shadow-lg p-3">
                    <div className="text-sm space-y-2">
                      <div className="font-semibold">🌤️ Conditions</div>
                      <div className="flex justify-between">
                        <span>Weather:</span>
                        <span>{weather.condition} {weather.temperature}°C</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Traffic:</span>
                        <span style={{ color: getTrafficColor(traffic.level) }}>
                          {traffic.level.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Delay:</span>
                        <span>+{traffic.delay.toFixed(0)} min</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Speed & Direction Indicator */}
                <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 z-[1000]">
                  <div className="text-sm space-y-1">
                    <div className="font-semibold">🚚 Vehicle Status</div>
                    <div className="flex items-center gap-2">
                      <span>Speed:</span>
                      <span className="font-bold text-blue-600">{Math.round(agentLocation.speed || 0)} km/h</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>Direction:</span>
                      <span className="font-bold text-green-600">{Math.round(agentLocation.heading || 0)}°</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="route" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Map className="w-5 h-5" />
                Route Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="text-lg font-bold text-blue-600">Current Route</div>
                  <div className="text-sm text-gray-600">
                    Distance: {distance.toFixed(1)} km<br/>
                    ETA: {Math.ceil(estimatedArrival)} min<br/>
                    Traffic Impact: +{traffic.delay.toFixed(0)} min
                  </div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-lg font-bold text-green-600">Optimized Route</div>
                  <div className="text-sm text-gray-600">
                    Distance: {(distance * 0.9).toFixed(1)} km<br/>
                    ETA: {Math.ceil(estimatedArrival * 0.85)} min<br/>
                    Savings: {Math.ceil(estimatedArrival * 0.15)} min
                  </div>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg">
                  <div className="text-lg font-bold text-orange-600">Alternate Route</div>
                  <div className="text-sm text-gray-600">
                    Distance: {(distance * 1.1).toFixed(1)} km<br/>
                    ETA: {Math.ceil(estimatedArrival * 1.2)} min<br/>
                    Avoids: Heavy traffic
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="agent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Agent Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {agentInfo.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="text-xl font-bold">{agentInfo.name}</div>
                  <div className="text-gray-600">{agentInfo.phone}</div>
                  <div className="text-gray-600">{agentInfo.vehicle}</div>
                  <div className="flex items-center gap-2 mt-2">
                    <span>⭐ {agentInfo.rating}</span>
                    <Badge className="bg-green-100 text-green-800">Verified</Badge>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-blue-50 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600">{Math.round(agentLocation.speed || 0)}</div>
                  <div className="text-sm text-gray-600">Current Speed (km/h)</div>
                </div>
                <div className="p-3 bg-green-50 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">{Math.round(agentLocation.accuracy || 5)}</div>
                  <div className="text-sm text-gray-600">GPS Accuracy (m)</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Delivery Analytics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-purple-50 rounded-lg text-center">
                  <div className="text-2xl font-bold text-purple-600">{Math.round(distance * 60)}</div>
                  <div className="text-sm text-gray-600">Fuel Efficiency</div>
                </div>
                <div className="p-3 bg-indigo-50 rounded-lg text-center">
                  <div className="text-2xl font-bold text-indigo-600">{weather.visibility}</div>
                  <div className="text-sm text-gray-600">Visibility (km)</div>
                </div>
                <div className="p-3 bg-pink-50 rounded-lg text-center">
                  <div className="text-2xl font-bold text-pink-600">{agentLocation.altitude?.toFixed(0) || 450}</div>
                  <div className="text-sm text-gray-600">Altitude (m)</div>
                </div>
                <div className="p-3 bg-cyan-50 rounded-lg text-center">
                  <div className="text-2xl font-bold text-cyan-600">{trackingData.deliveryHistory.length}</div>
                  <div className="text-sm text-gray-600">Recent Deliveries</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Enhanced Action Buttons */}
      <Card>
        <CardContent className="p-4">
          {userType === 'customer' && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              <Button className="bg-green-500 hover:bg-green-600">
                <Phone className="w-4 h-4 mr-2" />
                Call Agent
              </Button>
              <Button variant="outline">
                <Navigation className="w-4 h-4 mr-2" />
                Share Location
              </Button>
              <Button variant="outline">
                <Share2 className="w-4 h-4 mr-2" />
                Share Tracking
              </Button>
              <Button variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Report Issue
              </Button>
            </div>
          )}

          {userType === 'delivery' && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <Button className="bg-green-500 hover:bg-green-600">
                <CheckCircle className="w-4 h-4 mr-2" />
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
              <Button variant="outline">
                <Timer className="w-4 h-4 mr-2" />
                Update ETA
              </Button>
            </div>
          )}

          {userType === 'admin' && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              <Button variant="outline">
                <Eye className="w-4 h-4 mr-2" />
                Monitor All
              </Button>
              <Button variant="outline">
                <Map className="w-4 h-4 mr-2" />
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
              <Button variant="outline">
                <Activity className="w-4 h-4 mr-2" />
                Analytics
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};