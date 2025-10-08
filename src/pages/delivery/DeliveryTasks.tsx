import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, DollarSign, Clock, Navigation, Truck, Star, TrendingUp, Package, CheckCircle } from "lucide-react";
import { DeliveryDataService } from "@/lib/deliveryDataService";
import { Link, useNavigate } from "react-router-dom";
import DeliveryPerformance from "@/components/DeliveryPerformance";
import DeliveryOTPVerification from "@/components/DeliveryOTPVerification";

import AttractiveLoader from "@/components/AttractiveLoader";
import PersonalizedWelcome from "@/components/PersonalizedWelcome";
import { deliveryCoordinationService, type OrderLocation } from "@/lib/deliveryCoordinationService";
import { deliveryAuthService } from "@/lib/deliveryAuthService";
import { useNavigate } from "react-router-dom";

const DeliveryTasks = () => {
  const navigate = useNavigate();
  const [deliveryTasks, setDeliveryTasks] = useState([]);
  const [nearbyOrders, setNearbyOrders] = useState<OrderLocation[]>([]);
  const [pendingDeliveries, setPendingDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [agentId, setAgentId] = useState<string | null>(null);
  const [showOTPVerification, setShowOTPVerification] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [metrics, setMetrics] = useState({
    activeTasks: 0,
    availableOrders: 0,
    todaysEarnings: 0,
    completionRate: 95
  });

  useEffect(() => {
    // Check authentication
    const currentAgent = deliveryAuthService.getCurrentAgent();
    if (!currentAgent) {
      navigate('/delivery/login');
      return;
    }
    setAgentId(currentAgent.userId);
    
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
            }
          },
          (error) => {
            console.error('GPS Error:', error);
            if (isMounted) {
              // Fallback to Shirpur coordinates only if GPS fails
              deliveryCoordinationService.setAgentLocation(agentId, 21.3486, 74.8811);
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
      if (!isMounted) return;
      
      try {
        const cachedTasks = JSON.parse(localStorage.getItem('deliveryTasks') || '[]');
        if (cachedTasks.length > 0) {
          setDeliveryTasks(cachedTasks);
          setMetrics(DeliveryDataService.getDeliveryMetrics(cachedTasks));
          setLoading(false);
        }
        
        const tasks = await DeliveryDataService.getAvailableDeliveries();
        
        if (isMounted) {
          setDeliveryTasks(tasks);
          setMetrics(DeliveryDataService.getDeliveryMetrics(tasks));
          localStorage.setItem('deliveryTasks', JSON.stringify(tasks));
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
    };
  }, [agentId, navigate]);

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
        const tasks = await DeliveryDataService.getAvailableDeliveries();
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
        
        // Load pending deliveries for this agent
        const storedOrders = JSON.parse(localStorage.getItem('allOrders') || '[]');
        const agentPendingOrders = storedOrders.filter((order: any) => 
          order.status === 'accepted' && order.deliveryAgent?.id === agentId
        );
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
              <h1 className="text-2xl sm:text-3xl font-bold">My Delivery Tasks</h1>
              <p className="text-blue-100 mt-1">Manage your deliveries and track earnings</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="bg-white/20 text-white border-white/30 hover:bg-white/30"
              onClick={async () => {
                if (!agentId) return;
                console.log('🔄 Refreshing delivery data...');
                const tasks = await DeliveryDataService.getAvailableDeliveries();
                setDeliveryTasks(tasks);
                setMetrics(DeliveryDataService.getDeliveryMetrics(tasks));
                const nearby = deliveryCoordinationService.findNearbyOrders(agentId);
                setNearbyOrders(nearby);
              }}
            >
              🔄 Refresh
            </Button>
            <Button 
              variant="outline" 
              className="bg-red-500/20 text-white border-red-300/30 hover:bg-red-500/30"
              onClick={() => {
                deliveryAuthService.logout();
                navigate('/delivery/login');
              }}
            >
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="p-3 md:p-6 space-y-4 md:space-y-6">
        <PersonalizedWelcome />
        
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-4">Performance Dashboard</h2>
          <DeliveryPerformance />
        </div>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex justify-between">
                <span className="text-sm">Avg Delivery Time</span>
                <span className="font-semibold">28 min</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Customer Rating</span>
                <span className="font-semibold">4.8 ⭐</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Weekly Earnings</span>
                <span className="font-semibold text-green-600">₹4,250</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6 border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              System Status - Live Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-blue-50 p-3 rounded">
                <p className="font-semibold text-blue-800">Agent GPS</p>
                <p className="text-blue-600">
                  {(() => {
                    const realLocation = JSON.parse(localStorage.getItem('agentRealLocation') || 'null');
                    if (realLocation) {
                      return `📍 ${realLocation.lat.toFixed(4)}, ${realLocation.lng.toFixed(4)}`;
                    }
                    return deliveryTasks[0]?.agentLocation ? 
                      `${deliveryTasks[0].agentLocation.lat.toFixed(4)}, ${deliveryTasks[0].agentLocation.lng.toFixed(4)}` : 
                      'Getting location...';
                  })()
                  }
                </p>
                <p className="text-xs text-blue-500 mt-1">
                  {deliveryTasks[0]?.debugInfo?.lastUpdate || 'No updates'}
                </p>
              </div>
              
              <div className="bg-green-50 p-3 rounded">
                <p className="font-semibold text-green-800">Orders Available</p>
                <p className="text-green-600 text-xl font-bold">
                  {deliveryTasks.length}
                </p>
                <p className="text-xs text-green-500 mt-1">
                  Out for delivery status
                </p>
              </div>
              
              <div className="bg-orange-50 p-3 rounded">
                <p className="font-semibold text-orange-800">Total Orders</p>
                <p className="text-orange-600 text-xl font-bold">
                  {deliveryTasks[0]?.debugInfo?.totalOrders || 0}
                </p>
                <p className="text-xs text-orange-500 mt-1">
                  All statuses combined
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
                  <p className="text-blue-100 text-xs md:text-sm font-medium">Active Tasks</p>
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
                  <p className="text-green-100 text-sm font-medium">Today's Earnings</p>
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
                  <p className="text-purple-100 text-sm font-medium">Completion Rate</p>
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
                  <p className="text-orange-100 text-sm font-medium">Performance</p>
                  <p className="text-2xl sm:text-3xl font-bold mt-1">⭐⭐⭐⭐⭐</p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Deliveries Section */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-xl font-bold text-gray-800">My Pending Deliveries</h2>
            <Badge variant="secondary" className="bg-orange-100 text-orange-700">
              {pendingDeliveries.length}
            </Badge>
          </div>

          {pendingDeliveries.length === 0 ? (
            <Card className="border-2 border-dashed border-gray-200">
              <CardContent className="p-8 text-center">
                <Package className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No pending deliveries</h3>
                <p className="text-gray-500">Accepted orders will appear here</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {pendingDeliveries.map((order) => (
                <Card key={order.orderId} className="hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-orange-50 border-l-4 border-l-orange-500">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-lg font-bold text-gray-800">Order #{order.orderId}</h3>
                        <Badge className="bg-orange-500 text-white mt-1">Accepted - Ready to Deliver</Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-orange-600">₹{Number(order.total || 0).toFixed(0)}</p>
                      </div>
                    </div>
                    
                    <div className="bg-white p-3 rounded-lg mb-3">
                      <div className="flex items-center gap-2 mb-1">
                        <MapPin className="w-4 h-4 text-red-500" />
                        <span className="font-semibold text-gray-700">Customer Details</span>
                      </div>
                      <p className="text-sm font-medium text-gray-800">{order.customerAddress.name}</p>
                      <p className="text-sm text-gray-600">{order.customerAddress.address}</p>
                      <p className="text-sm text-gray-600">{order.customerAddress.phone}</p>
                    </div>

                    <div className="bg-blue-50 p-3 rounded-lg mb-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Package className="w-4 h-4 text-blue-500" />
                        <span className="font-semibold text-blue-700">Order Items</span>
                      </div>
                      {order.items.slice(0, 2).map((item: any, idx: number) => (
                        <p key={idx} className="text-sm text-blue-600">
                          {item.quantity}x {item.product.name} - ₹{item.product.price}
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
                          localStorage.setItem('currentOrder', JSON.stringify(order));
                          navigate('/delivery/tracking');
                        }}
                      >
                        <Navigation className="w-4 h-4 mr-2" />
                        Start Route
                      </Button>
                      <Button 
                        className="bg-green-500 hover:bg-green-600 text-white"
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowOTPVerification(true);
                        }}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Mark Delivered
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
            <h2 className="text-xl font-bold text-gray-800">Available Orders (Within 10km)</h2>
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              {nearbyOrders.length}
            </Badge>
          </div>

          {nearbyOrders.length === 0 ? (
            <Card className="border-2 border-dashed border-gray-200">
              <CardContent className="p-8 text-center">
                <MapPin className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No nearby orders</h3>
                <p className="text-gray-500">Orders within 10km will appear here</p>
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
                        <Badge className="bg-green-500 text-white mt-1">Nearby Order</Badge>
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
                      Accept Delivery
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-xl font-bold text-gray-800">All Available Tasks</h2>
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              {deliveryTasks.length}
            </Badge>
          </div>

          {deliveryTasks.length === 0 ? (
            <Card className="border-2 border-dashed border-gray-200">
              <CardContent className="p-8 text-center">
                <Package className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No tasks available</h3>
                <p className="text-gray-500">New delivery tasks will appear here when available</p>
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
                            Ready for Pickup
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
                        <p className="text-sm text-gray-600 mt-1">Order Value</p>
                        <div className="mt-2 pt-2 border-t border-green-200">
                          <p className="text-lg font-bold text-green-700">₹{task.estimatedEarning}</p>
                          <p className="text-xs text-gray-500">Your Earning (15%)</p>
                        </div>
                        <div className="mt-2 pt-2 border-t border-green-200">
                          <p className="text-xs text-gray-500">Status: Out for Delivery</p>
                          <p className="text-xs text-gray-500">Admin Approved</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button 
                        className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-md"
                        onClick={() => handleAcceptDelivery(task.orderId)}
                      >
                        <Package className="w-4 h-4 mr-2" />
                        Accept & Start GPS Tracking
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

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
                alert('✅ Order delivered successfully!');
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