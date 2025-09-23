import { Outlet, Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { BarChart3, Package, ShoppingCart, ArrowLeft, MapPin, Truck, Menu, Settings } from "lucide-react";
import ProfileDropdown from "@/components/ProfileDropdown";
import RealTimeNotifications from "@/components/RealTimeNotifications";

const AdminLayout = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link to="/" className="text-white hover:text-white/80 transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-2">
                <Settings className="h-6 w-6" />
                <h1 className="text-2xl font-bold">Admin Panel</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <RealTimeNotifications userType="admin" />
              <nav className="flex items-center space-x-2">
                <Link to="/admin">
                  <Button 
                    variant={isActive('/admin') ? "secondary" : "ghost"} 
                    className={isActive('/admin') ? "bg-white/20 text-white hover:bg-white/30" : "text-white hover:bg-white/10"}
                    size="sm"
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
                
                <Link to="/admin/products">
                  <Button 
                    variant={isActive('/admin/products') ? "secondary" : "ghost"} 
                    className={isActive('/admin/products') ? "bg-white/20 text-white hover:bg-white/30" : "text-white hover:bg-white/10"}
                    size="sm"
                  >
                    <Package className="w-4 h-4 mr-2" />
                    Products
                  </Button>
                </Link>
                
                <Link to="/admin/orders">
                  <Button 
                    variant={isActive('/admin/orders') ? "secondary" : "ghost"} 
                    className={isActive('/admin/orders') ? "bg-white/20 text-white hover:bg-white/30" : "text-white hover:bg-white/10"}
                    size="sm"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Orders
                  </Button>
                </Link>
                
                <Link to="/admin/tracking">
                  <Button 
                    variant={isActive('/admin/tracking') ? "secondary" : "ghost"} 
                    className={isActive('/admin/tracking') ? "bg-white/20 text-white hover:bg-white/30" : "text-white hover:bg-white/10"}
                    size="sm"
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    Agents
                  </Button>
                </Link>
                
                <Link to="/admin/live-tracking">
                  <Button 
                    variant={isActive('/admin/live-tracking') ? "secondary" : "ghost"} 
                    className={isActive('/admin/live-tracking') ? "bg-white/20 text-white hover:bg-white/30" : "text-white hover:bg-white/10"}
                    size="sm"
                  >
                    <Truck className="w-4 h-4 mr-2" />
                    Live
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

export default AdminLayout;