import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Navigation, User, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
    pincode: '',
  });
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const data = await response.json();
      
      if (data && data.display_name) {
        const address = data.display_name;
        const pincode = data.address?.postcode || '';
        
        setFormData(prev => ({
          ...prev,
          address: address,
          pincode: pincode
        }));
      }
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
    }
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Location not supported",
        description: "Your device doesn't support location services.",
        variant: "destructive",
      });
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coordinates = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        
        setFormData(prev => ({ ...prev, coordinates }));
        
        // Get address from coordinates
        await reverseGeocode(coordinates.lat, coordinates.lng);
        
        setIsGettingLocation(false);
        
        toast({
          title: "Location captured!",
          description: "Address has been filled automatically from your location.",
        });
      },
      (error) => {
        setIsGettingLocation(false);
        toast({
          title: "Location error",
          description: "Unable to get your current location. Please enter address manually.",
          variant: "destructive",
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
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
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-base md:text-lg">
            <MapPin className="w-4 h-4 md:w-5 md:h-5 mr-2" />
            Delivery Address
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
          {/* Personal Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            <div>
              <Label htmlFor="name" className="text-sm">Full Name *</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 md:w-4 md:h-4 text-muted-foreground" />
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Your full name"
                  className="pl-9 md:pl-10 text-sm md:text-base"
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="phone" className="text-sm">Phone Number *</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 md:w-4 md:h-4 text-muted-foreground" />
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="10-digit mobile number"
                  className="pl-9 md:pl-10 text-sm md:text-base"
                  maxLength={10}
                  required
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div>
            <Label htmlFor="address" className="text-sm">Complete Address *</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              placeholder="House/Flat No., Building, Street, Area"
              rows={3}
              className="text-sm md:text-base"
              required
            />
          </div>

          {/* Landmark & Pincode */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            <div>
              <Label htmlFor="landmark" className="text-sm">Landmark (Optional)</Label>
              <Input
                id="landmark"
                value={formData.landmark}
                onChange={(e) => setFormData(prev => ({ ...prev, landmark: e.target.value }))}
                placeholder="Near famous place"
                className="text-sm md:text-base"
              />
            </div>
            <div>
              <Label htmlFor="pincode" className="text-sm">Pincode *</Label>
              <Input
                id="pincode"
                value={formData.pincode}
                onChange={(e) => setFormData(prev => ({ ...prev, pincode: e.target.value }))}
                placeholder="6-digit pincode"
                maxLength={6}
                className="text-sm md:text-base"
                required
              />
            </div>
          </div>

          {/* Location Button */}
          <div className="border-t pt-3 md:pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleGetCurrentLocation}
              disabled={isGettingLocation}
              className="w-full text-sm md:text-base"
              size="sm"
            >
              {isGettingLocation ? (
                <div className="flex items-center">
                  <div className="w-3 h-3 md:w-4 md:h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2"></div>
                  Getting Location...
                </div>
              ) : (
                <>
                  <Navigation className="w-3 h-3 md:w-4 md:h-4 mr-2" />
                  Use Current Location
                  {formData.coordinates && (
                    <span className="ml-2 text-green-600 text-xs md:text-sm">✓ Captured</span>
                  )}
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground mt-2 text-center leading-relaxed">
              {formData.coordinates ? 
                "Location captured! Address filled automatically." : 
                "This will auto-fill your address and help delivery partners find you."
              }
            </p>
          </div>

          {/* Submit Buttons */}
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 pt-3 md:pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 text-sm md:text-base" size="sm">
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-gradient-primary text-sm md:text-base" size="sm">
              Save & Continue
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddressForm;