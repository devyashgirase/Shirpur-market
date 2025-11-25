import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ShoppingCart, Package, Home, ArrowLeft, MapPin, Menu } from "lucide-react";
import { cartService } from "@/lib/cartService";
import { useState, useEffect } from "react";
import ProfileDropdown from "@/components/ProfileDropdown";
import CustomerLocation from "@/components/CustomerLocation";

import MobileBottomNav from "@/components/MobileBottomNav";
import AIAssistant from "@/components/AIAssistant";
import VoiceCommands from "@/components/VoiceCommands";

const CustomerLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [cartItemCount, setCartItemCount] = useState(0);
  
  const handleBackClick = () => {
    if (location.pathname === '/customer') {
      navigate('/');
    } else {
      navigate(-1);
    }
  };

  useEffect(() => {
    const updateCartCount = async () => {
      try {
        const count = await cartService.getCartItemCount();
        setCartItemCount(count);
      } catch (error) {
        console.error('Failed to get cart count:', error);
        setCartItemCount(0);
      }
    };

    updateCartCount();
    
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Update cart count when tab becomes visible
        updateCartCount();
      }
    };
    
    // Listen for cart updates
    window.addEventListener('cartUpdated', updateCartCount);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('cartUpdated', updateCartCount);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b safe-area-top">
        <div className="container mx-auto px-3 sm:px-4 md:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
              <Button 
                onClick={handleBackClick}
                variant="ghost" 
                size="sm" 
                className="text-gray-600 hover:text-orange-500 flex-shrink-0 p-1"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
              <div className="flex flex-col min-w-0 flex-1">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                    <Package className="w-3 h-3 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <h1 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 truncate">Shirpur Delivery</h1>
                </div>
                <CustomerLocation />
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-4 xl:space-x-6">
              <nav className="flex items-center space-x-2 xl:space-x-4">
                <Link to="/customer">
                  <Button 
                    variant={isActive('/customer') ? "default" : "ghost"} 
                    className={isActive('/customer') ? "bg-orange-500 text-white hover:bg-orange-600" : "text-gray-600 hover:text-orange-500 hover:bg-orange-50"}
                    size="sm"
                  >
                    <Home className="w-4 h-4 mr-1 xl:mr-2" />
                    <span className="hidden lg:inline">Catalog</span>
                  </Button>
                </Link>
                
                <Link to="/customer/cart">
                  <Button 
                    variant={isActive('/customer/cart') ? "default" : "ghost"} 
                    className={`relative ${isActive('/customer/cart') ? "bg-orange-500 text-white hover:bg-orange-600" : "text-gray-600 hover:text-orange-500 hover:bg-orange-50"}`}
                    size="sm"
                  >
                    <ShoppingCart className="w-4 h-4 mr-1 xl:mr-2" />
                    <span className="hidden lg:inline">Cart</span>
                    {cartItemCount > 0 && (
                      <Badge className="absolute -top-2 -right-2 bg-red-500 text-white min-w-[18px] h-4 flex items-center justify-center text-xs animate-pulse">
                        {cartItemCount}
                      </Badge>
                    )}
                  </Button>
                </Link>
                
                <Link to="/customer/orders">
                  <Button 
                    variant={isActive('/customer/orders') ? "default" : "ghost"} 
                    className={isActive('/customer/orders') ? "bg-orange-500 text-white hover:bg-orange-600" : "text-gray-600 hover:text-orange-500 hover:bg-orange-50"}
                    size="sm"
                  >
                    <Package className="w-4 h-4 mr-1 xl:mr-2" />
                    <span className="hidden lg:inline">Orders</span>
                  </Button>
                </Link>
                
                <Link to="/customer/track">
                  <Button 
                    variant={isActive('/customer/track') ? "default" : "ghost"} 
                    className={isActive('/customer/track') ? "bg-orange-500 text-white hover:bg-orange-600" : "text-gray-600 hover:text-orange-500 hover:bg-orange-50"}
                    size="sm"
                  >
                    <MapPin className="w-4 h-4 mr-1 xl:mr-2" />
                    <span className="hidden lg:inline">Track</span>
                  </Button>
                </Link>
              </nav>
              
              <ProfileDropdown />
            </div>

            {/* Mobile Navigation */}
            <div className="flex lg:hidden items-center space-x-2">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-gray-600 hover:text-orange-500 btn-mobile">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-72 sm:w-80">
                  <div className="flex flex-col space-y-4 mt-6">
                    <Link to="/customer" className="w-full">
                      <Button 
                        variant={isActive('/customer') ? "default" : "ghost"} 
                        className={`w-full justify-start ${isActive('/customer') ? "bg-orange-500 text-white" : ""}`}
                        size="lg"
                      >
                        <Home className="w-4 h-4 mr-3" />
                        Catalog
                      </Button>
                    </Link>
                    
                    <Link to="/customer/cart" className="w-full">
                      <Button 
                        variant={isActive('/customer/cart') ? "default" : "ghost"} 
                        className={`w-full justify-start relative ${isActive('/customer/cart') ? "bg-orange-500 text-white" : ""}`}
                        size="lg"
                      >
                        <ShoppingCart className="w-4 h-4 mr-3" />
                        Cart
                        {cartItemCount > 0 && (
                          <Badge className="ml-auto bg-red-500 text-white">
                            {cartItemCount}
                          </Badge>
                        )}
                      </Button>
                    </Link>
                    
                    <Link to="/customer/orders" className="w-full">
                      <Button 
                        variant={isActive('/customer/orders') ? "default" : "ghost"} 
                        className={`w-full justify-start ${isActive('/customer/orders') ? "bg-orange-500 text-white" : ""}`}
                        size="lg"
                      >
                        <Package className="w-4 h-4 mr-3" />
                        Orders
                      </Button>
                    </Link>
                    
                    <Link to="/customer/track" className="w-full">
                      <Button 
                        variant={isActive('/customer/track') ? "default" : "ghost"} 
                        className={`w-full justify-start ${isActive('/customer/track') ? "bg-orange-500 text-white" : ""}`}
                        size="lg"
                      >
                        <MapPin className="w-4 h-4 mr-3" />
                        Track
                      </Button>
                    </Link>
                    
                    <div className="pt-4 border-t">
                      <ProfileDropdown />
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Mobile Navigation */}
            <div className="flex lg:hidden items-center space-x-2">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 btn-mobile">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-72 sm:w-80">
                  <div className="flex flex-col space-y-4 mt-6">
                    <Link to="/customer" className="w-full">
                      <Button 
                        variant={isActive('/customer') ? "default" : "ghost"} 
                        className="w-full justify-start"
                        size="lg"
                      >
                        <Home className="w-4 h-4 mr-3" />
                        Catalog
                      </Button>
                    </Link>
                    
                    <Link to="/customer/cart" className="w-full">
                      <Button 
                        variant={isActive('/customer/cart') ? "default" : "ghost"} 
                        className="w-full justify-start relative"
                        size="lg"
                      >
                        <ShoppingCart className="w-4 h-4 mr-3" />
                        Cart
                        {cartItemCount > 0 && (
                          <Badge className="ml-auto bg-red-500 text-white">
                            {cartItemCount}
                          </Badge>
                        )}
                      </Button>
                    </Link>
                    
                    <Link to="/customer/orders" className="w-full">
                      <Button 
                        variant={isActive('/customer/orders') ? "default" : "ghost"} 
                        className="w-full justify-start"
                        size="lg"
                      >
                        <Package className="w-4 h-4 mr-3" />
                        Orders
                      </Button>
                    </Link>
                    
                    <Link to="/customer/track" className="w-full">
                      <Button 
                        variant={isActive('/customer/track') ? "default" : "ghost"} 
                        className="w-full justify-start"
                        size="lg"
                      >
                        <MapPin className="w-4 h-4 mr-3" />
                        Track
                      </Button>
                    </Link>
                    
                    <div className="pt-4 border-t">
                      <ProfileDropdown />
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>



      {/* Main Content */}
      <main className="pb-16 lg:pb-0">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav userType="customer" />
      
      {/* AI Assistant */}
      <AIAssistant />
      
      {/* Voice Commands */}
      <VoiceCommands />
    </div>
  );
};

export default CustomerLayout;