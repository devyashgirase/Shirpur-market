import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { BarChart3, Package, ShoppingCart, ArrowLeft, MapPin, Truck, Menu, Settings, Brain } from "lucide-react";
import ProfileDropdown from "@/components/ProfileDropdown";
import RealTimeNotifications from "@/components/RealTimeNotifications";
const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleBackClick = () => {
    if (location.pathname === '/admin') {
      navigate('/');
    } else {
      navigate(-1);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg safe-area-top">
        <div className="container mx-auto px-3 sm:px-4 md:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
              <Button 
                onClick={handleBackClick}
                variant="ghost" 
                size="sm" 
                className="text-white hover:text-white/80 transition-colors flex-shrink-0 p-1"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
              <div className="flex items-center gap-1 sm:gap-2 min-w-0">
                <Settings className="h-4 w-4 sm:h-5 sm:h-5 md:h-6 md:w-6 flex-shrink-0" />
                <h1 className="text-base sm:text-lg md:text-2xl font-bold truncate">Admin Panel</h1>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-4">
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
                
                <Link to="/admin/delivery-agents">
                  <Button 
                    variant={isActive('/admin/delivery-agents') ? "secondary" : "ghost"} 
                    className={isActive('/admin/delivery-agents') ? "bg-white/20 text-white hover:bg-white/30" : "text-white hover:bg-white/10"}
                    size="sm"
                  >
                    <Truck className="w-4 h-4 mr-2" />
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
                
                <Link to="/admin/carousel">
                  <Button 
                    variant={isActive('/admin/carousel') ? "secondary" : "ghost"} 
                    className={isActive('/admin/carousel') ? "bg-white/20 text-white hover:bg-white/30" : "text-white hover:bg-white/10"}
                    size="sm"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Carousel
                  </Button>
                </Link>
                
                <Link to="/admin/features">
                  <Button 
                    variant={isActive('/admin/features') ? "secondary" : "ghost"} 
                    className={isActive('/admin/features') ? "bg-white/20 text-white hover:bg-white/30" : "text-white hover:bg-white/10"}
                    size="sm"
                  >
                    <Brain className="w-4 h-4 mr-2" />
                    Features
                  </Button>
                </Link>
              </nav>
              
              <ProfileDropdown />
            </div>

            {/* Mobile Navigation */}
            <div className="flex lg:hidden items-center space-x-2">
              <RealTimeNotifications userType="admin" />
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-64">
                  <div className="flex flex-col space-y-4 mt-6">
                    <Link to="/admin" className="w-full">
                      <Button 
                        variant={isActive('/admin') ? "default" : "ghost"} 
                        className="w-full justify-start"
                        size="lg"
                      >
                        <BarChart3 className="w-4 h-4 mr-3" />
                        Dashboard
                      </Button>
                    </Link>
                    
                    <Link to="/admin/products" className="w-full">
                      <Button 
                        variant={isActive('/admin/products') ? "default" : "ghost"} 
                        className="w-full justify-start"
                        size="lg"
                      >
                        <Package className="w-4 h-4 mr-3" />
                        Products
                      </Button>
                    </Link>
                    
                    <Link to="/admin/orders" className="w-full">
                      <Button 
                        variant={isActive('/admin/orders') ? "default" : "ghost"} 
                        className="w-full justify-start"
                        size="lg"
                      >
                        <ShoppingCart className="w-4 h-4 mr-3" />
                        Orders
                      </Button>
                    </Link>
                    
                    <Link to="/admin/delivery-agents" className="w-full">
                      <Button 
                        variant={isActive('/admin/delivery-agents') ? "default" : "ghost"} 
                        className="w-full justify-start"
                        size="lg"
                      >
                        <Truck className="w-4 h-4 mr-3" />
                        Delivery Agents
                      </Button>
                    </Link>
                    
                    <Link to="/admin/live-tracking" className="w-full">
                      <Button 
                        variant={isActive('/admin/live-tracking') ? "default" : "ghost"} 
                        className="w-full justify-start"
                        size="lg"
                      >
                        <Truck className="w-4 h-4 mr-3" />
                        Live Tracking
                      </Button>
                    </Link>
                    
                    <Link to="/admin/carousel" className="w-full">
                      <Button 
                        variant={isActive('/admin/carousel') ? "default" : "ghost"} 
                        className="w-full justify-start"
                        size="lg"
                      >
                        <Settings className="w-4 h-4 mr-3" />
                        Carousel
                      </Button>
                    </Link>
                    
                    <Link to="/admin/features" className="w-full">
                      <Button 
                        variant={isActive('/admin/features') ? "default" : "ghost"} 
                        className="w-full justify-start"
                        size="lg"
                      >
                        <Brain className="w-4 h-4 mr-3" />
                        Smart Features
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