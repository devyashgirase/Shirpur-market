import { Outlet, Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Package, Home, ArrowLeft, MapPin } from "lucide-react";
import { getCartFromStorage } from "@/lib/mockData";
import { useState, useEffect } from "react";
import ProfileDropdown from "@/components/ProfileDropdown";

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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/" className="text-primary-foreground hover:text-primary-foreground/80">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-2xl font-bold">QuickDelivery</h1>
            </div>
            
            <div className="flex items-center space-x-6">
              <nav className="flex items-center space-x-6">
                <Link to="/customer">
                  <Button 
                    variant={isActive('/customer') ? "secondary" : "ghost"} 
                    className={isActive('/customer') ? "text-secondary-foreground" : "text-primary-foreground hover:text-primary-foreground hover:bg-primary-foreground/10"}
                  >
                    <Home className="w-4 h-4 mr-2" />
                    Catalog
                  </Button>
                </Link>
                
                <Link to="/customer/cart">
                  <Button 
                    variant={isActive('/customer/cart') ? "secondary" : "ghost"} 
                    className={`relative ${isActive('/customer/cart') ? "text-secondary-foreground" : "text-primary-foreground hover:text-primary-foreground hover:bg-primary-foreground/10"}`}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Cart
                    {cartItemCount > 0 && (
                      <Badge className="absolute -top-2 -right-2 bg-accent text-accent-foreground min-w-[20px] h-5 flex items-center justify-center text-xs">
                        {cartItemCount}
                      </Badge>
                    )}
                  </Button>
                </Link>
                
                <Link to="/customer/orders">
                  <Button 
                    variant={isActive('/customer/orders') ? "secondary" : "ghost"} 
                    className={isActive('/customer/orders') ? "text-secondary-foreground" : "text-primary-foreground hover:text-primary-foreground hover:bg-primary-foreground/10"}
                  >
                    <Package className="w-4 h-4 mr-2" />
                    My Orders
                  </Button>
                </Link>
                
                <Link to="/customer/track">
                  <Button 
                    variant={isActive('/customer/track') ? "secondary" : "ghost"} 
                    className={isActive('/customer/track') ? "text-secondary-foreground" : "text-primary-foreground hover:text-primary-foreground hover:bg-primary-foreground/10"}
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    Track Order
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