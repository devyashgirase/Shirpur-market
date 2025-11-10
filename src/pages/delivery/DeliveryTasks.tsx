import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, DollarSign, Clock, Navigation, Truck, Star, TrendingUp, Package, CheckCircle, Phone, MessageCircle, Headphones } from "lucide-react";
import { DeliveryDataService } from "@/lib/deliveryDataService";
import { DeliveryOrderService, DeliveryOrder } from "@/lib/deliveryOrderService";
import { Link, useNavigate } from "react-router-dom";
import DeliveryPerformance from "@/components/DeliveryPerformance";
import DeliveryOTPVerification from "@/components/DeliveryOTPVerification";
// i18n disabled

import AttractiveLoader from "@/components/AttractiveLoader";
import PersonalizedWelcome from "@/components/PersonalizedWelcome";
import { deliveryCoordinationService, type OrderLocation } from "@/lib/deliveryCoordinationService";
import { deliveryAuthService } from "@/lib/deliveryAuthService";
import { supabaseApi } from "@/lib/supabase";

const DeliveryTasks = () => {
  const navigate = useNavigate();
  const [deliveryTasks, setDeliveryTasks] = useState([]);
  const [nearbyOrders, setNearbyOrders] = useState<OrderLocation[]>([]);
  const [pendingDeliveries, setPendingDeliveries] = useState<any[]>([]);
  const [deliveryOrders, setDeliveryOrders] = useState<DeliveryOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [agentId, setAgentId] = useState<string | null>(null);
  const [showOTPVerification, setShowOTPVerification] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showEarningsModal, setShowEarningsModal] = useState(false);
  const [currentLocationName, setCurrentLocationName] = useState('Getting location...');
  const [weeklyEarnings, setWeeklyEarnings] = useState(0);
  const [earningsData, setEarningsData] = useState({ today: 0, week: 0, month: 0, completedToday: [] });
  const t = (key: string) => key;

  // Function to get address from coordinates
  const getAddressFromCoordinates = async (lat: number, lng: number) => {
    try {
      // Try free Nominatim API first
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await response.json();
      if (data.display_name) {
        const parts = data.display_name.split(',');
        // Return first 3 parts for cleaner address
        return parts.slice(0, 3).join(', ');
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    }
    
    // Fallback to area names based on coordinates (for Shirpur area)
    if (lat >= 21.3 && lat <= 21.4 && lng >= 74.8 && lng <= 74.9) {
      return 'Shirpur, Dhule, Maharashtra';
    }
    
    return `Location: ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  };
  const [metrics, setMetrics] = useState({
    activeTasks: 0,
    availableOrders: 0,
    todaysEarnings: 0,
    completionRate: 95,
    completedOrders: 0
  });

  // Calculate completed orders dynamically from Supabase
  const getCompletedOrdersToday = async () => {
    if (!agentId) return 0;
    const completions = await supabaseApi.getDeliveryCompletions(agentId);
    const today = new Date().toDateString();
    return completions.filter((completion: any) => 
      new Date(completion.completed_at).toDateString() === today
    ).length;
  };

  // Update completed orders count
  const updateCompletedOrders = async () => {
    const completedCount = await getCompletedOrdersToday();
    setMetrics(prev => ({ ...prev, completedOrders: completedCount }));
  };

  // Load weekly earnings
  useEffect(() => {
    const loadWeeklyEarnings = async () => {
      if (!agentId) return;
      const completions = await supabaseApi.getDeliveryCompletions(agentId);
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - 7);
      const weeklyTotal = completions
        .filter((c: any) => new Date(c.completed_at) >= weekStart)
        .reduce((sum: number, c: any) => sum + (c.earnings || 0), 0);
      setWeeklyEarnings(weeklyTotal);
    };
    loadWeeklyEarnings();
  }, [agentId]);

  // Load earnings data for modal
  useEffect(() => {
    const loadEarningsData = async () => {
      if (!agentId) return;
      const completions = await supabaseApi.getDeliveryCompletions(agentId);
      
      const today = new Date().toDateString();
      const weekStart = new Date(); weekStart.setDate(weekStart.getDate() - 7);
      const monthStart = new Date(); monthStart.setDate(monthStart.getDate() - 30);
      
      const completedToday = completions.filter((c: any) => new Date(c.completed_at).toDateString() === today);
      const completedThisWeek = completions.filter((c: any) => new Date(c.completed_at) >= weekStart);
      const completedThisMonth = completions.filter((c: any) => new Date(c.completed_at) >= monthStart);
      
      setEarningsData({
        today: completedToday.reduce((sum: number, c: any) => sum + (c.earnings || 0), 0),
        week: completedThisWeek.reduce((sum: number, c: any) => sum + (c.earnings || 0), 0),
        month: completedThisMonth.reduce((sum: number, c: any) => sum + (c.earnings || 0), 0),
        completedToday
      });
    };
    loadEarningsData();
  }, [agentId]);

  useEffect(() => {
    // Initialize completed orders count
    updateCompletedOrders();
    
    // Check authentication
    const checkAuth = async () => {
      const currentAgent = await deliveryAuthService.getCurrentAgent();
      if (!currentAgent) {
        navigate('/delivery/login');
        return;
      }
      setAgentId(currentAgent.userId);
      console.log('👤 Current delivery agent:', currentAgent.userId);
    };
    
    checkAuth();
    
    let isMounted = true;
    
    const setLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            if (isMounted) {
              const location = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
              };
              console.log('📍 Real GPS Location:', location);
              deliveryCoordinationService.setAgentLocation(
                agentId,
                location.lat,
                location.lng
              );
              
              // Store real location
              localStorage.setItem('agentRealLocation', JSON.stringify({
                ...location,
                timestamp: new Date().toISOString()
              }));
              
              // Get and store location name
              getAddressFromCoordinates(location.lat, location.lng).then(address => {
                setCurrentLocationName(address);
                localStorage.setItem('agentLocationName', address);
              });
            }
          },
          (error) => {
            console.error('GPS Error:', error);
            if (isMounted) {
              // Fallback to Shirpur coordinates only if GPS fails
              deliveryCoordinationService.setAgentLocation(agentId, 21.3486, 74.8811);
              setCurrentLocationName('Shirpur, Dhule, Maharashtra');
              localStorage.setItem('agentLocationName', 'Shirpur, Dhule, Maharashtra');
            }
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000
          }
        );
      } else {
        console.warn('Geolocation not supported');
        deliveryCoordinationService.setAgentLocation(agentId, 21.3486, 74.8811);
      }
    };
    
    setLocation();

    const loadDeliveryData = async () => {
      if (!isMounted || !agentId) return;
      
      try {
        // Load orders with 'out_for_delivery' status
        const outForDeliveryOrders = await DeliveryOrderService.getDeliveryOrders();
        if (isMounted) {
          setDeliveryOrders(outForDeliveryOrders);
        }
        
        const cachedTasks = JSON.parse(localStorage.getItem(`deliveryTasks_${agentId}`) || '[]');
        if (cachedTasks.length > 0) {
          setDeliveryTasks(cachedTasks);
          setMetrics(DeliveryDataService.getDeliveryMetrics(cachedTasks));
          setLoading(false);
        }
        
        const tasks = await DeliveryDataService.getAvailableDeliveries(agentId);
        
        if (isMounted) {
          setDeliveryTasks(tasks);
          setMetrics(DeliveryDataService.getDeliveryMetrics(tasks));
          localStorage.setItem(`deliveryTasks_${agentId}`, JSON.stringify(tasks));
        }
        
        const nearby = deliveryCoordinationService.findNearbyOrders(agentId);
        
        if (isMounted) {
          setNearbyOrders(nearby);
        }
      } catch (error) {
        console.error('Failed to load delivery data:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    loadDeliveryData();
    
    const handleOrderAccepted = () => {
      if (isMounted) {
        console.log('🔄 Order status changed, refreshing delivery data');
        loadDeliveryData();
      }
    };
    
    // Subscribe to real-time delivery order updates
    const subscription = DeliveryOrderService.subscribeToDeliveryOrders((orders) => {
      if (isMounted) {
        setDeliveryOrders(orders);
      }
    });
    
    window.addEventListener('deliveryNotificationCreated', handleOrderAccepted);
    window.addEventListener('orderAccepted', handleOrderAccepted);
    window.addEventListener('ordersUpdated', handleOrderAccepted);
    deliveryCoordinationService.subscribe('orderAccepted', handleOrderAccepted);
    
    return () => {
      isMounted = false;
      window.removeEventListener('deliveryNotificationCreated', handleOrderAccepted);
      window.removeEventListener('orderAccepted', handleOrderAccepted);
      window.removeEventListener('ordersUpdated', handleOrderAccepted);
      deliveryCoordinationService.unsubscribe('orderAccepted', handleOrderAccepted);
      subscription.unsubscribe();
    };
  }, [navigate]);

  // Separate effect for loading data when agentId changes
  useEffect(() => {
    if (agentId) {
      const loadData = async () => {
        const tasks = await DeliveryDataService.getAvailableDeliveries(agentId);
        setDeliveryTasks(tasks);
        setMetrics(DeliveryDataService.getDeliveryMetrics(tasks));
        
        // Load pending deliveries for this agent
        const agentOrders = await supabaseApi.getOrdersByDeliveryAgent(agentId);
        const agentPendingOrders = agentOrders.filter((order: any) => 
          order.status === 'out_for_delivery'
        ).map((order: any) => ({
          orderId: order.order_id || order.id,
          status: order.status,
          total: order.total,
          customerAddress: {
            name: order.customer_name,
            address: order.delivery_address || order.customer_address,
            phone: order.customer_phone
          },
          items: order.items ? JSON.parse(order.items) : []
        }));
        setPendingDeliveries(agentPendingOrders);
        setLoading(false);
      };
      
      loadData();
    }
  }, [agentId]);

  const handleAcceptDelivery = async (orderId: string) => {
    if (!agentId) return;
    
    try {
      console.log(`🚚 Accepting delivery for order: ${orderId}`);
      
      // Update order status to 'out_for_delivery' in database
      await supabaseApi.updateOrderStatus(parseInt(orderId), 'out_for_delivery', agentId);
      
      const success = deliveryCoordinationService.acceptOrder(agentId, orderId);
      
      if (success) {
        console.log('✅ Order accepted successfully');
        
        // Trigger real-time update for admin
        window.dispatchEvent(new CustomEvent('orderStatusChanged', {
          detail: { orderId, status: 'out_for_delivery', agentId }
        }));
        
        // Refresh data
        const tasks = await DeliveryDataService.getAvailableDeliveries(agentId);
        setDeliveryTasks(tasks);
        setMetrics(DeliveryDataService.getDeliveryMetrics(tasks));
        
        // Update nearby orders
        const nearby = deliveryCoordinationService.findNearbyOrders(agentId);
        setNearbyOrders(nearby);
        
        // Refresh pending deliveries
        const ordersList = JSON.parse(localStorage.getItem('allOrders') || '[]');
        const updatedPendingOrders = ordersList.filter((order: any) => 
          order.status === 'accepted' && order.deliveryAgent?.id === agentId
        );
        setPendingDeliveries(updatedPendingOrders);
        
        // Load pending deliveries for this agent from Supabase
        const { supabaseApi } = await import('@/lib/supabase');
        const agentOrders = await supabaseApi.getOrdersByDeliveryAgent(agentId);
        const agentPendingOrders = agentOrders.filter((order: any) => 
          order.status === 'out_for_delivery'
        ).map((order: any) => ({
          orderId: order.order_id || order.id,
          status: order.status,
          total: order.total,
          customerAddress: {
            name: order.customer_name,
            address: order.delivery_address || order.customer_address,
            phone: order.customer_phone
          },
          items: order.items ? JSON.parse(order.items) : []
        }));
        setPendingDeliveries(agentPendingOrders);
        
        // Navigate to GPS tracking page
        navigate('/delivery/tracking');
      } else {
        console.error('❌ Failed to accept order');
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
            {/* Delivery Support Button */}
            <Button 
              variant="outline" 
              className="bg-green-500/20 text-white border-green-300/30 hover:bg-green-500/30"
              onClick={() => {
                const supportOptions = [
                  { label: '📞 Call Admin', action: () => window.open('tel:7276035433') },
                  { label: '💬 WhatsApp Support', action: () => window.open('https://wa.me/917276035433?text=Hello, I need delivery support') },
                  { label: '📧 Email Support', action: () => window.open('mailto:support@yashtech.com?subject=Delivery Support Request') },
                  { label: '🌐 Help Center', action: () => alert('📚 Help: Contact admin for any delivery issues, payment problems, or technical support.') }
                ];
                
                let choice = prompt(
                  '🎧 Delivery Support Options:\n\n' +
                  '1. 📞 Call Admin (7276035433)\n' +
                  '2. 💬 WhatsApp Support\n' +
                  '3. 📧 Email Support\n' +
                  '4. 📚 Help Center\n\n' +
                  'Enter option number (1-4):'
                );
                
                // Validate single digit 1-4 only
                if (choice && /^[1-4]$/.test(choice.trim())) {
                  supportOptions[parseInt(choice) - 1].action();
                } else if (choice !== null) {
                  alert('⚠️ Please enter only one number (1-4)');
                }
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
                console.log('🔄 Refreshing delivery data...');
                
                // Force refresh from database
                const orders = await DeliveryOrderService.getDeliveryOrders();
                console.log('📦 Refreshed orders:', orders.length);
                console.log('📊 Ready for delivery:', orders.filter(o => o.order_status === 'ready_for_delivery').length);
                console.log('🚚 Out for delivery:', orders.filter(o => o.order_status === 'out_for_delivery').length);
                
                setDeliveryOrders(orders);
                const tasks = await DeliveryDataService.getAvailableDeliveries(agentId);
                setDeliveryTasks(tasks);
                setMetrics(DeliveryDataService.getDeliveryMetrics(tasks));
                const nearby = deliveryCoordinationService.findNearbyOrders(agentId);
                setNearbyOrders(nearby);
                
                console.log('📝 Sample order from database:', orders[0]);
                alert(`✅ Refreshed! Found ${orders.length} total orders, ${orders.filter(o => o.order_status === 'ready_for_delivery').length} ready for delivery`);
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
                <span className="font-semibold">{(() => {
                  const avgTime = localStorage.getItem('avgDeliveryTime');
                  return avgTime ? `${avgTime} min` : 'N/A';
                })()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">{t('delivery.customerRating')}</span>
                <span className="font-semibold">{(() => {
                  const rating = localStorage.getItem('customerRating');
                  return rating ? `${rating} ⭐` : 'N/A';
                })()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">{t('delivery.weeklyEarnings')}</span>
<span className="font-semibold text-green-600">₹{weeklyEarnings}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6 border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              {t('delivery.systemStatus')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-blue-50 p-3 rounded">
                <p className="font-semibold text-blue-800">{t('delivery.currentLocation')}</p>
                <p className="text-blue-600">
                  📍 {localStorage.getItem('agentLocationName') || currentLocationName}
                </p>
                <p className="text-xs text-blue-500 mt-1">
                  {(() => {
                    const realLocation = localStorage.getItem('agentRealLocation');
                    if (realLocation && realLocation !== 'null') {
                      try {
                        const location = JSON.parse(realLocation);
                        return location.timestamp ? new Date(location.timestamp).toLocaleTimeString() : 'Location updated';
                      } catch (error) {
                        return 'Location updated';
                      }
                    }
                    return 'Getting location...';
                  })()
                  }
                </p>
              </div>
              
              <div className="bg-green-50 p-3 rounded">
                <p className="font-semibold text-green-800">{t('delivery.ordersAvailable')}</p>
                <p className="text-green-600 text-xl font-bold">
                  {deliveryTasks.length}
                </p>
                <p className="text-xs text-green-500 mt-1">
                  {t('delivery.outForDeliveryStatus')}
                </p>
              </div>
              
              <div className="bg-orange-50 p-3 rounded">
                <p className="font-semibold text-orange-800">{t('delivery.totalOrders')}</p>
                <p className="text-orange-600 text-xl font-bold">
                  {deliveryTasks[0]?.debugInfo?.totalOrders || 0}
                </p>
                <p className="text-xs text-orange-500 mt-1">
                  {t('delivery.allStatusesCombined')}
                </p>
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
          
          <Card 
            className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
            onClick={() => setShowEarningsModal(true)}
          >
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

        {/* Daily Incentive Tracker */}
        <Card className="mb-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  🎯 {t('delivery.dailyIncentiveTracker')}
                </h3>
                <p className="text-sm text-gray-600">{t('delivery.incentiveDescription')}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-orange-600">₹{Math.min((metrics.completedOrders || 0) * 25, 250)}</p>
                <p className="text-xs text-gray-500">{t('delivery.earnedToday')}</p>
              </div>
            </div>
            
            <div className="relative">
              <div className="w-full h-12 bg-gray-200 rounded-full relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-full h-1 border-t-2 border-dashed border-gray-400"></div>
                </div>
                
                <div 
                  className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${Math.min(((metrics.completedOrders || 0) / 10) * 100, 100)}%` }}
                ></div>
                
                <div 
                  className="absolute top-1/2 transform -translate-y-1/2 transition-all duration-1000 ease-out"
                  style={{ left: `${Math.min(((metrics.completedOrders || 0) / 10) * 100, 95)}%` }}
                >
                  <div className="bg-white rounded-full p-2 shadow-lg border-2 border-green-500">
                    <span className="text-lg">🏍️</span>
                  </div>
                </div>
                
                {[2, 5, 8, 10].map((milestone) => (
                  <div
                    key={milestone}
                    className="absolute top-0 bottom-0 w-0.5 bg-gray-400"
                    style={{ left: `${(milestone / 10) * 100}%` }}
                  >
                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                      <span className="text-xs font-medium text-gray-600">{milestone}</span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between mt-3">
                <div className="text-sm">
                  <span className="font-bold text-green-600">{metrics.completedOrders || 0}</span>
                  <span className="text-gray-500"> / 10 {t('delivery.orders')}</span>
                </div>
                <div className="text-sm">
                  <span className="font-bold text-orange-600">₹{250 - Math.min((metrics.completedOrders || 0) * 25, 250)}</span>
                  <span className="text-gray-500"> {t('delivery.remaining')}</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
              {[
                { orders: 2, reward: 50, icon: '🥉' },
                { orders: 5, reward: 125, icon: '🥈' },
                { orders: 8, reward: 200, icon: '🥇' },
                { orders: 10, reward: 250, icon: '🏆' }
              ].map((milestone) => (
                <div 
                  key={milestone.orders}
                  className={`p-3 rounded-lg text-center transition-all duration-300 ${
                    (metrics.completedOrders || 0) >= milestone.orders 
                      ? 'bg-green-100 border-2 border-green-400 text-green-800' 
                      : 'bg-gray-100 border-2 border-gray-300 text-gray-500'
                  }`}
                >
                  <div className="text-2xl mb-1">{milestone.icon}</div>
                  <div className="text-xs font-bold">{milestone.orders} {t('delivery.orders')}</div>
                  <div className="text-xs">₹{milestone.reward}</div>
                </div>
              ))}
            </div>
            
            {(metrics.completedOrders || 0) >= 10 && (
              <div className="mt-4 p-3 bg-green-100 border-2 border-green-400 rounded-lg text-center">
                <p className="text-green-800 font-bold">🎉 {t('delivery.congratulations')}</p>
                <p className="text-sm text-green-600">{t('delivery.fullIncentiveEarned')}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ready for Delivery Orders Section */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-xl font-bold text-gray-800">📦 {t('delivery.readyForDelivery')}</h2>
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              {deliveryOrders.filter(order => order.order_status === 'ready_for_delivery').length}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {t('delivery.total')}: {deliveryOrders.length} {t('delivery.orders')}
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
                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded font-medium">{t('delivery.orderId')}</span>
                          <span className="text-sm font-mono text-gray-700">#{order.id}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-green-50 p-3 rounded-lg mb-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Package className="w-4 h-4 text-green-500" />
                        <span className="font-semibold text-green-700">{t('delivery.orderItems')}</span>
                      </div>
                      {order.items && order.items.length > 0 ? order.items.slice(0, 2).map((item: any, idx: number) => (
                        <p key={idx} className="text-sm text-green-600">
                          {item.quantity}x {item.product?.name || item.name || item.product_name || 'Unknown Item'} - ₹{item.price || item.product?.price || 0}
                        </p>
                      )) : (
                        <p className="text-sm text-gray-500">{t('delivery.noItemsFound')}</p>
                      )}
                      {order.items.length > 2 && (
                        <p className="text-xs text-green-500">+{order.items.length - 2} more items</p>
                      )}
                    </div>

                    <Button 
                      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-md"
                      onClick={async () => {
                        // Accept order and change status to out_for_delivery
                        const success = await handleAcceptDelivery(order.id);
                        if (success) {
                          // Update order status to out_for_delivery
                          const { AdminOrderService } = await import('@/lib/adminOrderService');
                          await AdminOrderService.updateOrderStatus(order.id, 'out_for_delivery');
                          
                          // Refresh orders
                          const updatedOrders = await DeliveryOrderService.getDeliveryOrders();
                          setDeliveryOrders(updatedOrders);
                        }
                      }}
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
                    
                    <div className="bg-white p-4 rounded-lg mb-3 border border-gray-200">
                      <div className="flex items-center gap-2 mb-3">
                        <MapPin className="w-5 h-5 text-red-500" />
                        <span className="font-bold text-gray-800">📋 {t('delivery.deliveryDetails')}</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded font-medium">{t('delivery.customer')}</span>
                          <span className="font-semibold text-gray-800">{order.customer_name}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded font-medium">{t('delivery.deliverTo')}</span>
                          <span className="text-sm text-gray-700 flex-1">{order.customer_address}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded font-medium">{t('delivery.contact')}</span>
                          <a href={`tel:${order.customer_phone}`} className="text-sm font-medium text-blue-600 hover:underline">
                            📞 {order.customer_phone}
                          </a>
                          <a href={`https://wa.me/91${order.customer_phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-green-600 hover:underline">
                            📱 WhatsApp
                          </a>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded font-medium">{t('delivery.order')}</span>
                          <span className="text-sm font-mono text-gray-700">#{order.id}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50 p-3 rounded-lg mb-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Package className="w-4 h-4 text-blue-500" />
                        <span className="font-semibold text-blue-700">{t('delivery.orderItems')}</span>
                      </div>
                      {order.items.slice(0, 2).map((item: any, idx: number) => (
                        <p key={idx} className="text-sm text-blue-600">
                          {item.quantity}x {item.name} - ₹{item.price}
                        </p>
                      ))}
                      {order.items.length > 2 && (
                        <p className="text-xs text-blue-500">+{order.items.length - 2} more items</p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-md"
                        onClick={() => {
                          console.log('📝 Raw order from database:', order);
                          const orderData = {
                            orderId: order.id,
                            customerAddress: {
                              name: order.customer_name,
                              address: order.delivery_address || order.customer_address,
                              phone: order.customer_phone
                            },
                            customer_name: order.customer_name,
                            customer_address: order.delivery_address || order.customer_address,
                            delivery_address: order.delivery_address || order.customer_address,
                            customer_phone: order.customer_phone,
                            total: order.total_amount,
                            total_amount: order.total_amount,
                            items: order.items
                          };
                          console.log('🔄 Setting current order with real address:', orderData);
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
                            // Save completion to Supabase
                            await supabaseApi.saveDeliveryCompletion({
                              order_id: order.id,
                              agent_id: agentId,
                              completed_at: new Date().toISOString(),
                              earnings: 25
                            });
                            
                            // Update metrics
                            updateCompletedOrders();
                            
                            setDeliveryOrders(prev => prev.filter(o => o.id !== order.id));
                            
                            const newCount = getCompletedOrdersToday();
                            alert(`✅ Order delivered! 🏍️ Progress: ${newCount}/10 orders (₹${newCount * 25} earned)`);
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

        {/* Nearby Orders Section */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-xl font-bold text-gray-800">{t('delivery.availableOrders')}</h2>
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              {nearbyOrders.length}
            </Badge>
          </div>

          {nearbyOrders.length === 0 ? (
            <Card className="border-2 border-dashed border-gray-200">
              <CardContent className="p-8 text-center">
                <MapPin className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">{t('delivery.noNearbyOrders')}</h3>
                <p className="text-gray-500">{t('delivery.ordersWithinRange')}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {nearbyOrders.map((order) => (
                <Card key={order.orderId} className="hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-green-50 border-l-4 border-l-green-500">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-lg font-bold text-gray-800">Order #{order.orderId}</h3>
                        <Badge className="bg-green-500 text-white mt-1">{t('delivery.nearbyOrder')}</Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-600">₹{Number(order.total || 0).toFixed(0)}</p>
                      </div>
                    </div>
                    
                    <div className="bg-white p-3 rounded-lg mb-3">
                      <div className="flex items-center gap-2 mb-1">
                        <MapPin className="w-4 h-4 text-red-500" />
                        <span className="font-semibold text-gray-700">Customer Details</span>
                      </div>
                      <p className="text-sm font-medium text-gray-800">{order.customerName}</p>
                      <p className="text-sm text-gray-600">{order.customerAddress}</p>
                      <p className="text-sm text-gray-600">{order.customerPhone}</p>
                    </div>

                    <Button 
                      className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-md"
                      onClick={() => handleAcceptDelivery(order.orderId)}
                    >
                      <Package className="w-4 h-4 mr-2" />
                      {t('delivery.acceptDelivery')}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-xl font-bold text-gray-800">{t('delivery.allTasks')}</h2>
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              {deliveryTasks.length}
            </Badge>
          </div>

          {deliveryTasks.length === 0 ? (
            <Card className="border-2 border-dashed border-gray-200">
              <CardContent className="p-8 text-center">
                <Package className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">{t('delivery.noTasksAvailable')}</h3>
                <p className="text-gray-500">{t('delivery.newTasksWillAppear')}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {deliveryTasks.map((task) => (
                <Card key={task.id} className="hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-white/80 backdrop-blur-sm border-l-4 border-l-blue-500">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-bold text-gray-800">Order #{task.order_id || task.orderId}</h3>
                          <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
                            {t('delivery.readyForPickup')}
                          </Badge>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                              <MapPin className="w-4 h-4 text-red-500" />
                              <span className="font-semibold text-gray-700">Customer Details</span>
                            </div>
                            <p className="text-sm font-medium text-gray-800">{task.customer_name || task.customerAddress?.name}</p>
                            <p className="text-sm text-gray-600">{task.customer_address || task.customerAddress?.address}</p>
                            <p className="text-sm text-blue-600 mt-1">📞 {task.customer_phone}</p>
                          </div>
                          
                          <div className="bg-blue-50 p-3 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                              <Navigation className="w-4 h-4 text-blue-500" />
                              <span className="font-semibold text-blue-700">Distance & Location</span>
                            </div>
                            <p className="text-sm text-blue-600">Distance: {task.distance?.toFixed(2)} km</p>
                            <p className="text-sm text-blue-600">ETA: ~{Math.round((task.distance || 0) * 3)} minutes</p>
                            <p className="text-xs text-blue-500 mt-1">From your GPS location</p>
                          </div>
                          
                          {task.items && (
                            <div className="bg-orange-50 p-3 rounded-lg">
                              <div className="flex items-center gap-2 mb-1">
                                <Package className="w-4 h-4 text-orange-500" />
                                <span className="font-semibold text-orange-700">Items ({task.items.length})</span>
                              </div>
                              {task.items.slice(0, 2).map((item, idx) => (
                                <p key={idx} className="text-sm text-orange-600">
                                  {item.quantity}x {item.product.name}
                                </p>
                              ))}
                              {task.items.length > 2 && (
                                <p className="text-xs text-orange-500">+{task.items.length - 2} more items</p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right bg-green-50 p-4 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">₹{Number(task.total || 0).toFixed(0)}</p>
                        <p className="text-sm text-gray-600 mt-1">{t('delivery.orderValue')}</p>
                        <div className="mt-2 pt-2 border-t border-green-200">
                          <p className="text-lg font-bold text-green-700">₹{task.estimatedEarning}</p>
                          <p className="text-xs text-gray-500">{t('delivery.yourEarning')}</p>
                        </div>
                        <div className="mt-2 pt-2 border-t border-green-200">
                          <p className="text-xs text-gray-500">{t('common.status')}: {t('delivery.outForDelivery')}</p>
                          <p className="text-xs text-gray-500">{t('delivery.adminApproved')}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button 
                        className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-md"
                        onClick={() => handleAcceptDelivery(task.orderId)}
                      >
                        <Package className="w-4 h-4 mr-2" />
                        {t('delivery.acceptOrder')}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Earnings Details Modal */}
        {showEarningsModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md bg-white">
              <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                <CardTitle className="flex items-center justify-between">
                  <span>💰 {t('delivery.earnings.details')}</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-white hover:bg-white/20"
                    onClick={() => setShowEarningsModal(false)}
                  >
                    ✕
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                      {/* Today's Summary */}
                      <div className="bg-green-50 p-4 rounded-lg">
                        <h3 className="font-bold text-green-800 mb-2">📅 {t('delivery.earnings.today')}</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>{t('delivery.completedOrders')}:</span>
                            <span className="font-bold">{earningsData.completedToday.length}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>{t('delivery.earnings')}:</span>
                            <span className="font-bold text-green-600">₹{earningsData.today}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>{t('delivery.incentiveBonus')}:</span>
                            <span className="font-bold text-orange-600">₹{Math.min((metrics.completedOrders || 0) * 25, 250)}</span>
                          </div>
                          <div className="flex justify-between border-t pt-2 mt-2">
                            <span className="font-bold">{t('delivery.totalEarnings')}:</span>
                            <span className="font-bold text-green-700">₹{earningsData.today + Math.min((metrics.completedOrders || 0) * 25, 250)}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Order History */}
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h3 className="font-bold text-blue-800 mb-2">📋 {t('delivery.completedOrders')}</h3>
                        {earningsData.completedToday.length === 0 ? (
                          <p className="text-gray-500 text-sm">{t('delivery.noOrders')}</p>
                        ) : (
                          <div className="space-y-2 max-h-32 overflow-y-auto">
                            {earningsData.completedToday.map((completion: any, idx: number) => (
                              <div key={idx} className="flex justify-between text-sm">
                                <span>Order #{completion.order_id?.slice(-6) || idx + 1}</span>
                                <span className="font-medium">₹{completion.earnings}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      {/* Weekly & Monthly */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-purple-50 p-3 rounded-lg text-center">
                          <p className="text-xs text-purple-600">{t('delivery.earnings.week')}</p>
                          <p className="font-bold text-purple-800">₹{earningsData.week}</p>
                          <p className="text-xs text-purple-500">{Math.floor(earningsData.week / 25)} orders</p>
                        </div>
                        <div className="bg-orange-50 p-3 rounded-lg text-center">
                          <p className="text-xs text-orange-600">{t('delivery.earnings.month')}</p>
                          <p className="font-bold text-orange-800">₹{earningsData.month}</p>
                          <p className="text-xs text-orange-500">{Math.floor(earningsData.month / 25)} orders</p>
                        </div>
                      </div>
                      
                      {/* Performance Stats */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-bold text-gray-800 mb-2">📊 {t('delivery.performance')}</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>{t('delivery.avgPerOrder')}:</span>
                            <span className="font-medium">₹{earningsData.completedToday.length > 0 ? (earningsData.today / earningsData.completedToday.length).toFixed(0) : 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>{t('delivery.completionRate')}:</span>
                            <span className="font-medium">{metrics.completionRate}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>{t('delivery.rating')}:</span>
                            <span className="font-medium">{(() => {
                              const rating = localStorage.getItem('customerRating');
                              return rating ? `⭐ ${rating}/5` : 'N/A';
                            })()}</span>
                          </div>
                        </div>
                      </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* OTP Verification Modal */}
        {showOTPVerification && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <DeliveryOTPVerification
              orderId={selectedOrder.orderId}
              customerPhone={selectedOrder.customerAddress?.phone || ''}
              customerName={selectedOrder.customerAddress?.name || ''}
              onVerificationSuccess={() => {
                setShowOTPVerification(false);
                setSelectedOrder(null);
                // Remove from pending deliveries
                setPendingDeliveries(prev => prev.filter(order => order.orderId !== selectedOrder.orderId));
                alert('✅ ' + t('delivery.orderDelivered'));
              }}
              onCancel={() => {
                setShowOTPVerification(false);
                setSelectedOrder(null);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryTasks;