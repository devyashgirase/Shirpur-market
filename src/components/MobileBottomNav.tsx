import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Home, ShoppingCart, Package, MapPin } from "lucide-react";
import { getCartFromStorage } from "@/lib/mockData";
import { useState, useEffect } from "react";

interface MobileBottomNavProps {
  userType: 'customer' | 'admin' | 'delivery';
}

const MobileBottomNav = ({ userType }: MobileBottomNavProps) => {
  const location = useLocation();
  const [cartItemCount, setCartItemCount] = useState(0);

  useEffect(() => {
    if (userType === 'customer') {
      const updateCartCount = () => {
        const cart = getCartFromStorage();
        const count = cart.reduce((total, item) => total + item.quantity, 0);
        setCartItemCount(count);
      };

      updateCartCount();
      window.addEventListener('cartUpdated', updateCartCount);
      return () => window.removeEventListener('cartUpdated', updateCartCount);
    }
  }, [userType]);

  const isActive = (path: string) => location.pathname === path;

  if (userType === 'customer') {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 safe-area-bottom lg:hidden">
        <div className="grid grid-cols-4 gap-1 p-2">
          <Link to="/customer" className="flex-1">
            <Button
              variant={isActive('/customer') ? "default" : "ghost"}
              className={`w-full h-14 flex flex-col items-center justify-center gap-1 ${
                isActive('/customer') ? 'bg-blue-500 text-white' : 'text-gray-600'
              }`}
              size="sm"
            >
              <Home className="w-5 h-5" />
              <span className="text-xs">Catalog</span>
            </Button>
          </Link>

          <Link to="/customer/cart" className="flex-1">
            <Button
              variant={isActive('/customer/cart') ? "default" : "ghost"}
              className={`w-full h-14 flex flex-col items-center justify-center gap-1 relative ${
                isActive('/customer/cart') ? 'bg-blue-500 text-white' : 'text-gray-600'
              }`}
              size="sm"
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="text-xs">Cart</span>
              {cartItemCount > 0 && (
                <Badge className="absolute -top-1 -right-1 bg-red-500 text-white min-w-[18px] h-4 flex items-center justify-center text-xs">
                  {cartItemCount}
                </Badge>
              )}
            </Button>
          </Link>

          <Link to="/customer/orders" className="flex-1">
            <Button
              variant={isActive('/customer/orders') ? "default" : "ghost"}
              className={`w-full h-14 flex flex-col items-center justify-center gap-1 ${
                isActive('/customer/orders') ? 'bg-blue-500 text-white' : 'text-gray-600'
              }`}
              size="sm"
            >
              <Package className="w-5 h-5" />
              <span className="text-xs">Orders</span>
            </Button>
          </Link>

          <Link to="/customer/track" className="flex-1">
            <Button
              variant={isActive('/customer/track') ? "default" : "ghost"}
              className={`w-full h-14 flex flex-col items-center justify-center gap-1 ${
                isActive('/customer/track') ? 'bg-blue-500 text-white' : 'text-gray-600'
              }`}
              size="sm"
            >
              <MapPin className="w-5 h-5" />
              <span className="text-xs">Track</span>
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return null;
};

export default MobileBottomNav;