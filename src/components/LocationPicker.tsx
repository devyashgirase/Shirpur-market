import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Search, Navigation } from 'lucide-react';
import { LocationService } from '@/lib/locationService';

interface LocationPickerProps {
  onLocationSelect: (location: any) => void;
  defaultAddress?: string;
}

const LocationPicker = ({ onLocationSelect, defaultAddress = '' }: LocationPickerProps) => {
  const [searchQuery, setSearchQuery] = useState(defaultAddress);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [currentLocation, setCurrentLocation] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleGetCurrentLocation = async () => {
    setLoading(true);
    try {
      const location = await LocationService.getCurrentLocationWithDetails();
      setCurrentLocation(location);
      setSearchQuery(location.address);
      onLocationSelect(location);
    } catch (error) {
      alert('❌ Unable to get current location. Please enter address manually.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const results = await LocationService.searchAddress(searchQuery);
      setSearchResults(results);
    } catch (error) {
      alert('❌ Address search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectResult = (result: any) => {
    setSearchQuery(result.display_name);
    setSearchResults([]);
    onLocationSelect({
      lat: result.lat,
      lng: result.lng,
      address: result.display_name,
      timestamp: new Date().toISOString()
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Search address or area..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <Button onClick={handleSearch} disabled={loading}>
          <Search className="w-4 h-4" />
        </Button>
      </div>

      <Button
        onClick={handleGetCurrentLocation}
        disabled={loading}
        className="w-full"
        variant="outline"
      >
        <Navigation className="w-4 h-4 mr-2" />
        {loading ? 'Getting Location...' : 'Use Current Location'}
      </Button>

      {currentLocation && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-3">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-green-600 mt-1" />
              <div>
                <p className="text-sm font-medium text-green-800">Current Location</p>
                <p className="text-xs text-green-600">{currentLocation.address}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {searchResults.length > 0 && (
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {searchResults.map((result, index) => (
            <Card key={index} className="cursor-pointer hover:bg-gray-50" onClick={() => handleSelectResult(result)}>
              <CardContent className="p-3">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm font-medium">{result.display_name}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default LocationPicker;