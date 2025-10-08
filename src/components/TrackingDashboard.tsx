import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  MapPin, Clock, Truck, Activity, AlertTriangle, CheckCircle,
  Navigation, Phone, Share2, RefreshCw, Settings, Eye,
  TrendingUp, Zap, Fuel, Users, Map, Layers
} from 'lucide-react';
import { EnhancedTrackingMap } from './EnhancedTrackingMap';
import { EnhancedTrackingService, EnhancedTrackingUpdate } from '@/lib/enhancedTrackingService';
import { realTimeRouteAnalysis, type RouteAnalysis } from '@/lib/realTimeRouteAnalysis';

interface TrackingDashboardProps {
  orderId: string;
  userType: 'customer' | 'delivery' | 'admin';
}

export const TrackingDashboard = ({ orderId, userType }: TrackingDashboardProps) => {
  const [trackingData, setTrackingData] = useState<EnhancedTrackingUpdate | null>(null);
  const [routeAnalysis, setRouteAnalysis] = useState<RouteAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeView, setActiveView] = useState('overview');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [agentLocation, setAgentLocation] = useState({ lat: 21.3486, lng: 74.8811 });
  const [customerLocation, setCustomerLocation] = useState({ lat: 21.3099, lng: 75.1178 });

  useEffect(() => {
    // Initialize enhanced tracking
    EnhancedTrackingService.initializeTracking();

    // Get real customer GPS location and start tracking
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const customerLoc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: Date.now()
          };
          setCustomerLocation({ lat: customerLoc.lat, lng: customerLoc.lng });
          EnhancedTrackingService.startOrderTracking(orderId, 'agent-001', customerLoc);
        },
        (error) => {
          console.error('GPS error:', error);
          // Fallback to default Shirpur location
          const customerLoc = {
            lat: 21.3150,
            lng: 75.1200,
            accuracy: 10,
            timestamp: Date.now()
          };
          setCustomerLocation({ lat: customerLoc.lat, lng: customerLoc.lng });
          EnhancedTrackingService.startOrderTracking(orderId, 'agent-001', customerLoc);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    } else {
      // Fallback if geolocation not supported
      const customerLoc = {
        lat: 21.3150,
        lng: 75.1200,
        accuracy: 10,
        timestamp: Date.now()
      };
      setCustomerLocation({ lat: customerLoc.lat, lng: customerLoc.lng });
      EnhancedTrackingService.startOrderTracking(orderId, 'agent-001', customerLoc);
    }

    // Start real-time route analysis
    realTimeRouteAnalysis.startRealTimeUpdates(
      orderId,
      () => agentLocation,
      () => customerLocation,
      (analysis) => setRouteAnalysis(analysis)
    );

    // Subscribe to updates
    const handleTrackingUpdate = (data: { orderId: string; data: EnhancedTrackingUpdate }) => {
      if (data.orderId === orderId) {
        setTrackingData(data.data);
        setIsLoading(false);
      }
    };

    EnhancedTrackingService.subscribe('trackingUpdate', handleTrackingUpdate);
    EnhancedTrackingService.subscribe('trackingStarted', handleTrackingUpdate);

    // Initial data load
    const initialData = EnhancedTrackingService.getEnhancedTrackingData(orderId);
    if (initialData) {
      setTrackingData(initialData);
      setIsLoading(false);
    }

    return () => {
      EnhancedTrackingService.unsubscribe('trackingUpdate', handleTrackingUpdate);
      EnhancedTrackingService.unsubscribe('trackingStarted', handleTrackingUpdate);
      realTimeRouteAnalysis.stopRealTimeUpdates();
    };
  }, [orderId]);

  const getStatusColor = (status: string) => {
    const colors = {
      assigned: 'bg-yellow-500',
      picked_up: 'bg-blue-500',
      on_the_way: 'bg-orange-500',
      nearby: 'bg-green-500',
      delivered: 'bg-green-600',
      delayed: 'bg-red-500',
      rerouting: 'bg-purple-500'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-500';
  };

  const getStatusProgress = (status: string) => {
    const progress = {
      assigned: 20,
      picked_up: 40,
      on_the_way: 70,
      nearby: 90,
      delivered: 100,
      delayed: 60,
      rerouting: 50
    };
    return progress[status as keyof typeof progress] || 0;
  };

  const getTrafficColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-lg font-medium">Initializing Advanced Tracking...</p>
          <p className="text-sm text-gray-600">Setting up real-time monitoring</p>
        </div>
      </div>
    );
  }

  if (!trackingData) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Tracking Unavailable</h3>
          <p className="text-gray-600">Unable to load tracking data for this order.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Key Metrics */}
      <Card className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold flex items-center gap-3">
                <div className="relative">
                  <Truck className="w-8 h-8 text-blue-600" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
                </div>
                Advanced Delivery Tracking
              </CardTitle>
              <p className="text-gray-600 mt-1">
                Order #{orderId} • Real-time monitoring with AI insights
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge className={`${getStatusColor(trackingData.status)} text-white px-4 py-2 text-sm`}>
                {trackingData.status.replace('_', ' ').toUpperCase()}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={autoRefresh ? 'bg-green-50 border-green-200' : ''}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
                Auto Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">Delivery Progress</span>
              <span className="font-bold">{getStatusProgress(trackingData.status)}%</span>
            </div>
            <Progress value={getStatusProgress(trackingData.status)} className="h-3" />
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>Assigned</span>
              <span>Picked Up</span>
              <span>En Route</span>
              <span>Nearby</span>
              <span>Delivered</span>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-blue-500">
              <div className="text-2xl font-bold text-blue-600">{routeAnalysis ? routeAnalysis.distance.toFixed(1) : trackingData.distance.toFixed(1)} km</div>
              <div className="text-sm text-gray-600">Real Distance</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-green-500">
              <div className="text-2xl font-bold text-green-600">{routeAnalysis ? routeAnalysis.estimatedArrival : formatTime(trackingData.estimatedArrival)}</div>
              <div className="text-sm text-gray-600">Live ETA</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-orange-500">
              <div className="text-2xl font-bold text-orange-600">{Math.round(trackingData.agentLocation.speed || 0)}</div>
              <div className="text-sm text-gray-600">Speed (km/h)</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-purple-500">
              <div className="text-2xl font-bold text-purple-600">{trackingData.analytics.efficiency.toFixed(0)}%</div>
              <div className="text-sm text-gray-600">Efficiency</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-red-500">
              <div className={`text-2xl font-bold ${getTrafficColor(trackingData.traffic.level)}`}>
                {trackingData.traffic.level.toUpperCase()}
              </div>
              <div className="text-sm text-gray-600">Traffic</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-indigo-500">
              <div className="text-2xl font-bold text-indigo-600">{trackingData.weather.temperature.toFixed(0)}°C</div>
              <div className="text-sm text-gray-600">{trackingData.weather.condition}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerts Section */}
      {trackingData.alerts.length > 0 && (
        <Card className="border-l-4 border-yellow-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-700">
              <AlertTriangle className="w-5 h-5" />
              Active Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {trackingData.alerts.slice(-3).map((alert, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                  <div className={`w-2 h-2 rounded-full ${
                    alert.severity === 'high' ? 'bg-red-500' : 
                    alert.severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                  }`}></div>
                  <div className="flex-1">
                    <p className="font-medium">{alert.message}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {alert.severity}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeView} onValueChange={setActiveView}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">📊 Overview</TabsTrigger>
          <TabsTrigger value="map">🗺️ Live Map</TabsTrigger>
          <TabsTrigger value="analytics">📈 Analytics</TabsTrigger>
          <TabsTrigger value="agent">👤 Agent Info</TabsTrigger>
          <TabsTrigger value="history">📋 History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Route Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Map className="w-5 h-5" />
                  Route Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-lg font-bold text-blue-600">{trackingData.analytics.totalDistance.toFixed(1)} km</div>
                    <div className="text-sm text-gray-600">Total Distance</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-lg font-bold text-green-600">{formatTime(trackingData.analytics.estimatedTime)}</div>
                    <div className="text-sm text-gray-600">Est. Time</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Fuel Consumption:</span>
                    <span className="font-medium">{trackingData.analytics.fuelConsumption.toFixed(2)}L</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Carbon Footprint:</span>
                    <span className="font-medium">{trackingData.analytics.carbonFootprint.toFixed(2)} kg CO₂</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Route Efficiency:</span>
                    <span className="font-medium">{trackingData.analytics.efficiency.toFixed(0)}%</span>
                  </div>
                </div>

                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="font-medium text-green-800 mb-2">Optimization Savings</div>
                  <div className="text-sm space-y-1">
                    <div>Time: {formatTime(trackingData.analytics.optimizationSavings.time)}</div>
                    <div>Distance: {trackingData.analytics.optimizationSavings.distance.toFixed(1)} km</div>
                    <div>Fuel: {trackingData.analytics.optimizationSavings.fuel.toFixed(2)}L</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Environmental Conditions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Environmental Conditions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-lg font-bold text-blue-600">{trackingData.weather.temperature.toFixed(0)}°C</div>
                    <div className="text-sm text-gray-600">Temperature</div>
                  </div>
                  <div className="text-center p-3 bg-cyan-50 rounded-lg">
                    <div className="text-lg font-bold text-cyan-600">{trackingData.weather.humidity.toFixed(0)}%</div>
                    <div className="text-sm text-gray-600">Humidity</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Condition:</span>
                    <span className="font-medium">{trackingData.weather.condition}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Visibility:</span>
                    <span className="font-medium">{trackingData.weather.visibility.toFixed(1)} km</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Wind Speed:</span>
                    <span className="font-medium">{trackingData.weather.windSpeed.toFixed(1)} km/h</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Impact:</span>
                    <Badge variant={trackingData.weather.impact === 'none' ? 'default' : 'destructive'}>
                      {trackingData.weather.impact}
                    </Badge>
                  </div>
                </div>

                <div className="p-3 bg-orange-50 rounded-lg">
                  <div className="font-medium text-orange-800 mb-2">Traffic Status</div>
                  <div className="flex justify-between items-center">
                    <span>Level:</span>
                    <Badge className={`${
                      trackingData.traffic.level === 'low' ? 'bg-green-100 text-green-800' :
                      trackingData.traffic.level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {trackingData.traffic.level.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span>Delay:</span>
                    <span className="font-medium">+{trackingData.traffic.delay.toFixed(0)} min</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="map">
          <EnhancedTrackingMap orderId={orderId} userType={userType} />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>Average Speed</span>
                      <span className="font-medium">{trackingData.metrics.averageSpeed.toFixed(1)} km/h</span>
                    </div>
                    <Progress value={(trackingData.metrics.averageSpeed / 50) * 100} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>Route Efficiency</span>
                      <span className="font-medium">{trackingData.analytics.efficiency.toFixed(0)}%</span>
                    </div>
                    <Progress value={trackingData.analytics.efficiency} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>On-Time Performance</span>
                      <span className="font-medium">{trackingData.metrics.onTimePerformance.toFixed(0)}%</span>
                    </div>
                    <Progress value={trackingData.metrics.onTimePerformance} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>Customer Satisfaction</span>
                      <span className="font-medium">{trackingData.metrics.customerSatisfaction.toFixed(1)}/5.0</span>
                    </div>
                    <Progress value={(trackingData.metrics.customerSatisfaction / 5) * 100} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Delivery Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-lg font-bold text-purple-600">{trackingData.metrics.stopDuration.toFixed(1)}</div>
                    <div className="text-sm text-gray-600">Stop Duration (min)</div>
                  </div>
                  <div className="text-center p-3 bg-indigo-50 rounded-lg">
                    <div className="text-lg font-bold text-indigo-600">{trackingData.metrics.routeDeviation.toFixed(1)}%</div>
                    <div className="text-sm text-gray-600">Route Deviation</div>
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="font-medium mb-2">AI Recommendations</div>
                  <ul className="text-sm space-y-1 text-gray-600">
                    <li>• Consider alternate route to avoid traffic</li>
                    <li>• Weather conditions are favorable</li>
                    <li>• Estimated arrival within time window</li>
                    <li>• Fuel efficiency is optimal</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="agent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Delivery Agent Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                  R
                </div>
                <div className="flex-1">
                  <div className="text-2xl font-bold">Rajesh Kumar</div>
                  <div className="text-gray-600">+91 98765 43210</div>
                  <div className="text-gray-600">Bike - MH12AB1234</div>
                  <div className="flex items-center gap-2 mt-2">
                    <span>⭐ 4.8 Rating</span>
                    <Badge className="bg-green-100 text-green-800">Verified</Badge>
                    <Badge className="bg-blue-100 text-blue-800">Premium</Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-xl font-bold text-blue-600">{Math.round(trackingData.agentLocation.speed || 0)}</div>
                  <div className="text-sm text-gray-600">Current Speed</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-xl font-bold text-green-600">{Math.round(trackingData.agentLocation.accuracy || 5)}</div>
                  <div className="text-sm text-gray-600">GPS Accuracy (m)</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-xl font-bold text-purple-600">{Math.round(trackingData.agentLocation.heading || 0)}°</div>
                  <div className="text-sm text-gray-600">Heading</div>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <div className="text-xl font-bold text-orange-600">{trackingData.agentLocation.altitude?.toFixed(0) || 450}</div>
                  <div className="text-sm text-gray-600">Altitude (m)</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Delivery Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { time: '10:30 AM', status: 'Order Assigned', icon: '📋', color: 'bg-yellow-500' },
                  { time: '10:45 AM', status: 'Agent En Route to Pickup', icon: '🚚', color: 'bg-blue-500' },
                  { time: '11:15 AM', status: 'Order Picked Up', icon: '📦', color: 'bg-green-500' },
                  { time: '11:20 AM', status: 'On The Way to Customer', icon: '🛣️', color: 'bg-orange-500' },
                  { time: 'Now', status: 'Live Tracking Active', icon: '📍', color: 'bg-green-600' }
                ].map((event, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className={`w-10 h-10 ${event.color} rounded-full flex items-center justify-center text-white font-bold`}>
                      {event.icon}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{event.status}</div>
                      <div className="text-sm text-gray-600">{event.time}</div>
                    </div>
                    {index < 4 && <CheckCircle className="w-5 h-5 text-green-500" />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <Card>
        <CardContent className="p-4">
          {userType === 'customer' && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
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
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </Button>
              <Button variant="outline">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Report Issue
              </Button>
            </div>
          )}

          {userType === 'delivery' && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button 
                className="bg-green-500 hover:bg-green-600"
                onClick={() => {
                  // Trigger OTP verification modal
                  const event = new CustomEvent('showOTPVerification', {
                    detail: { orderId, customerPhone: '9876543210' }
                  });
                  window.dispatchEvent(event);
                }}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Mark Delivered (OTP)
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
                <Settings className="w-4 h-4 mr-2" />
                Update Status
              </Button>
            </div>
          )}

          {userType === 'admin' && (
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
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
                <TrendingUp className="w-4 h-4 mr-2" />
                Analytics
              </Button>
              <Button variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};