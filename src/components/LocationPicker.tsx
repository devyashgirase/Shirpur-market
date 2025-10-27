import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Navigation, Search, Target } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LocationPickerProps {
  onLocationSelect: (location: { lat: number; lng: number; address: string }) => void;
  defaultLocation?: { lat: number; lng: number };
}

const LocationPicker = ({ onLocationSelect, defaultLocation }: LocationPickerProps) => {
  const [currentLocation, setCurrentLocation] = useState(defaultLocation || { lat: 21.3487, lng: 74.8831 });
  const [address, setAddress] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    reverseGeocode(currentLocation.lat, currentLocation.lng);
  }, [currentLocation]);

  const getCurrentLocation = () => {
    setIsGettingLocation(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setCurrentLocation(newLocation);
          setIsGettingLocation(false);
          toast({
            title: "Location Found",
            description: "Your current location has been detected",
          });
        },
        (error) => {
          setIsGettingLocation(false);
          toast({
            title: "Location Error",
            description: "Unable to get your location. Using Shirpur center.",
            variant: "destructive"
          });
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setIsGettingLocation(false);
      toast({
        title: "Not Supported",
        description: "Geolocation is not supported by this browser",
        variant: "destructive"
      });
    }
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      // Simulate reverse geocoding for Shirpur area
      const shirpurAreas = [
        'Main Market, Shirpur',
        'Station Road, Shirpur',
        'College Road, Shirpur',
        'Hospital Area, Shirpur',
        'Bus Stand, Shirpur',
        'Textile Market, Shirpur',
        'Residential Area, Shirpur',
        'Industrial Area, Shirpur'
      ];
      
      const randomArea = shirpurAreas[Math.floor(Math.random() * shirpurAreas.length)];
      const formattedAddress = `${randomArea}, Dhule, Maharashtra 425405`;
      setAddress(formattedAddress);
    } catch (error) {
      setAddress('Shirpur, Dhule, Maharashtra 425405');
    }
  };

  const searchLocation = async () => {
    if (!searchQuery.trim()) return;
    
    // Simulate location search within Shirpur
    const shirpurLocations = [
      { name: 'Shirpur Main Market', lat: 21.3487, lng: 74.8831 },
      { name: 'Shirpur Railway Station', lat: 21.3456, lng: 74.8798 },
      { name: 'Shirpur College', lat: 21.3512, lng: 74.8867 },
      { name: 'Shirpur Hospital', lat: 21.3445, lng: 74.8823 },
      { name: 'Shirpur Bus Stand', lat: 21.3478, lng: 74.8845 }
    ];
    
    const found = shirpurLocations.find(loc => 
      loc.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    if (found) {
      setCurrentLocation({ lat: found.lat, lng: found.lng });
      toast({
        title: "Location Found",
        description: `Found ${found.name}`,
      });
    } else {
      toast({
        title: "Location Not Found",
        description: "Try searching for landmarks in Shirpur",
        variant: "destructive"
      });
    }
  };

  const handleMapClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Convert click position to coordinates (simplified)
    const lat = 21.3487 + (y - 150) * 0.0001;
    const lng = 74.8831 + (x - 200) * 0.0001;
    
    setCurrentLocation({ lat, lng });
  };

  const confirmLocation = () => {
    onLocationSelect({
      lat: currentLocation.lat,
      lng: currentLocation.lng,
      address: address
    });
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search for places in Shirpur..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            onKeyPress={(e) => e.key === 'Enter' && searchLocation()}
          />
        </div>
        <Button onClick={searchLocation} variant="outline">
          <Search className="w-4 h-4" />
        </Button>
      </div>

      {/* Map Container */}
      <Card>
        <CardContent className="p-0">
          <div 
            className="relative w-full h-64 bg-gradient-to-br from-green-100 to-blue-100 cursor-crosshair overflow-hidden rounded-lg"
            onClick={handleMapClick}
          >
            {/* Simplified Map Background */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-4 left-4 w-8 h-8 bg-green-500 rounded"></div>
              <div className="absolute top-12 right-8 w-6 h-6 bg-blue-500 rounded"></div>
              <div className="absolute bottom-8 left-12 w-4 h-4 bg-red-500 rounded"></div>
              <div className="absolute bottom-4 right-4 w-5 h-5 bg-yellow-500 rounded"></div>
            </div>
            
            {/* Grid Lines */}
            <div className="absolute inset-0 opacity-10">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="absolute border-gray-400" style={{
                  left: `${i * 10}%`,
                  top: 0,
                  bottom: 0,
                  borderLeft: '1px solid'
                }} />
              ))}
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="absolute border-gray-400" style={{
                  top: `${i * 16.67}%`,
                  left: 0,
                  right: 0,
                  borderTop: '1px solid'
                }} />
              ))}
            </div>

            {/* Location Marker */}
            <div 
              className="absolute transform -translate-x-1/2 -translate-y-full z-10"
              style={{
                left: `${50 + (currentLocation.lng - 74.8831) * 10000}%`,
                top: `${50 - (currentLocation.lat - 21.3487) * 10000}%`
              }}
            >
              <div className="relative">
                <MapPin className="w-8 h-8 text-red-500 drop-shadow-lg" fill="currentColor" />
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              </div>
            </div>

            {/* Map Labels */}
            <div className="absolute top-2 left-2 bg-white/80 px-2 py-1 rounded text-xs font-medium">
              Shirpur Map
            </div>
            <div className="absolute bottom-2 right-2 bg-white/80 px-2 py-1 rounded text-xs">
              Click to set location
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location Info */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-medium text-sm">Selected Location</p>
                <p className="text-xs text-gray-600">{address}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button 
          onClick={getCurrentLocation}
          disabled={isGettingLocation}
          variant="outline"
          className="flex-1"
        >
          {isGettingLocation ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
          ) : (
            <Target className="w-4 h-4 mr-2" />
          )}
          Use Current Location
        </Button>
        <Button onClick={confirmLocation} className="flex-1">
          <Navigation className="w-4 h-4 mr-2" />
          Confirm Location
        </Button>
      </div>
    </div>
  );
};

export default LocationPicker;