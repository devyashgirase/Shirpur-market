import { useState, useEffect } from 'react';
import { MapPin, Navigation, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface LocationData {
  lat: number;
  lng: number;
  accuracy: number;
  timestamp: number;
  address?: string;
}

export const RealTimeLocation = () => {
  const { toast } = useToast();
  const [location, setLocation] = useState<LocationData | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [error, setError] = useState<string>('');

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      // Try multiple geocoding services for better accuracy
      const services = [
        {
          url: `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
          headers: { 'User-Agent': 'Shirpur-Delivery-App/1.0' }
        },
        {
          url: `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
        }
      ];

      for (const service of services) {
        try {
          const response = await fetch(service.url, { headers: service.headers || {} });
          const data = await response.json();
          
          if (service.url.includes('nominatim')) {
            if (data && data.address) {
              const parts = [];
              if (data.address.house_number) parts.push(data.address.house_number);
              if (data.address.road) parts.push(data.address.road);
              if (data.address.neighbourhood) parts.push(data.address.neighbourhood);
              if (data.address.suburb) parts.push(data.address.suburb);
              if (data.address.city || data.address.town) parts.push(data.address.city || data.address.town);
              if (data.address.state) parts.push(data.address.state);
              return parts.join(', ') || data.display_name;
            }
          } else if (service.url.includes('bigdatacloud')) {
            if (data && data.locality) {
              const parts = [];
              if (data.localityInfo?.administrative?.[3]?.name) parts.push(data.localityInfo.administrative[3].name);
              if (data.localityInfo?.administrative?.[2]?.name) parts.push(data.localityInfo.administrative[2].name);
              if (data.locality) parts.push(data.locality);
              if (data.principalSubdivision) parts.push(data.principalSubdivision);
              return parts.join(', ');
            }
          }
        } catch (serviceError) {
          console.log(`Service failed:`, serviceError);
          continue;
        }
      }
      
      return `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`;
    } catch (error) {
      return `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`;
    }
  };

  const startTracking = () => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported');
      return;
    }

    setIsTracking(true);
    setError('');

    const id = navigator.geolocation.watchPosition(
      async (position) => {
        const locationData: LocationData = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: Date.now()
        };

        // Get address
        const address = await reverseGeocode(locationData.lat, locationData.lng);
        locationData.address = address;

        setLocation(locationData);
        
        // Store in localStorage for delivery tracking
        localStorage.setItem('customerRealTimeLocation', JSON.stringify(locationData));
      },
      (error) => {
        let errorMsg = 'Location error: ';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMsg += 'Permission denied';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMsg += 'Position unavailable';
            break;
          case error.TIMEOUT:
            errorMsg += 'Request timeout';
            break;
          default:
            errorMsg += 'Unknown error';
        }
        setError(errorMsg);
        setIsTracking(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0 // Always get fresh location
      }
    );

    setWatchId(id);
  };

  const stopTracking = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    setIsTracking(false);
    localStorage.removeItem('customerRealTimeLocation');
  };

  useEffect(() => {
    // Auto-start tracking if user previously enabled it
    const savedTracking = localStorage.getItem('locationTrackingEnabled');
    if (savedTracking === 'true') {
      startTracking();
    }

    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []);

  const refreshLocation = () => {
    if (!navigator.geolocation) return;
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const locationData: LocationData = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: Date.now()
        };

        const address = await reverseGeocode(locationData.lat, locationData.lng);
        locationData.address = address;
        setLocation(locationData);
        localStorage.setItem('customerRealTimeLocation', JSON.stringify(locationData));
        
        toast({
          title: "Location updated",
          description: "Got your current precise location",
        });
      },
      (error) => {
        toast({
          title: "Location error",
          description: "Could not get current location",
          variant: "destructive"
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const toggleTracking = () => {
    if (isTracking) {
      stopTracking();
      localStorage.setItem('locationTrackingEnabled', 'false');
      toast({
        title: "Location tracking stopped",
        description: "Your location is no longer being shared",
      });
    } else {
      startTracking();
      localStorage.setItem('locationTrackingEnabled', 'true');
      toast({
        title: "Location tracking started",
        description: "Your location will help with accurate delivery",
      });
    }
  };

  return (
    <Card className="mb-4 bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-full ${isTracking ? 'bg-green-100' : 'bg-gray-100'}`}>
              {isTracking ? (
                <Navigation className="w-5 h-5 text-green-600 animate-pulse" />
              ) : (
                <MapPin className="w-5 h-5 text-gray-600" />
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-sm">Live Location</h3>
                {isTracking ? (
                  <Wifi className="w-4 h-4 text-green-500" />
                ) : (
                  <WifiOff className="w-4 h-4 text-gray-400" />
                )}
              </div>
              
              {location ? (
                <div className="text-xs text-gray-600 mt-1">
                  <p className="truncate">{location.address}</p>
                  <p className="text-xs text-gray-500">
                    Accuracy: {Math.round(location.accuracy)}m • 
                    Updated: {new Date(location.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              ) : error ? (
                <p className="text-xs text-red-600 mt-1">{error}</p>
              ) : (
                <p className="text-xs text-gray-500 mt-1">
                  {isTracking ? 'Getting location...' : 'Enable for accurate delivery'}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button
              onClick={refreshLocation}
              size="sm"
              variant="outline"
              className="text-xs p-2"
              title="Get current location"
            >
              <RefreshCw className="w-3 h-3" />
            </Button>
            <Button
              onClick={toggleTracking}
              size="sm"
              variant={isTracking ? "destructive" : "default"}
              className="text-xs"
            >
              {isTracking ? 'Stop' : 'Start'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};