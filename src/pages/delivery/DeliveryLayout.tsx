import { Outlet, Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Truck, List, ArrowLeft } from "lucide-react";
import ProfileDropdown from "@/components/ProfileDropdown";

const DeliveryLayout = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-accent text-accent-foreground shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/" className="text-accent-foreground hover:text-accent-foreground/80">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-2xl font-bold">Delivery Portal</h1>
            </div>
            
            <div className="flex items-center space-x-6">
              <nav className="flex items-center space-x-6">
                <Link to="/delivery">
                  <Button 
                    variant={isActive('/delivery') ? "secondary" : "ghost"} 
                    className={!isActive('/delivery') ? "text-accent-foreground hover:text-accent-foreground hover:bg-accent-foreground/10" : ""}
                  >
                    <List className="w-4 h-4 mr-2" />
                    My Tasks
                  </Button>
                </Link>
                
                <Link to="/delivery/notifications">
                  <Button 
                    variant={isActive('/delivery/notifications') ? "secondary" : "ghost"} 
                    className={!isActive('/delivery/notifications') ? "text-accent-foreground hover:text-accent-foreground hover:bg-accent-foreground/10" : ""}
                  >
                    <Truck className="w-4 h-4 mr-2" />
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