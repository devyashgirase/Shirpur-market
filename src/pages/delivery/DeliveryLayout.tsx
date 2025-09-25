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
      <header className="bg-gradient-to-r from-blue-600 to-orange-600 text-white shadow-lg safe-area-top">
        <div className="container mx-auto px-3 sm:px-4 md:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
              <Link to="/" className="text-white hover:text-white/80 transition-colors flex-shrink-0">
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </Link>
              <div className="flex items-center gap-1 sm:gap-2 min-w-0">
                <Truck className="h-4 w-4 sm:h-5 sm:h-5 md:h-6 md:w-6 flex-shrink-0" />
                <h1 className="text-base sm:text-lg md:text-2xl font-bold truncate">Delivery Portal</h1>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
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

            {/* Mobile Navigation */}
            <div className="flex md:hidden items-center space-x-2">
              <RealTimeNotifications userType="delivery" />
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-64">
                  <div className="flex flex-col space-y-4 mt-6">
                    <Link to="/delivery" className="w-full">
                      <Button 
                        variant={isActive('/delivery') ? "default" : "ghost"} 
                        className="w-full justify-start"
                        size="lg"
                      >
                        <List className="w-4 h-4 mr-3" />
                        My Tasks
                      </Button>
                    </Link>
                    
                    <Link to="/delivery/notifications" className="w-full">
                      <Button 
                        variant={isActive('/delivery/notifications') ? "default" : "ghost"} 
                        className="w-full justify-start"
                        size="lg"
                      >
                        <Navigation className="w-4 h-4 mr-3" />
                        New Orders
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

      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default DeliveryLayout;