import { Outlet, Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ShoppingCart, Package, Home, ArrowLeft, MapPin, Menu } from "lucide-react";
import { getCartFromStorage } from "@/lib/mockData";
import { useState, useEffect } from "react";
import ProfileDropdown from "@/components/ProfileDropdown";
import RealTimeNotifications from "@/components/RealTimeNotifications";

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
      <header className="bg-gradient-to-r from-blue-600 to-green-600 text-white shadow-xl">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link to="/" className="text-primary-foreground hover:text-primary-foreground/80">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-2xl font-bold">🛒 Shirpur Delivery</h1>
            </div>
            
            <div className="flex items-center space-x-6">
              <RealTimeNotifications userType="customer" />
              <nav className="flex items-center space-x-4">
                <Link to="/customer">
                  <Button 
                    variant={isActive('/customer') ? "secondary" : "ghost"} 
                    className={isActive('/customer') ? "bg-white text-blue-600" : "text-white hover:bg-white/20"}
                    size="sm"
                  >
                    <Home className="w-4 h-4 mr-2" />
                    Catalog
                  </Button>
                </Link>
                
                <Link to="/customer/cart">
                  <Button 
                    variant={isActive('/customer/cart') ? "secondary" : "ghost"} 
                    className={`relative ${isActive('/customer/cart') ? "bg-white text-blue-600" : "text-white hover:bg-white/20"}`}
                    size="sm"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Cart
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
                    <Package className="w-4 h-4 mr-2" />
                    Orders
                  </Button>
                </Link>
                
                <Link to="/customer/track">
                  <Button 
                    variant={isActive('/customer/track') ? "secondary" : "ghost"} 
                    className={isActive('/customer/track') ? "bg-white text-blue-600" : "text-white hover:bg-white/20"}
                    size="sm"
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    Track
                  </Button>
                </Link>
              </nav>
              
              <ProfileDropdown />
            </div>

          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        <Outlet />
      </main>


    </div>
  );
};

export default CustomerLayout;