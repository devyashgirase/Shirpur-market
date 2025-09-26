import { Outlet, Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ShoppingCart, Package, Home, ArrowLeft, MapPin, Menu } from "lucide-react";
import { getCartFromStorage } from "@/lib/mockData";
import { useState, useEffect } from "react";
import ProfileDropdown from "@/components/ProfileDropdown";

import MobileBottomNav from "@/components/MobileBottomNav";

const CustomerLayout = () => {
  const location = useLocation();
  const [cartItemCount, setCartItemCount] = useState(0);

  useEffect(() => {
    const updateCartCount = () => {
      const cart = getCartFromStorage();
      const count = cart.reduce((total, item) => total + item.quantity, 0);
      setCartItemCount(count);
    };

    updateCartCount();
    
    // Listen for cart updates
    window.addEventListener('cartUpdated', updateCartCount);
    return () => window.removeEventListener('cartUpdated', updateCartCount);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-green-600 text-white shadow-xl safe-area-top">
        <div className="container mx-auto px-3 sm:px-4 md:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
              <Link to="/" className="text-primary-foreground hover:text-primary-foreground/80 flex-shrink-0">
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </Link>
              <h1 className="text-base sm:text-lg md:text-2xl font-bold truncate">🛒 Shirpur Delivery</h1>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-4 xl:space-x-6">
              <nav className="flex items-center space-x-2 xl:space-x-4">
                <Link to="/customer">
                  <Button 
                    variant={isActive('/customer') ? "secondary" : "ghost"} 
                    className={isActive('/customer') ? "bg-white text-blue-600" : "text-white hover:bg-white/20"}
                    size="sm"
                  >
                    <Home className="w-4 h-4 mr-1 xl:mr-2" />
                    <span className="hidden xl:inline">Catalog</span>
                  </Button>
                </Link>
                
                <Link to="/customer/cart">
                  <Button 
                    variant={isActive('/customer/cart') ? "secondary" : "ghost"} 
                    className={`relative ${isActive('/customer/cart') ? "bg-white text-blue-600" : "text-white hover:bg-white/20"}`}
                    size="sm"
                  >
                    <ShoppingCart className="w-4 h-4 mr-1 xl:mr-2" />
                    <span className="hidden xl:inline">Cart</span>
                    {cartItemCount > 0 && (
                      <Badge className="absolute -top-2 -right-2 bg-red-500 text-white min-w-[18px] h-4 flex items-center justify-center text-xs animate-pulse">
                        {cartItemCount}
                      </Badge>
                    )}
                  </Button>
                </Link>
                
                <Link to="/customer/orders">
                  <Button 
                    variant={isActive('/customer/orders') ? "secondary" : "ghost"} 
                    className={isActive('/customer/orders') ? "bg-white text-blue-600" : "text-white hover:bg-white/20"}
                    size="sm"
                  >
                    <Package className="w-4 h-4 mr-1 xl:mr-2" />
                    <span className="hidden xl:inline">Orders</span>
                  </Button>
                </Link>
                
                <Link to="/customer/track">
                  <Button 
                    variant={isActive('/customer/track') ? "secondary" : "ghost"} 
                    className={isActive('/customer/track') ? "bg-white text-blue-600" : "text-white hover:bg-white/20"}
                    size="sm"
                  >
                    <MapPin className="w-4 h-4 mr-1 xl:mr-2" />
                    <span className="hidden xl:inline">Track</span>
                  </Button>
                </Link>
              </nav>
              
              <ProfileDropdown />
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
    </div>
  );
};

export default CustomerLayout;