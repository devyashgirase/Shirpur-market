import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MapPin, Truck, Users, Activity, Navigation, 
  Zap, Route, Eye, Settings, TrendingUp 
} from 'lucide-react';
import { TrackingDashboard } from '@/components/TrackingDashboard';
import { EnhancedTrackingMap } from '@/components/EnhancedTrackingMap';

const TrackingDemo = () => {
  const [selectedUserType, setSelectedUserType] = useState<'customer' | 'delivery' | 'admin'>('customer');
  const [demoOrderId] = useState('ORD-DEMO-001');

  const userTypeConfigs = {
    customer: {
      title: 'Customer Tracking Experience',
      description: 'Real-time order tracking with live GPS updates',
      color: 'bg-blue-500',
      icon: Users
    },
    delivery: {
      title: 'Delivery Partner Dashboard',
      description: 'Advanced route optimization and delivery management',
      color: 'bg-green-500',
      icon: Truck
    },
    admin: {
      title: 'Admin Control Center',
      description: 'Comprehensive monitoring and analytics dashboard',
      color: 'bg-purple-500',
      icon: Activity
    }
  };

  const features = [
    {
      icon: MapPin,
      title: 'Real-time GPS Tracking',
      description: 'Live location updates with 3-5 meter accuracy',
      color: 'text-blue-600'
    },
    {
      icon: Route,
      title: 'AI Route Optimization',
      description: 'Smart routing with traffic analysis and alternate paths',
      color: 'text-green-600'
    },
    {
      icon: Activity,
      title: 'Traffic & Weather Integration',
      description: 'Real-time conditions affecting delivery times',
      color: 'text-orange-600'
    },
    {
      icon: Zap,
      title: 'Geofencing & Alerts',
      description: 'Automated notifications for pickup and delivery zones',
      color: 'text-purple-600'
    },
    {
      icon: TrendingUp,
      title: 'Performance Analytics',
      description: 'Detailed metrics on speed, efficiency, and satisfaction',
      color: 'text-indigo-600'
    },
    {
      icon: Eye,
      title: 'Multi-layer Visualization',
      description: 'Street, satellite, terrain, and hybrid map views',
      color: 'text-pink-600'
    }
  ];

  const currentConfig = userTypeConfigs[selectedUserType];
  const ConfigIcon = currentConfig.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card className="bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 text-white">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold mb-2">
              🚀 Enhanced Tracking System Demo
            </CardTitle>
            <p className="text-blue-100 text-lg">
              Advanced delivery tracking with AI-powered route optimization and real-time analytics
            </p>
          </CardHeader>
        </Card>

        {/* User Type Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-6 h-6" />
              Select User Experience
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(userTypeConfigs).map(([type, config]) => {
                const Icon = config.icon;
                return (
                  <Button
                    key={type}
                    variant={selectedUserType === type ? 'default' : 'outline'}
                    className={`h-auto p-4 flex flex-col items-center gap-3 ${
                      selectedUserType === type ? config.color : ''
                    }`}
                    onClick={() => setSelectedUserType(type as any)}
                  >
                    <Icon className="w-8 h-8" />
                    <div className="text-center">
                      <div className="font-semibold">{config.title}</div>
                      <div className="text-sm opacity-80">{config.description}</div>
                    </div>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Features Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-6 h-6" />
              Advanced Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={index} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                    <Icon className={`w-6 h-6 ${feature.color} flex-shrink-0 mt-1`} />
                    <div>
                      <div className="font-semibold mb-1">{feature.title}</div>
                      <div className="text-sm text-gray-600">{feature.description}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Current Experience */}
        <Card className="bg-gradient-to-r from-gray-50 to-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <ConfigIcon className={`w-7 h-7 text-white p-1 rounded ${currentConfig.color}`} />
              {currentConfig.title}
              <Badge className="bg-green-500 text-white animate-pulse">
                🔴 LIVE DEMO
              </Badge>
            </CardTitle>
            <p className="text-gray-600">{currentConfig.description}</p>
          </CardHeader>
        </Card>

        {/* Demo Tabs */}
        <Tabs defaultValue="dashboard" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="dashboard">📊 Full Dashboard</TabsTrigger>
            <TabsTrigger value="map">🗺️ Map Only</TabsTrigger>
            <TabsTrigger value="features">⚡ Feature Showcase</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Complete Tracking Dashboard - {selectedUserType.charAt(0).toUpperCase() + selectedUserType.slice(1)} View
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <TrackingDashboard orderId={demoOrderId} userType={selectedUserType} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="map" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Enhanced Map View - {selectedUserType.charAt(0).toUpperCase() + selectedUserType.slice(1)} Experience
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <EnhancedTrackingMap orderId={demoOrderId} userType={selectedUserType} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="features" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Real-time Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Real-time Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">2.3 km</div>
                      <div className="text-sm text-gray-600">Distance</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">8 min</div>
                      <div className="text-sm text-gray-600">ETA</div>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">25 km/h</div>
                      <div className="text-sm text-gray-600">Speed</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">92%</div>
                      <div className="text-sm text-gray-600">Efficiency</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Traffic Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Traffic & Weather
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span>Traffic Level:</span>
                      <Badge className="bg-yellow-100 text-yellow-800">MEDIUM</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Weather:</span>
                      <span className="font-medium">Clear, 28°C</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Visibility:</span>
                      <span className="font-medium">10 km</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Delay:</span>
                      <span className="font-medium text-orange-600">+3 min</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Route Optimization */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Route className="w-5 h-5" />
                    Route Optimization
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="font-medium text-blue-800">Current Route</div>
                      <div className="text-sm text-blue-600">2.3 km • 8 min</div>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="font-medium text-green-800">Optimized Route</div>
                      <div className="text-sm text-green-600">2.1 km • 7 min (Saves 1 min)</div>
                    </div>
                    <div className="p-3 bg-orange-50 rounded-lg">
                      <div className="font-medium text-orange-800">Alternate Route</div>
                      <div className="text-sm text-orange-600">2.5 km • 9 min (Avoids traffic)</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Performance Analytics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    Performance Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Average Speed</span>
                        <span className="text-sm font-medium">28.5 km/h</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Route Efficiency</span>
                        <span className="text-sm font-medium">92%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: '92%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Customer Satisfaction</span>
                        <span className="text-sm font-medium">4.8/5.0</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-purple-600 h-2 rounded-full" style={{ width: '96%' }}></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Demo Instructions */}
        <Card className="bg-gradient-to-r from-green-50 to-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Navigation className="w-6 h-6" />
              Demo Instructions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-white rounded-lg">
                <div className="font-semibold mb-2">🎯 Customer Experience</div>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• Real-time order tracking</li>
                  <li>• Live GPS location updates</li>
                  <li>• ETA and distance calculations</li>
                  <li>• Direct communication with agent</li>
                </ul>
              </div>
              <div className="p-4 bg-white rounded-lg">
                <div className="font-semibold mb-2">🚚 Delivery Partner</div>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• Route optimization suggestions</li>
                  <li>• Traffic and weather updates</li>
                  <li>• Performance metrics tracking</li>
                  <li>• Customer communication tools</li>
                </ul>
              </div>
              <div className="p-4 bg-white rounded-lg">
                <div className="font-semibold mb-2">👨‍💼 Admin Dashboard</div>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• Monitor all active deliveries</li>
                  <li>• Analytics and reporting</li>
                  <li>• Route optimization management</li>
                  <li>• Performance monitoring</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <Card className="text-center">
          <CardContent className="p-6">
            <p className="text-gray-600 mb-4">
              This enhanced tracking system provides comprehensive real-time monitoring with advanced features
              for improved delivery efficiency and customer satisfaction.
            </p>
            <div className="flex justify-center gap-4">
              <Badge className="bg-blue-100 text-blue-800">Real-time GPS</Badge>
              <Badge className="bg-green-100 text-green-800">AI Optimization</Badge>
              <Badge className="bg-purple-100 text-purple-800">Advanced Analytics</Badge>
              <Badge className="bg-orange-100 text-orange-800">Multi-platform</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TrackingDemo;