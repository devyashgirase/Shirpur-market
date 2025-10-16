import { Outlet, Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Truck, List, ArrowLeft, Menu, Navigation, MapPin, Bell, User } from "lucide-react";
import ProfileDropdown from "@/components/ProfileDropdown";
import RealTimeNotifications from "@/components/RealTimeNotifications";

const DeliveryLayout = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/delivery', icon: List, label: 'Tasks', activeColor: 'text-blue-600' },
    { path: '/delivery/tracking', icon: MapPin, label: 'Track', activeColor: 'text-green-600' },
    { path: '/delivery/notifications', icon: Bell, label: 'Orders', activeColor: 'text-orange-600' },
    { path: '/delivery/profile', icon: User, label: 'Profile', activeColor: 'text-purple-600' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 pb-16 md:pb-0">
      {/* Mobile Header */}
      <header className="md:hidden bg-gradient-to-r from-blue-600 to-orange-600 text-white shadow-lg sticky top-0 z-40">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link to="/" className="text-white hover:text-white/80 transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                <h1 className="text-lg font-bold">Delivery</h1>
              </div>
            </div>
            <RealTimeNotifications userType="delivery" />
          </div>
        </div>
      </header>

      {/* Desktop Header */}
      <header className="hidden md:block bg-gradient-to-r from-blue-600 to-orange-600 text-white shadow-lg">
        <div className="container mx-auto px-6 py-4">
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
                {navItems.map((item) => (
                  <Link key={item.path} to={item.path}>
                    <Button 
                      variant={isActive(item.path) ? "secondary" : "ghost"} 
                      className={isActive(item.path) ? "bg-white/20 text-white hover:bg-white/30" : "text-white hover:bg-white/10"}
                      size="sm"
                    >
                      <item.icon className="w-4 h-4 mr-2" />
                      {item.label}
                    </Button>
                  </Link>
                ))}
              </nav>
              <ProfileDropdown />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="grid grid-cols-4 h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
                  active ? item.activeColor : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? 'scale-110' : ''} transition-transform`} />
                <span className={`text-xs font-medium ${active ? 'font-semibold' : ''}`}>
                  {item.label}
                </span>
                {active && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-current rounded-b-full" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default DeliveryLayout;