import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Plus, Navigation } from 'lucide-react';
import LocationPicker from './LocationPicker';

interface AddressSelectorProps {
  onAddressSelect: (address: any) => void;
  selectedAddress?: any;
}

const AddressSelector = ({ onAddressSelect, selectedAddress }: AddressSelectorProps) => {
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<string>('');
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);

  useEffect(() => {
    // Load current location from home page
    const homeLocation = localStorage.getItem('currentLocation');
    if (homeLocation) {
      setCurrentLocation(homeLocation);
    }

    // Load saved addresses
    const customerPhone = localStorage.getItem('customerPhone');
    if (customerPhone) {
      const addresses = JSON.parse(localStorage.getItem(`addresses_${customerPhone}`) || '[]');
      setSavedAddresses(addresses);
    }
  }, []);

  const handleUseCurrentLocation = () => {
    const coordinates = localStorage.getItem('currentCoordinates');
    const coords = coordinates ? JSON.parse(coordinates) : null;
    
    onAddressSelect({
      address: currentLocation,
      coordinates: coords,
      type: 'current'
    });
  };

  const handleLocationSelect = (location: any) => {
    onAddressSelect(location);
    setShowLocationPicker(false);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Select Delivery Address</h3>
      
      {/* Current Location */}
      {currentLocation && (
        <Card 
          className={`cursor-pointer border-2 transition-colors ${
            selectedAddress?.type === 'current' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-300'
          }`}
          onClick={handleUseCurrentLocation}
        >
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Navigation className="w-5 h-5 text-green-600 mt-1" />
              <div className="flex-1">
                <p className="font-medium text-green-800">Current Location</p>
                <p className="text-sm text-gray-600">{currentLocation}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Saved Addresses */}
      {savedAddresses.map((address, index) => (
        <Card 
          key={index}
          className={`cursor-pointer border-2 transition-colors ${
            selectedAddress?.address === address.address ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
          }`}
          onClick={() => onAddressSelect(address)}
        >
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-blue-600 mt-1" />
              <div className="flex-1">
                <p className="font-medium text-blue-800">{address.type || 'Saved Address'}</p>
                <p className="text-sm text-gray-600">{address.address}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Add New Address */}
      <Card 
        className="cursor-pointer border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors"
        onClick={() => setShowLocationPicker(true)}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-3 text-gray-600">
            <Plus className="w-5 h-5" />
            <span>Add New Address</span>
          </div>
        </CardContent>
      </Card>

      {/* Location Picker Modal */}
      {showLocationPicker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Add New Address</CardTitle>
            </CardHeader>
            <CardContent>
              <LocationPicker 
                onLocationSelect={handleLocationSelect}
              />
              <Button 
                onClick={() => setShowLocationPicker(false)}
                variant="outline"
                className="w-full mt-4"
              >
                Cancel
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AddressSelector;