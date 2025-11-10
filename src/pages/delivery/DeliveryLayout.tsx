import { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Truck, List, ArrowLeft, Menu, Navigation, MapPin, Bell, User, Package } from "lucide-react";
import ProfileDropdown from "@/components/ProfileDropdown";
import RealTimeNotifications from "@/components/RealTimeNotifications";
import { LanguageProvider } from "@/components/LanguageProvider";
// i18n disabled
import { orderManagementService } from "@/lib/orderManagementService";

const DeliveryLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const t = (key: string) => key;
  const [newOrdersCount, setNewOrdersCount] = useState(0);
  const [activeOrdersCount, setActiveOrdersCount] = useState(0);

  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    const loadCounts = async () => {
      // New orders count for notifications
      const newOrdersResult = await orderManagementService.getOrdersReadyForDelivery();
      if (newOrdersResult.success) {
        setNewOrdersCount(newOrdersResult.orders.length);
      }
      
      // Active orders count for orders tab (using same method as DeliveryOutForDelivery)
      const outForDeliveryResult = await orderManagementService.getOrdersOutForDelivery();
      if (outForDeliveryResult.success) {
        const { deliveryAuthService } = await import('@/lib/deliveryAuthService');
        const currentUser = await deliveryAuthService.getCurrentAgent();
        
        if (currentUser) {
          // Only count orders assigned to current agent
          const myOrders = outForDeliveryResult.orders.filter(order => 
            order.delivery_agent_id === currentUser.id
          );
          setActiveOrdersCount(myOrders.length);
        } else {
          setActiveOrdersCount(0);
        }
      } else {
        setActiveOrdersCount(0);
      }
    };

    loadCounts();
    const interval = setInterval(loadCounts, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleBackNavigation = () => {
    if (location.pathname === '/delivery') {
      navigate('/home');
    } else {
      navigate('/delivery');
    }
  };

  const navItems = [
    { path: '/delivery', icon: List, label: t('nav.home'), activeColor: 'text-blue-600' },
    { path: '/delivery/tracking', icon: MapPin, label: 'Track', activeColor: 'text-green-600' },
    { path: '/delivery/notifications', icon: Bell, label: t('nav.notifications'), activeColor: 'text-orange-600', count: newOrdersCount },
    { path: '/delivery/out-for-delivery', icon: Package, label: t('nav.orders'), activeColor: 'text-red-600', count: activeOrdersCount },
    { path: '/delivery/profile', icon: User, label: t('nav.profile'), activeColor: 'text-purple-600' }
  ];

  return (
    <LanguageProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 pb-16 md:pb-0">
      {/* Mobile Header */}
      <header className="md:hidden bg-gradient-to-r from-blue-600 to-orange-600 text-white shadow-lg sticky top-0 z-40">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button 
                onClick={handleBackNavigation}
                className="text-white hover:text-white/80 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                <h1 className="text-lg font-bold">{t('delivery.tasks')}</h1>
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
              <button 
                onClick={handleBackNavigation}
                className="text-white hover:text-white/80 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2">
                <Truck className="h-6 w-6" />
                <h1 className="text-2xl font-bold">{t('delivery.tasks')}</h1>
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
                      <div className="relative flex items-center">
                        <item.icon className="w-4 h-4 mr-2" />
                        {item.count && item.count > 0 && (
                          <span className="absolute -top-2 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {item.count > 9 ? '9+' : item.count}
                          </span>
                        )}
                      </div>
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
        <div className="grid grid-cols-5 h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center space-y-1 transition-colors relative ${
                  active ? item.activeColor : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 ${active ? 'scale-110' : ''} transition-transform`} />
                  {item.count && item.count > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                      {item.count > 9 ? '9+' : item.count}
                    </span>
                  )}
                </div>
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
    </LanguageProvider>
  );
};

export default DeliveryLayout;