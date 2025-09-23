import { Outlet, Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Truck, List, ArrowLeft, Menu, Navigation } from "lucide-react";
import ProfileDropdown from "@/components/ProfileDropdown";
import RealTimeNotifications from "@/components/RealTimeNotifications";

const DeliveryLayout = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      <header className="bg-gradient-to-r from-blue-600 to-orange-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link to="/" className="text-white hover:text-white/80 transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-2">
                <Truck className="h-6 w-6" />
                <h1 className="text-2xl font-bold">Delivery Portal</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <RealTimeNotifications userType="delivery" />
              <nav className="flex items-center space-x-2">
                <Link to="/delivery">
                  <Button 
                    variant={isActive('/delivery') ? "secondary" : "ghost"} 
                    className={isActive('/delivery') ? "bg-white/20 text-white hover:bg-white/30" : "text-white hover:bg-white/10"}
                    size="sm"
                  >
                    <List className="w-4 h-4 mr-2" />
                    My Tasks
                  </Button>
                </Link>
                
                <Link to="/delivery/notifications">
                  <Button 
                    variant={isActive('/delivery/notifications') ? "secondary" : "ghost"} 
                    className={isActive('/delivery/notifications') ? "bg-white/20 text-white hover:bg-white/30" : "text-white hover:bg-white/10"}
                    size="sm"
                  >
                    <Navigation className="w-4 h-4 mr-2" />
                    New Orders
                  </Button>
                </Link>
              </nav>
              
              <ProfileDropdown />
            </div>

          </div>
        </div>
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default DeliveryLayout;