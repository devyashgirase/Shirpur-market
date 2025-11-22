import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Shield, Truck, Star, Package, MapPin } from "lucide-react";
import { authService } from "@/lib/authService";

const PersonalizedWelcome = () => {
  const currentUser = authService.getCurrentUser();
  
  if (!currentUser) return null;

  const getWelcomeContent = () => {
    switch (currentUser.role) {
      case 'customer':
        return {
          title: `Welcome back, ${currentUser.name || 'Customer'}!`,
          subtitle: "Discover fresh products and great deals",
          icon: <ShoppingBag className="w-8 h-8 text-blue-600" />,
          bgGradient: "from-blue-500 to-purple-600",
          features: [
            { icon: <Package className="w-4 h-4" />, text: "Browse 500+ products" },
            { icon: <Star className="w-4 h-4" />, text: "Earn loyalty points" },
            { icon: <MapPin className="w-4 h-4" />, text: "Real-time tracking" }
          ],
          stats: [
            { label: "Orders Placed", value: "12" },
            { label: "Loyalty Points", value: "450" },
            { label: "Saved Amount", value: "₹280" }
          ]
        };
      
      case 'admin':
        return {
          title: `Admin Dashboard - ${currentUser.name || 'Administrator'}`,
          subtitle: "Manage your delivery system efficiently",
          icon: <Shield className="w-8 h-8 text-purple-600" />,
          bgGradient: "from-purple-500 to-pink-600",
          features: [
            { icon: <Package className="w-4 h-4" />, text: "Manage inventory" },
            { icon: <Truck className="w-4 h-4" />, text: "Track deliveries" },
            { icon: <Star className="w-4 h-4" />, text: "View analytics" }
          ],
          stats: [
            { label: "Active Orders", value: "24" },
            { label: "Products", value: "156" },
            { label: "Revenue Today", value: "₹12,450" }
          ]
        };
      
      case 'delivery':
        return {
          title: `Hello, ${currentUser.name || 'Delivery Partner'}!`,
          subtitle: "Ready to deliver happiness today?",
          icon: <Truck className="w-8 h-8 text-green-600" />,
          bgGradient: "from-green-500 to-teal-600",
          features: [
            { icon: <MapPin className="w-4 h-4" />, text: "GPS navigation" },
            { icon: <Package className="w-4 h-4" />, text: "Order management" },
            { icon: <Star className="w-4 h-4" />, text: "Earnings tracker" }
          ],
          stats: [
            { label: "Pending Deliveries", value: "5" },
            { label: "Completed Today", value: "8" },
            { label: "Earnings Today", value: "₹640" }
          ]
        };
      
      default:
        return null;
    }
  };

  const content = getWelcomeContent();
  if (!content) return null;

  return (
    <Card className="mb-6 overflow-hidden">
      <div className={`bg-gradient-to-r ${content.bgGradient} p-6 text-white`}>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              {content.icon}
              <div>
                <h2 className="text-xl font-bold">{content.title}</h2>
                <p className="text-white/90 text-sm">{content.subtitle}</p>
              </div>
            </div>
            
            {/* Role Badge */}
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
              {currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)} Account
            </Badge>
          </div>
          
          {/* Phone Display */}
          <div className="text-right">
            <p className="text-white/80 text-xs">Logged in as</p>
            <p className="font-mono text-sm">+91 {currentUser.phone}</p>
          </div>
        </div>
      </div>
      
      <CardContent className="p-6">
        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {content.features.map((feature, index) => (
            <div key={index} className="flex items-center space-x-2 text-sm text-gray-600">
              {feature.icon}
              <span>{feature.text}</span>
            </div>
          ))}
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {content.stats.map((stat, index) => (
            <div key={index} className="text-center">
              <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PersonalizedWelcome;