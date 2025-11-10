import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, DollarSign, Navigation, Truck, Star, TrendingUp, Package, CheckCircle, Headphones } from "lucide-react";
import { DeliveryDataService } from "@/lib/deliveryDataService";
import { DeliveryOrderService, DeliveryOrder } from "@/lib/deliveryOrderService";
import { useNavigate } from "react-router-dom";
import AttractiveLoader from "@/components/AttractiveLoader";
import PersonalizedWelcome from "@/components/PersonalizedWelcome";
import { deliveryCoordinationService, type OrderLocation } from "@/lib/deliveryCoordinationService";
import { deliveryAuthService } from "@/lib/deliveryAuthService";
import { supabaseApi } from "@/lib/supabase";
import { t } from "@/lib/i18n";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const DeliveryTasks = () => {
  const navigate = useNavigate();
  const [deliveryTasks, setDeliveryTasks] = useState([]);
  const [nearbyOrders, setNearbyOrders] = useState<OrderLocation[]>([]);
  const [deliveryOrders, setDeliveryOrders] = useState<DeliveryOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [agentId, setAgentId] = useState<string | null>(null);
  const [currentLocationName, setCurrentLocationName] = useState('Getting location...');
  const [weeklyEarnings, setWeeklyEarnings] = useState(0);
  const [metrics, setMetrics] = useState({
    activeTasks: 0,
    availableOrders: 0,
    todaysEarnings: 0,
    completionRate: 95,
    completedOrders: 0
  });

  useEffect(() => {
    const checkAuth = async () => {
      const currentAgent = await deliveryAuthService.getCurrentAgent();
      if (!currentAgent) {
        navigate('/delivery/login');
        return;
      }
      setAgentId(currentAgent.userId);
    };
    
    checkAuth();
    
    const loadDeliveryData = async () => {
      if (!agentId) return;
      
      try {
        const outForDeliveryOrders = await DeliveryOrderService.getDeliveryOrders();
        setDeliveryOrders(outForDeliveryOrders);
        
        const tasks = await DeliveryDataService.getAvailableDeliveries(agentId);
        setDeliveryTasks(tasks);
        setMetrics(DeliveryDataService.getDeliveryMetrics(tasks));
        
        const nearby = deliveryCoordinationService.findNearbyOrders(agentId);
        setNearbyOrders(nearby);
      } catch (error) {
        console.error('Failed to load delivery data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadDeliveryData();
  }, [navigate, agentId]);

  const handleAcceptDelivery = async (orderId: string) => {
    if (!agentId) return;
    
    try {
      await supabaseApi.updateOrderStatus(parseInt(orderId), 'out_for_delivery', agentId);
      const success = deliveryCoordinationService.acceptOrder(agentId, orderId);
      
      if (success) {
        navigate('/delivery/tracking');
      } else {
        alert('❌ Failed to accept order. Please try again.');
      }
    } catch (error) {
      console.error('Error accepting delivery:', error);
      alert('❌ Error accepting delivery. Please try again.');
    }
  };

  if (loading) {
    return <AttractiveLoader type="delivery" message="Loading delivery tasks..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      <div className="bg-gradient-to-r from-blue-600 to-orange-600 text-white p-4 sm:p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Truck className="h-8 w-8" />
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">{t('delivery.tasks')}</h1>
              <p className="text-blue-100 mt-1">{t('delivery.manageDeliveries')}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <LanguageSwitcher />
            <Button 
              variant="outline" 
              className="bg-green-500/20 text-white border-green-300/30 hover:bg-green-500/30"
              onClick={() => {
                alert('📚 Help: Contact admin for any delivery issues, payment problems, or technical support.');
              }}
            >
              <Headphones className="w-4 h-4 mr-2" />
              {t('delivery.support')}
            </Button>
            
            <Button 
              variant="outline" 
              className="bg-white/20 text-white border-white/30 hover:bg-white/30"
              onClick={async () => {
                if (!agentId) return;
                const orders = await DeliveryOrderService.getDeliveryOrders();
                setDeliveryOrders(orders);
                alert(`✅ Refreshed! Found ${orders.length} total orders`);
              }}
            >
              🔄 {t('delivery.refresh')}
            </Button>
            
            <Button 
              variant="outline" 
              className="bg-red-500/20 text-white border-red-300/30 hover:bg-red-500/30"
              onClick={() => {
                deliveryAuthService.logout();
                navigate('/delivery/login');
              }}
            >
              {t('delivery.logout')}
            </Button>
          </div>
        </div>
      </div>

      <div className="p-3 md:p-6 space-y-4 md:space-y-6">
        <PersonalizedWelcome />
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{t('delivery.quickStats')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex justify-between">
                <span className="text-sm">{t('delivery.avgDeliveryTime')}</span>
                <span className="font-semibold">N/A</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">{t('delivery.customerRating')}</span>
                <span className="font-semibold">N/A</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">{t('delivery.weeklyEarnings')}</span>
                <span className="font-semibold text-green-600">₹{weeklyEarnings}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-3 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-xs md:text-sm font-medium">{t('delivery.activeTasks')}</p>
                  <p className="text-xl md:text-3xl font-bold mt-1">{metrics.activeTasks}</p>
                </div>
                <Package className="h-6 w-6 md:h-8 md:w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">{t('delivery.todaysEarnings')}</p>
                  <p className="text-2xl sm:text-3xl font-bold mt-1">₹{metrics.todaysEarnings}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">{t('delivery.completionRate')}</p>
                  <p className="text-2xl sm:text-3xl font-bold mt-1">{metrics.completionRate}%</p>
                </div>
                <Star className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">{t('delivery.performance')}</p>
                  <p className="text-2xl sm:text-3xl font-bold mt-1">⭐⭐⭐⭐⭐</p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ready for Delivery Orders Section */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-xl font-bold text-gray-800">📦 {t('delivery.readyForDelivery')}</h2>
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              {deliveryOrders.filter(order => order.order_status === 'ready_for_delivery').length}
            </Badge>
          </div>

          {deliveryOrders.filter(order => order.order_status === 'ready_for_delivery').length === 0 ? (
            <Card className="border-2 border-dashed border-gray-200">
              <CardContent className="p-8 text-center">
                <Package className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">{t('delivery.noOrdersReady')}</h3>
                <p className="text-gray-500">{t('delivery.ordersMarkedReady')}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {deliveryOrders.filter(order => order.order_status === 'ready_for_delivery').map((order) => (
                <Card key={order.id} className="hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-blue-50 border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-lg font-bold text-gray-800">Order #{order.id.slice(-8)}</h3>
                        <Badge className="bg-blue-500 text-white mt-1">📦 {t('delivery.readyForDelivery')}</Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-blue-600">₹{order.total_amount}</p>
                      </div>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg mb-3 border border-gray-200">
                      <div className="flex items-center gap-2 mb-3">
                        <MapPin className="w-5 h-5 text-red-500" />
                        <span className="font-bold text-gray-800">📋 {t('delivery.customerDetails')}</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded font-medium">{t('delivery.name')}</span>
                          <span className="font-semibold text-gray-800">{order.customer_name}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded font-medium">{t('delivery.address')}</span>
                          <span className="text-sm text-gray-700 flex-1">{order.customer_address}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded font-medium">{t('delivery.phone')}</span>
                          <a href={`tel:${order.customer_phone}`} className="text-sm font-medium text-blue-600 hover:underline">
                            📞 {order.customer_phone}
                          </a>
                        </div>
                      </div>
                    </div>

                    <Button 
                      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-md"
                      onClick={() => handleAcceptDelivery(order.id)}
                    >
                      <Truck className="w-4 h-4 mr-2" />
                      {t('delivery.acceptStartDelivery')}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Out for Delivery Orders Section */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-xl font-bold text-gray-800">🚚 {t('delivery.ordersOutForDelivery')}</h2>
            <Badge variant="secondary" className="bg-orange-100 text-orange-700">
              {deliveryOrders.filter(order => order.order_status === 'out_for_delivery').length}
            </Badge>
          </div>

          {deliveryOrders.filter(order => order.order_status === 'out_for_delivery').length === 0 ? (
            <Card className="border-2 border-dashed border-gray-200">
              <CardContent className="p-8 text-center">
                <Package className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">{t('delivery.noOrdersForDelivery')}</h3>
                <p className="text-gray-500">{t('delivery.ordersMarkedOutForDelivery')}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {deliveryOrders.filter(order => order.order_status === 'out_for_delivery').map((order) => (
                <Card key={order.id} className="hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-orange-50 border-l-4 border-l-orange-500">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-lg font-bold text-gray-800">Order #{order.id.slice(-8)}</h3>
                        <Badge className="bg-orange-500 text-white mt-1">{t('delivery.outForDelivery')}</Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-orange-600">₹{order.total_amount}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-md"
                        onClick={() => {
                          const orderData = {
                            orderId: order.id,
                            customer_name: order.customer_name,
                            customer_address: order.customer_address,
                            customer_phone: order.customer_phone,
                            total_amount: order.total_amount,
                            items: order.items
                          };
                          localStorage.setItem('currentOrder', JSON.stringify(orderData));
                          navigate('/delivery/tracking');
                        }}
                      >
                        <Navigation className="w-4 h-4 mr-2" />
                        {t('delivery.startRoute')}
                      </Button>
                      <Button 
                        className="bg-green-500 hover:bg-green-600 text-white"
                        onClick={async () => {
                          const success = await DeliveryOrderService.markAsDelivered(order.id);
                          if (success) {
                            setDeliveryOrders(prev => prev.filter(o => o.id !== order.id));
                            alert('✅ Order delivered!');
                          } else {
                            alert('❌ Failed to update order status');
                          }
                        }}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        {t('delivery.markDelivered')}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeliveryTasks;