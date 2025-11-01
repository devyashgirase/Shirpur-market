import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Navigation, User, Phone, Map } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import LocationPicker from "./LocationPicker";

interface AddressFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (addressData: AddressData) => void;
}

export interface AddressData {
  name: string;
  phone: string;
  address: string;
  landmark?: string;
  city?: string;
  state?: string;
  pincode: string;
  coordinates?: { lat: number; lng: number };
}

const AddressForm = ({ isOpen, onClose, onSubmit }: AddressFormProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<AddressData>({
    name: '',
    phone: '',
    address: '',
    landmark: '',
    city: '',
    state: '',
    pincode: '',
  });
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      // Add user agent to avoid rate limiting
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'Shirpur-Delivery-App/1.0'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data && data.display_name) {
        // Extract meaningful address parts
        const addressParts = [];
        if (data.address?.house_number) addressParts.push(data.address.house_number);
        if (data.address?.road) addressParts.push(data.address.road);
        if (data.address?.neighbourhood) addressParts.push(data.address.neighbourhood);
        if (data.address?.suburb) addressParts.push(data.address.suburb);
        if (data.address?.city || data.address?.town || data.address?.village) {
          addressParts.push(data.address.city || data.address.town || data.address.village);
        }
        
        const formattedAddress = addressParts.length > 0 ? addressParts.join(', ') : data.display_name;
        const pincode = data.address?.postcode || '';
        const city = data.address?.city || data.address?.town || data.address?.village || '';
        const state = data.address?.state || '';
        
        setFormData(prev => ({
          ...prev,
          address: formattedAddress,
          city: city,
          state: state,
          pincode: pincode
        }));
      }
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
      throw error;
    }
  };

  const handleGetCurrentLocation = () => {
    // Check if geolocation is supported
    if (!navigator.geolocation) {
      toast({
        title: "Location not supported",
        description: "Your device doesn't support location services.",
        variant: "destructive",
      });
      return;
    }

    // Check if we're on HTTPS (required for location)
    if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
      toast({
        title: "HTTPS Required",
        description: "Location services require a secure connection. Please use HTTPS.",
        variant: "destructive",
      });
      return;
    }

    setIsGettingLocation(true);
    
    // First check permissions
    if ('permissions' in navigator) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        if (result.state === 'denied') {
          setIsGettingLocation(false);
          toast({
            title: "Location Permission Denied",
            description: "Please enable location access in your browser settings and try again.",
            variant: "destructive",
          });
          return;
        }
      });
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coordinates = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        
        setFormData(prev => ({ ...prev, coordinates }));
        
        try {
          // Get address from coordinates
          await reverseGeocode(coordinates.lat, coordinates.lng);
          
          toast({
            title: "Location captured!",
            description: "Address has been filled automatically from your location.",
          });
        } catch (error) {
          toast({
            title: "Location captured!",
            description: "Location saved, but couldn't auto-fill address. Please enter manually.",
          });
        }
        
        setIsGettingLocation(false);
      },
      (error) => {
        setIsGettingLocation(false);
        
        let errorMessage = "Unable to get your current location. ";
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += "Location access was denied. Please enable location permissions.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += "Location information is unavailable. Please check your GPS.";
            break;
          case error.TIMEOUT:
            errorMessage += "Location request timed out. Please try again.";
            break;
          default:
            errorMessage += "Please enter address manually.";
            break;
        }
        
        toast({
          title: "Location Error",
          description: errorMessage,
          variant: "destructive",
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 300000, // 5 minutes
      }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone || !formData.address || !formData.pincode) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    onSubmit(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-lg font-bold text-center">
            <MapPin className="w-5 h-5 mr-2 text-blue-600" />
            🏠 Delivery Address
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Personal Details */}
          <div className="bg-blue-50 p-4 rounded-lg space-y-3">
            <h3 className="font-semibold text-blue-800 flex items-center">
              <User className="w-4 h-4 mr-2" />
              Personal Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="name" className="text-sm font-medium">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter your full name"
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone" className="text-sm font-medium">Phone Number *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="10-digit mobile number"
                  className="mt-1"
                  maxLength={10}
                  required
                />
              </div>
            </div>
          </div>

          {/* Address Details */}
          <div className="bg-green-50 p-4 rounded-lg space-y-3">
            <h3 className="font-semibold text-green-800 flex items-center">
              <MapPin className="w-4 h-4 mr-2" />
              Address Details
            </h3>
            
            <div>
              <Label htmlFor="address" className="text-sm font-medium">Complete Address *</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="House/Flat No., Building Name, Street, Area"
                rows={2}
                className="mt-1"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="city" className="text-sm font-medium">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="City"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="pincode" className="text-sm font-medium">Pincode *</Label>
                <Input
                  id="pincode"
                  value={formData.pincode}
                  onChange={(e) => setFormData(prev => ({ ...prev, pincode: e.target.value }))}
                  placeholder="6-digit"
                  maxLength={6}
                  className="mt-1"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="state" className="text-sm font-medium">State</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                  placeholder="State"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="landmark" className="text-sm font-medium">Landmark</Label>
                <Input
                  id="landmark"
                  value={formData.landmark}
                  onChange={(e) => setFormData(prev => ({ ...prev, landmark: e.target.value }))}
                  placeholder="Near..."
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Location Services */}
          <div className="bg-orange-50 p-4 rounded-lg space-y-3">
            <h3 className="font-semibold text-orange-800 flex items-center">
              <Navigation className="w-4 h-4 mr-2" />
              📍 Get Location
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleGetCurrentLocation}
                disabled={isGettingLocation}
                className="bg-blue-500 text-white hover:bg-blue-600 border-0"
              >
                {isGettingLocation ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                ) : (
                  <Navigation className="w-4 h-4 mr-2" />
                )}
                Use GPS
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowLocationPicker(true)}
                className="bg-green-500 text-white hover:bg-green-600 border-0"
              >
                <Map className="w-4 h-4 mr-2" />
                Pick on Map
              </Button>
            </div>
            
            {formData.coordinates && (
              <div className="bg-green-100 p-3 rounded-lg text-center">
                <p className="text-green-800 font-medium text-sm">
                  ✅ Location Captured Successfully!
                </p>
              </div>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose} 
              className="flex-1 border-2 border-gray-300 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white font-bold"
            >
              💾 Save Address
            </Button>
          </div>
        </form>
        
        {/* Location Picker Modal */}
        {showLocationPicker && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-4 max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Pick Location</h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowLocationPicker(false)}
                >
                  ✕
                </Button>
              </div>
              <LocationPicker
                onLocationSelect={(location) => {
                  setFormData(prev => ({
                    ...prev,
                    coordinates: { lat: location.lat, lng: location.lng },
                    address: prev.address || location.address,
                    city: prev.city || 'Shirpur',
                    state: prev.state || 'Maharashtra',
                    pincode: prev.pincode || '425405'
                  }));
                  setShowLocationPicker(false);
                  toast({
                    title: "Location Selected",
                    description: "Location has been set from map",
                  });
                }}
                defaultLocation={formData.coordinates}
              />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AddressForm;