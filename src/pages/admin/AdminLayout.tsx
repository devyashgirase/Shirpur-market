import { Outlet, Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { BarChart3, Package, ShoppingCart, ArrowLeft, MapPin, Truck, Menu } from "lucide-react";
import ProfileDropdown from "@/components/ProfileDropdown";

const AdminLayout = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-secondary text-secondary-foreground shadow-lg">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link to="/" className="text-secondary-foreground hover:text-secondary-foreground/80">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-xl md:text-2xl font-bold">Admin Panel</h1>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-4">
              <nav className="flex items-center space-x-3">
                <Link to="/admin">
                  <Button 
                    variant={isActive('/admin') ? "default" : "ghost"} 
                    className={!isActive('/admin') ? "text-secondary-foreground hover:text-secondary-foreground hover:bg-secondary-foreground/10" : ""}
                    size="sm"
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
                
                <Link to="/admin/products">
                  <Button 
                    variant={isActive('/admin/products') ? "default" : "ghost"} 
                    className={!isActive('/admin/products') ? "text-secondary-foreground hover:text-secondary-foreground hover:bg-secondary-foreground/10" : ""}
                    size="sm"
                  >
                    <Package className="w-4 h-4 mr-2" />
                    Products
                  </Button>
                </Link>
                
                <Link to="/admin/orders">
                  <Button 
                    variant={isActive('/admin/orders') ? "default" : "ghost"} 
                    className={!isActive('/admin/orders') ? "text-secondary-foreground hover:text-secondary-foreground hover:bg-secondary-foreground/10" : ""}
                    size="sm"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Orders
                  </Button>
                </Link>
                
                <Link to="/admin/tracking">
                  <Button 
                    variant={isActive('/admin/tracking') ? "default" : "ghost"} 
                    className={!isActive('/admin/tracking') ? "text-secondary-foreground hover:text-secondary-foreground hover:bg-secondary-foreground/10" : ""}
                    size="sm"
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    Agents
                  </Button>
                </Link>
                
                <Link to="/admin/live-tracking">
                  <Button 
                    variant={isActive('/admin/live-tracking') ? "default" : "ghost"} 
                    className={!isActive('/admin/live-tracking') ? "text-secondary-foreground hover:text-secondary-foreground hover:bg-secondary-foreground/10" : ""}
                    size="sm"
                  >
                    <Truck className="w-4 h-4 mr-2" />
                    Live
                  </Button>
                </Link>
              </nav>
              
              <ProfileDropdown />
            </div>
            
            {/* Mobile Navigation */}
            <div className="lg:hidden flex items-center space-x-2">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-secondary-foreground">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-64">
                  <div className="flex flex-col space-y-4 mt-8">
                    <Link to="/admin" className="w-full">
                      <Button 
                        variant={isActive('/admin') ? "default" : "ghost"} 
                        className="w-full justify-start"
                      >
                        <BarChart3 className="w-4 h-4 mr-3" />
                        Dashboard
                      </Button>
                    </Link>
                    
                    <Link to="/admin/products" className="w-full">
                      <Button 
                        variant={isActive('/admin/products') ? "default" : "ghost"} 
                        className="w-full justify-start"
                      >
                        <Package className="w-4 h-4 mr-3" />
                        Products
                      </Button>
                    </Link>
                    
                    <Link to="/admin/orders" className="w-full">
                      <Button 
                        variant={isActive('/admin/orders') ? "default" : "ghost"} 
                        className="w-full justify-start"
                      >
                        <ShoppingCart className="w-4 h-4 mr-3" />
                        Orders
                      </Button>
                    </Link>
                    
                    <Link to="/admin/tracking" className="w-full">
                      <Button 
                        variant={isActive('/admin/tracking') ? "default" : "ghost"} 
                        className="w-full justify-start"
                      >
                        <MapPin className="w-4 h-4 mr-3" />
                        Agent Tracking
                      </Button>
                    </Link>
                    
                    <Link to="/admin/live-tracking" className="w-full">
                      <Button 
                        variant={isActive('/admin/live-tracking') ? "default" : "ghost"} 
                        className="w-full justify-start"
                      >
                        <Truck className="w-4 h-4 mr-3" />
                        Live Orders
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

export default AdminLayout;