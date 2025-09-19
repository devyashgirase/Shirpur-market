import { Outlet, Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Truck, List, ArrowLeft, Menu } from "lucide-react";
import ProfileDropdown from "@/components/ProfileDropdown";

const DeliveryLayout = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-accent text-accent-foreground shadow-lg">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link to="/" className="text-accent-foreground hover:text-accent-foreground/80">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-xl md:text-2xl font-bold">Delivery Portal</h1>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <nav className="flex items-center space-x-4">
                <Link to="/delivery">
                  <Button 
                    variant={isActive('/delivery') ? "secondary" : "ghost"} 
                    className={!isActive('/delivery') ? "text-accent-foreground hover:text-accent-foreground hover:bg-accent-foreground/10" : ""}
                    size="sm"
                  >
                    <List className="w-4 h-4 mr-2" />
                    My Tasks
                  </Button>
                </Link>
                
                <Link to="/delivery/notifications">
                  <Button 
                    variant={isActive('/delivery/notifications') ? "secondary" : "ghost"} 
                    className={!isActive('/delivery/notifications') ? "text-accent-foreground hover:text-accent-foreground hover:bg-accent-foreground/10" : ""}
                    size="sm"
                  >
                    <Truck className="w-4 h-4 mr-2" />
                    New Orders
                  </Button>
                </Link>
              </nav>
              
              <ProfileDropdown />
            </div>
            
            {/* Mobile Navigation */}
            <div className="md:hidden flex items-center space-x-2">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-accent-foreground">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-64">
                  <div className="flex flex-col space-y-4 mt-8">
                    <Link to="/delivery" className="w-full">
                      <Button 
                        variant={isActive('/delivery') ? "default" : "ghost"} 
                        className="w-full justify-start"
                      >
                        <List className="w-4 h-4 mr-3" />
                        My Tasks
                      </Button>
                    </Link>
                    
                    <Link to="/delivery/notifications" className="w-full">
                      <Button 
                        variant={isActive('/delivery/notifications') ? "default" : "ghost"} 
                        className="w-full justify-start"
                      >
                        <Truck className="w-4 h-4 mr-3" />
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