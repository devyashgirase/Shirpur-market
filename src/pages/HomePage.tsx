import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Search, ChevronDown, Truck, Clock, Star, Shield, Navigation, Loader } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import "@/styles/swiggy-homepage.css";

const HomePage = () => {
  const [location, setLocation] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.location-dropdown-container')) {
        setShowLocationDropdown(false);
      }
    };

    if (showLocationDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showLocationDropdown]);

  const handleGetStarted = () => {
    navigate('/login');
  };

  const handleFoodDelivery = () => {
    navigate('/customer');
  };

  const handleInstamart = () => {
    navigate('/customer');
  };

  const handleDineout = () => {
    navigate('/customer');
  };

  const getCurrentLocation = async () => {
    if (!navigator.geolocation) {
      toast({
        title: "Location not supported",
        description: "Your browser doesn't support location services",
        variant: "destructive"
      });
      return;
    }

    setIsGettingLocation(true);
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Reverse geocoding to get address
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            {
              headers: {
                'User-Agent': 'Shirpur-Delivery-App/1.0'
              }
            }
          );
          
          const data = await response.json();
          
          if (data && data.display_name) {
            // Format address
            const addressParts = [];
            if (data.address?.house_number) addressParts.push(data.address.house_number);
            if (data.address?.road) addressParts.push(data.address.road);
            if (data.address?.neighbourhood) addressParts.push(data.address.neighbourhood);
            if (data.address?.suburb) addressParts.push(data.address.suburb);
            if (data.address?.city || data.address?.town) {
              addressParts.push(data.address.city || data.address.town);
            }
            
            const formattedAddress = addressParts.length > 0 
              ? addressParts.join(', ') 
              : data.display_name.split(',').slice(0, 3).join(', ');
            
            setLocation(formattedAddress);
            setShowLocationDropdown(false);
            
            toast({
              title: "Location detected!",
              description: "Your current location has been set",
            });
          }
        } catch (error) {
          console.error('Reverse geocoding failed:', error);
          setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          toast({
            title: "Location set",
            description: "Coordinates saved, address lookup failed",
          });
        }
        
        setIsGettingLocation(false);
      },
      (error) => {
        setIsGettingLocation(false);
        let errorMessage = "Unable to get location. ";
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += "Please allow location access.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += "Location unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage += "Request timed out.";
            break;
          default:
            errorMessage += "Please try again.";
            break;
        }
        
        toast({
          title: "Location Error",
          description: errorMessage,
          variant: "destructive"
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 300000
      }
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 via-orange-500 to-red-500 relative overflow-hidden">
      {/* Background Food Images */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-10 w-32 h-32 bg-green-400 rounded-full blur-xl"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-yellow-400 rounded-full blur-lg"></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-red-400 rounded-full blur-2xl"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-4 md:px-6 py-4 bg-white/10 backdrop-blur-sm">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-white rounded-lg flex items-center justify-center">
            <Truck className="w-4 h-4 md:w-6 md:h-6 text-orange-500" />
          </div>
          <span className="text-lg md:text-2xl font-bold text-white">Shirpur Delivery</span>
        </div>
        
        <nav className="flex items-center space-x-2 md:space-x-4 text-white">
          <div className="hidden lg:flex items-center space-x-4">
            <Button 
              onClick={() => navigate('/delivery/login')}
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-orange-500 rounded-full px-4 py-2 text-sm whitespace-nowrap"
            >
              Delivery Partner With Us
            </Button>
            <Button 
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-orange-500 rounded-full px-4 py-2 text-sm whitespace-nowrap"
            >
              Get the App ↗
            </Button>
          </div>
          <Button 
            onClick={handleGetStarted}
            className="bg-white text-orange-500 hover:bg-orange-50 rounded-full px-4 md:px-6 py-2 text-sm md:text-base font-semibold whitespace-nowrap"
          >
            Sign In
          </Button>
        </nav>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] px-6 text-center">
        <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight px-4">
          Order food & groceries.<br className="hidden md:block" />
          <span className="md:hidden"> </span>Discover best restaurants.<br className="hidden md:block" />
          <span className="md:hidden"> </span><span className="text-yellow-300">Shirpur it!</span>
        </h1>

        {/* Search Section */}
        <div className="flex flex-col md:flex-row gap-4 w-full max-w-4xl mb-8 md:mb-12 px-4">
          {/* Location Input */}
          <div className="relative flex-1 location-dropdown-container">
            <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Enter your delivery location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onFocus={() => setShowLocationDropdown(true)}
              className="pl-12 pr-12 h-12 md:h-14 text-base md:text-lg bg-white border-0 rounded-xl shadow-lg"
            />
            <button
              onClick={() => setShowLocationDropdown(!showLocationDropdown)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <ChevronDown className="w-5 h-5" />
            </button>
            
            {/* Location Dropdown */}
            {showLocationDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border z-50">
                <div className="p-2">
                  <button
                    onClick={getCurrentLocation}
                    disabled={isGettingLocation}
                    className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
                  >
                    {isGettingLocation ? (
                      <Loader className="w-5 h-5 text-blue-500 animate-spin" />
                    ) : (
                      <Navigation className="w-5 h-5 text-blue-500" />
                    )}
                    <div>
                      <p className="font-medium text-gray-800">
                        {isGettingLocation ? 'Getting location...' : 'Use my current location'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {isGettingLocation ? 'Please wait...' : 'Auto-detect using GPS'}
                      </p>
                    </div>
                  </button>
                  
                  <div className="border-t my-2"></div>
                  
                  {/* Recent/Popular Locations */}
                  <div className="space-y-1">
                    <button
                      onClick={() => {
                        setLocation('Shirpur, Maharashtra 425405');
                        setShowLocationDropdown(false);
                      }}
                      className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
                    >
                      <MapPin className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-800">Shirpur, Maharashtra</p>
                        <p className="text-sm text-gray-500">425405</p>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => {
                        setLocation('Dhule, Maharashtra 424001');
                        setShowLocationDropdown(false);
                      }}
                      className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
                    >
                      <MapPin className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-800">Dhule, Maharashtra</p>
                        <p className="text-sm text-gray-500">424001</p>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Search Input */}
          <div className="relative flex-1">
            <Input
              placeholder="Search for restaurant, item or more"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-4 pr-12 h-12 md:h-14 text-base md:text-lg bg-white border-0 rounded-xl shadow-lg"
            />
            <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          </div>
        </div>

        {/* Service Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 w-full max-w-6xl px-4">
          {/* Food Delivery */}
          <div 
            onClick={handleFoodDelivery}
            className="bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer hover:bg-orange-50"
          >
            <h3 className="text-2xl font-bold text-gray-800 mb-2">FOOD DELIVERY</h3>
            <p className="text-gray-600 mb-4">FROM RESTAURANTS</p>
            <p className="text-orange-500 font-bold text-lg mb-6">UPTO 60% OFF</p>
            <div className="mt-auto">
              <div className="w-full h-32 bg-gradient-to-br from-orange-100 to-red-100 rounded-lg overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-400/20 to-red-400/20"></div>
              </div>
            </div>
          </div>

          {/* Instamart */}
          <div 
            onClick={handleInstamart}
            className="bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer hover:bg-green-50"
          >
            <h3 className="text-2xl font-bold text-gray-800 mb-2">INSTAMART</h3>
            <p className="text-gray-600 mb-4">INSTANT GROCERY</p>
            <p className="text-orange-500 font-bold text-lg mb-6">UPTO 60% OFF</p>
            <div className="mt-auto">
              <div className="w-full h-32 bg-gradient-to-br from-green-100 to-blue-100 rounded-lg overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-blue-400/20"></div>
              </div>
            </div>
          </div>

          {/* Dineout */}
          <div 
            onClick={handleDineout}
            className="bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer hover:bg-purple-50"
          >
            <h3 className="text-2xl font-bold text-gray-800 mb-2">DINEOUT</h3>
            <p className="text-gray-600 mb-4">EAT OUT & SAVE MORE</p>
            <p className="text-orange-500 font-bold text-lg mb-6">UPTO 50% OFF</p>
            <div className="mt-auto">
              <div className="w-full h-32 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-pink-400/20"></div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section className="relative z-10 bg-gray-800 py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 text-center text-white">
            <div className="flex flex-col items-center">
              <Clock className="w-10 h-10 md:w-12 md:h-12 mb-3 md:mb-4 text-orange-400" />
              <h3 className="text-lg md:text-xl font-bold mb-2">30 Min Delivery</h3>
              <p className="text-gray-300 text-sm md:text-base">Lightning fast delivery</p>
            </div>
            <div className="flex flex-col items-center">
              <Shield className="w-10 h-10 md:w-12 md:h-12 mb-3 md:mb-4 text-orange-400" />
              <h3 className="text-lg md:text-xl font-bold mb-2">Safe & Secure</h3>
              <p className="text-gray-300 text-sm md:text-base">Contactless delivery</p>
            </div>
            <div className="flex flex-col items-center">
              <Star className="w-10 h-10 md:w-12 md:h-12 mb-3 md:mb-4 text-orange-400" />
              <h3 className="text-lg md:text-xl font-bold mb-2">Best Quality</h3>
              <p className="text-gray-300 text-sm md:text-base">Fresh products</p>
            </div>
            <div className="flex flex-col items-center">
              <Truck className="w-10 h-10 md:w-12 md:h-12 mb-3 md:mb-4 text-orange-400" />
              <h3 className="text-lg md:text-xl font-bold mb-2">Live Tracking</h3>
              <p className="text-gray-300 text-sm md:text-base">Real-time tracking</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 bg-black py-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-white">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                  <Truck className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">Shirpur Delivery</span>
              </div>
              <p className="text-gray-400 text-sm">© 2024 Shirpur Delivery System</p>
            </div>
            
            <div>
              <h3 className="font-bold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Team</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Shirpur One</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold mb-4">Contact us</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help & Support</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Partner with us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Ride with us</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold mb-4">We deliver to:</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Shirpur</li>
                <li>Dhule</li>
                <li>Nashik</li>
                <li>Mumbai</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
            <p>Made with ❤️ for Shirpur | All rights reserved</p>
            <p className="mt-2 text-orange-400 font-medium">Powered by Yash Technology</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;