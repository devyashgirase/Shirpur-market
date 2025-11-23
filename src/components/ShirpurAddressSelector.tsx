import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Home, Briefcase, Plus, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AddressForm, { type AddressData } from "./AddressForm";

interface SavedAddress extends AddressData {
  id: string;
  type: 'home' | 'work' | 'other';
  isDefault?: boolean;
}

interface ShirpurAddressSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onAddressSelect: (address: AddressData) => void;
  homePageLocation?: string | null;
}

const ShirpurAddressSelector = ({ isOpen, onClose, onAddressSelect, homePageLocation }: ShirpurAddressSelectorProps) => {
  const { toast } = useToast();
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadSavedAddresses();
    }
  }, [isOpen]);

  const loadSavedAddresses = async () => {
    try {
      setIsLoading(true);
      const customerPhone = localStorage.getItem('customerPhone');
      
      if (customerPhone) {
        // Load from Supabase
        const { supabaseApi } = await import('@/lib/supabase');
        const addresses = await supabaseApi.getCustomerAddresses(customerPhone);
        setSavedAddresses(addresses || []);
      } else {
        // Load from localStorage for guest users
        const localAddresses = localStorage.getItem('savedAddresses');
        setSavedAddresses(localAddresses ? JSON.parse(localAddresses) : []);
      }
    } catch (error) {
      console.error('Failed to load addresses:', error);
      setSavedAddresses([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddressSelect = (address: SavedAddress) => {
    onAddressSelect(address);
    onClose();
  };

  const handleNewAddress = () => {
    setShowAddressForm(true);
  };

  const handleAddressFormSubmit = async (addressData: AddressData) => {
    try {
      const customerPhone = localStorage.getItem('customerPhone');
      
      // Check for duplicate addresses
      const existingAddresses = customerPhone 
        ? await (async () => {
            const { supabaseApi } = await import('@/lib/supabase');
            return await supabaseApi.getCustomerAddresses(customerPhone);
          })()
        : JSON.parse(localStorage.getItem('savedAddresses') || '[]');
      
      const isDuplicate = existingAddresses.some((addr: any) => 
        addr.address === addressData.address && addr.pincode === addressData.pincode
      );
      
      if (!isDuplicate) {
        const newAddress: SavedAddress = {
          ...addressData,
          id: `addr_${Date.now()}`,
          type: 'other'
        };

        // Save to database or localStorage
        if (customerPhone) {
          const { supabaseApi } = await import('@/lib/supabase');
          await supabaseApi.saveCustomerAddress(customerPhone, addressData);
        } else {
          const addresses = [...existingAddresses, newAddress];
          localStorage.setItem('savedAddresses', JSON.stringify(addresses));
        }
        
        toast({
          title: "Address Saved",
          description: "Your address has been saved successfully",
        });
      }

      setShowAddressForm(false);
      onAddressSelect(addressData);
      onClose();
      
    } catch (error) {
      console.error('Failed to save address:', error);
      toast({
        title: "Error",
        description: "Failed to save address. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getAddressIcon = (type: string) => {
    switch (type) {
      case 'home': return <Home className="w-5 h-5 text-green-600" />;
      case 'work': return <Briefcase className="w-5 h-5 text-blue-600" />;
      default: return <MapPin className="w-5 h-5 text-gray-600" />;
    }
  };

  const formatAddress = (address: SavedAddress) => {
    return `${address.address}${address.landmark ? ', ' + address.landmark : ''}${address.city ? ', ' + address.city : ''} - ${address.pincode}`;
  };

  return (
    <>
      <Dialog open={isOpen && !showAddressForm} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center text-xl font-bold">
              <MapPin className="w-6 h-6 mr-2 text-orange-500" />
              Choose a delivery address
            </DialogTitle>
            <p className="text-gray-600 text-sm">Multiple addresses in this location</p>
          </DialogHeader>

          <div className="space-y-4">
            {/* Home Page Location */}
            {homePageLocation && (
              <Card className="cursor-pointer hover:shadow-md transition-shadow border-2 border-green-200 bg-green-50">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <MapPin className="w-5 h-5 text-green-600" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold text-gray-800">Current Location</h3>
                          <span className="bg-green-100 text-green-600 text-xs px-2 py-1 rounded-full">From Home</span>
                        </div>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {homePageLocation}
                        </p>
                        <div className="flex items-center mt-2 text-xs text-gray-500">
                          <Clock className="w-3 h-3 mr-1" />
                          15 MINS
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={() => {
                        const coordinates = localStorage.getItem('currentCoordinates');
                        const coords = coordinates ? JSON.parse(coordinates) : null;
                        onAddressSelect({
                          name: 'Current Location',
                          phone: localStorage.getItem('customerPhone') || '',
                          address: homePageLocation,
                          landmark: '',
                          city: '',
                          state: '',
                          pincode: '',
                          coordinates: coords
                        });
                        onClose();
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 text-sm font-medium"
                    >
                      DELIVER HERE
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-20 bg-gray-200 rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : savedAddresses.length > 0 ? (
              <div className="space-y-3">
                {savedAddresses.map((address) => (
                  <Card key={address.id} className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-orange-200">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          {getAddressIcon(address.type)}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="font-semibold text-gray-800 capitalize">{address.type}</h3>
                              {address.isDefault && (
                                <span className="bg-orange-100 text-orange-600 text-xs px-2 py-1 rounded-full">Default</span>
                              )}
                            </div>
                            <p className="text-gray-600 text-sm leading-relaxed">
                              {formatAddress(address)}
                            </p>
                            <div className="flex items-center mt-2 text-xs text-gray-500">
                              <Clock className="w-3 h-3 mr-1" />
                              20 MINS
                            </div>
                          </div>
                        </div>
                        <Button
                          onClick={() => handleAddressSelect(address)}
                          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 text-sm font-medium"
                        >
                          DELIVER HERE
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No saved addresses</h3>
                <p className="text-gray-500 text-sm">Add your first delivery address to get started</p>
              </div>
            )}

            {/* Add New Address Button */}
            <Card className="border-2 border-dashed border-gray-300 hover:border-orange-300 cursor-pointer transition-colors">
              <CardContent className="p-4">
                <Button
                  onClick={handleNewAddress}
                  variant="ghost"
                  className="w-full h-auto p-0 justify-start hover:bg-transparent"
                >
                  <div className="flex items-center space-x-3 text-left">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <Plus className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">Add new address</h3>
                      <p className="text-gray-600 text-sm">Save address for faster checkout</p>
                    </div>
                  </div>
                </Button>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>

      {/* Address Form */}
      <AddressForm
        isOpen={showAddressForm}
        onClose={() => setShowAddressForm(false)}
        onSubmit={handleAddressFormSubmit}
      />
    </>
  );
};

export default ShirpurAddressSelector;