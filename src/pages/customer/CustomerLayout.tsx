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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground shadow-lg">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link to="/" className="text-primary-foreground hover:text-primary-foreground/80">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-xl md:text-2xl font-bold">Shirpur Delivery</h1>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <RealTimeNotifications userType="customer" />
              <nav className="flex items-center space-x-4">
                <Link to="/customer">
                  <Button 
                    variant={isActive('/customer') ? "secondary" : "ghost"} 
                    className={isActive('/customer') ? "text-secondary-foreground" : "text-primary-foreground hover:text-primary-foreground hover:bg-primary-foreground/10"}
                    size="sm"
                  >
                    <Home className="w-4 h-4 mr-2" />
                    Catalog
                  </Button>
                </Link>
                
                <Link to="/customer/cart">
                  <Button 
                    variant={isActive('/customer/cart') ? "secondary" : "ghost"} 
                    className={`relative ${isActive('/customer/cart') ? "text-secondary-foreground" : "text-primary-foreground hover:text-primary-foreground hover:bg-primary-foreground/10"}`}
                    size="sm"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Cart
                    {cartItemCount > 0 && (
                      <Badge className="absolute -top-2 -right-2 bg-accent text-accent-foreground min-w-[18px] h-4 flex items-center justify-center text-xs">
                        {cartItemCount}
                      </Badge>
                    )}
                  </Button>
                </Link>
                
                <Link to="/customer/orders">
                  <Button 
                    variant={isActive('/customer/orders') ? "secondary" : "ghost"} 
                    className={isActive('/customer/orders') ? "text-secondary-foreground" : "text-primary-foreground hover:text-primary-foreground hover:bg-primary-foreground/10"}
                    size="sm"
                  >
                    <Package className="w-4 h-4 mr-2" />
                    Orders
                  </Button>
                </Link>
                
                <Link to="/customer/track">
                  <Button 
                    variant={isActive('/customer/track') ? "secondary" : "ghost"} 
                    className={isActive('/customer/track') ? "text-secondary-foreground" : "text-primary-foreground hover:text-primary-foreground hover:bg-primary-foreground/10"}
                    size="sm"
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    Track
                  </Button>
                </Link>
              </nav>
              
              <ProfileDropdown />
            </div>
            
            {/* Mobile Navigation */}
            <div className="md:hidden flex items-center space-x-2">
              <RealTimeNotifications userType="customer" />
              <Link to="/customer/cart" className="relative">
                <Button variant="ghost" size="sm" className="text-primary-foreground">
                  <ShoppingCart className="w-5 h-5" />
                  {cartItemCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 bg-accent text-accent-foreground min-w-[16px] h-4 flex items-center justify-center text-xs">
                      {cartItemCount}
                    </Badge>
                  )}
                </Button>
              </Link>
              
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-primary-foreground">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-64">
                  <div className="flex flex-col space-y-4 mt-8">
                    <Link to="/customer" className="w-full">
                      <Button 
                        variant={isActive('/customer') ? "default" : "ghost"} 
                        className="w-full justify-start"
                      >
                        <Home className="w-4 h-4 mr-3" />
                        Catalog
                      </Button>
                    </Link>
                    
                    <Link to="/customer/cart" className="w-full">
                      <Button 
                        variant={isActive('/customer/cart') ? "default" : "ghost"} 
                        className="w-full justify-start relative"
                      >
                        <ShoppingCart className="w-4 h-4 mr-3" />
                        Cart
                        {cartItemCount > 0 && (
                          <Badge className="ml-auto bg-primary text-primary-foreground">
                            {cartItemCount}
                          </Badge>
                        )}
                      </Button>
                    </Link>
                    
                    <Link to="/customer/orders" className="w-full">
                      <Button 
                        variant={isActive('/customer/orders') ? "default" : "ghost"} 
                        className="w-full justify-start"
                      >
                        <Package className="w-4 h-4 mr-3" />
                        My Orders
                      </Button>
                    </Link>
                    
                    <Link to="/customer/track" className="w-full">
                      <Button 
                        variant={isActive('/customer/track') ? "default" : "ghost"} 
                        className="w-full justify-start"
                      >
                        <MapPin className="w-4 h-4 mr-3" />
                        Track Order
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
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default CustomerLayout;