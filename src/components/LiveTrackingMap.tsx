import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Navigation, MapPin, Clock, Phone, Truck } from 'lucide-react';
import { LiveTrackingService, TrackingUpdate } from '@/lib/liveTrackingService';
import 'leaflet/dist/leaflet.css';

interface LiveTrackingMapProps {
  orderId: string;
  userType: 'customer' | 'delivery';
}

export const LiveTrackingMap = ({ orderId, userType }: LiveTrackingMapProps) => {
  const [trackingData, setTrackingData] = useState<TrackingUpdate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  useEffect(() => {
    const updateTracking = () => {
      const data = LiveTrackingService.getTrackingData(orderId);
      setTrackingData(data);
      setLastUpdate(new Date().toLocaleTimeString());
      setIsLoading(false);
    };

    // Initial load
    updateTracking();

    // Subscribe to live updates
    const handleLocationUpdate = () => {
      updateTracking();
    };

    LiveTrackingService.subscribe('agentLocationUpdate', handleLocationUpdate);

    // Update every 15 seconds
    const interval = setInterval(updateTracking, 15000);

    return () => {
      clearInterval(interval);
      LiveTrackingService.unsubscribe('agentLocationUpdate', handleLocationUpdate);
    };
  }, [orderId]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading live tracking...</p>
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

  const { agentLocation, customerLocation, estimatedArrival, distance, status } = trackingData;

  const statusConfig = {
    assigned: { color: 'bg-yellow-500', text: 'Order Assigned', icon: '📋' },
    picked_up: { color: 'bg-blue-500', text: 'Order Picked Up', icon: '📦' },
    on_the_way: { color: 'bg-orange-500', text: 'On The Way', icon: '🚚' },
    nearby: { color: 'bg-green-500', text: 'Nearby (< 100m)', icon: '📍' },
    delivered: { color: 'bg-green-600', text: 'Delivered', icon: '✅' }
  };

  const currentStatus = statusConfig[status];

  return (
    <div className="space-y-4">
      {/* Status Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Truck className="w-5 h-5 text-blue-500" />
              <span>Live Tracking</span>
            </div>
            <Badge className={`${currentStatus.color} text-white`}>
              {currentStatus.icon} {currentStatus.text}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{distance.toFixed(1)} km</div>
              <div className="text-sm text-gray-600">Distance</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{estimatedArrival} min</div>
              <div className="text-sm text-gray-600">ETA</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-bold text-orange-600">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse mx-auto mb-1"></div>
                Live
              </div>
              <div className="text-sm text-gray-600">Tracking</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500">{lastUpdate}</div>
              <div className="text-sm text-gray-600">Last Update</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Map */}
      <Card>
        <CardContent className="p-0">
          <div className="h-96 w-full">
            <MapContainer
              center={[agentLocation.lat, agentLocation.lng]}
              zoom={15}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />
              
              {/* Delivery Agent Marker */}
              <Marker position={[agentLocation.lat, agentLocation.lng]}>
                <Popup>
                  <div className="text-center">
                    <div className="text-lg font-bold">🚚 Delivery Agent</div>
                    <div className="text-sm text-gray-600">
                      Last updated: {new Date(agentLocation.timestamp).toLocaleTimeString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      Accuracy: {Math.round(agentLocation.accuracy)}m
                    </div>
                  </div>
                </Popup>
              </Marker>

              {/* Customer Marker */}
              <Marker position={[customerLocation.lat, customerLocation.lng]}>
                <Popup>
                  <div className="text-center">
                    <div className="text-lg font-bold">🏠 Delivery Address</div>
                    <div className="text-sm text-gray-600">Your location</div>
                  </div>
                </Popup>
              </Marker>

              {/* Route Line */}
              <Polyline
                positions={[
                  [agentLocation.lat, agentLocation.lng],
                  [customerLocation.lat, customerLocation.lng]
                ]}
                color="blue"
                weight={3}
                opacity={0.7}
                dashArray="10, 10"
              />
            </MapContainer>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      {userType === 'customer' && (
        <Card>
          <CardContent className="p-4">
            <div className="flex space-x-2">
              <Button className="flex-1" variant="outline">
                <Phone className="w-4 h-4 mr-2" />
                Call Agent
              </Button>
              <Button className="flex-1" variant="outline">
                <Navigation className="w-4 h-4 mr-2" />
                Share Location
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {userType === 'delivery' && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-2">
              <Button className="bg-green-500 hover:bg-green-600">
                <MapPin className="w-4 h-4 mr-2" />
                Mark Delivered
              </Button>
              <Button variant="outline">
                <Phone className="w-4 h-4 mr-2" />
                Call Customer
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};