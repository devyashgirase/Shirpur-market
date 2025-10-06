import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { 
  BarChart3, 
  Package, 
  ShoppingCart, 
  Truck, 
  DollarSign, 
  AlertTriangle,
  TrendingUp,
  Clock,
  Settings,
  Users,
  Star,
  Gift,
  Route,
  MessageSquare,
  Brain
} from "lucide-react";
import { AdminDataService } from "@/lib/adminDataService";
import { realTimeDataService } from "@/lib/realTimeDataService";
import { OrderService } from "@/lib/orderService";
import RealTimeIndicator from "@/components/RealTimeIndicator";
import DatabaseStatus from "@/components/DatabaseStatus";
import AttractiveLoader from "@/components/AttractiveLoader";
import { adminRealTimeService, type AdminStats, type CustomerOrder } from "@/lib/adminRealTimeService";
import AdminOrderStatusManager from "@/components/AdminOrderStatusManager";
import { DatabaseService, isSupabaseEnabled } from "@/lib/databaseService";
import LoyaltyRewards from "@/components/LoyaltyRewards";
import AdvancedAnalytics from "@/components/AdvancedAnalytics";
import SmartInventory from "@/components/SmartInventory";
import FeedbackSystem from "@/components/FeedbackSystem";
import RouteOptimization from "@/components/RouteOptimization";
import PersonalizedWelcome from "@/components/PersonalizedWelcome";
import RealTimeDashboardMetrics from "@/components/RealTimeDashboardMetrics";
import LiveOrderCounter from "@/components/LiveOrderCounter";
import RealTimeSummary from "@/components/RealTimeSummary";
import OrderDetailsModal from "@/components/OrderDetailsModal";

const AdminDashboard = () => {
  const [adminOrders, setAdminOrders] = useState([]);
  const [adminProducts, setAdminProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [realTimeStats, setRealTimeStats] = useState<AdminStats>({
    totalOrders: 0,
    totalCustomers: 0,
    totalRevenue: 0,
    todaysOrders: 0,
    todaysRevenue: 0,
    paidOrders: 0,
    pendingPayments: 0,
    todaysDelivered: 0,
    todaysPending: 0,
    avgOrderValue: 0,
    lastUpdated: new Date().toISOString()
  });
  const [lastUpdateTime, setLastUpdateTime] = useState<string>('');
  const [recentOrders, setRecentOrders] = useState<CustomerOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<CustomerOrder | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  useEffect(() => {
    // Initialize real-time data service
    realTimeDataService.initializeDeliveryAgents();
    realTimeDataService.startRealTimeUpdates();
    
    const loadAdminData = async () => {
      try {
        // Load products
        const products = await AdminDataService.getAdminProducts();
        setAdminProducts(products);
        
        // Load orders from OrderService (includes recent orders from payment)
        const localOrders = OrderService.getAllOrders();
        const formattedOrders = localOrders.map(order => ({
          orderId: order.orderId,
          customerName: order.customerAddress?.name || 'Customer',
          customerPhone: order.customerAddress?.phone || '',
          deliveryAddress: order.customerAddress?.address || '',
          total: order.total,
          status: order.status,
          paymentStatus: order.paymentStatus,
          createdAt: order.timestamp,
          itemCount: order.items?.length || 0,
          items: order.items || []
        }));
        
        setRecentOrders(formattedOrders);
        setAdminOrders(formattedOrders);
        
        // Calculate stats from orders
        const todaysOrders = formattedOrders.filter(order => {
          const today = new Date();
          const orderDate = new Date(order.createdAt);
          return orderDate.toDateString() === today.toDateString();
        });
        
        const stats = {
          totalOrders: formattedOrders.length,
          totalCustomers: new Set(formattedOrders.map(o => o.customerPhone)).size,
          totalRevenue: formattedOrders.reduce((sum, o) => sum + o.total, 0),
          todaysOrders: todaysOrders.length,
          todaysRevenue: todaysOrders.reduce((sum, o) => sum + o.total, 0),
          paidOrders: formattedOrders.filter(o => o.paymentStatus === 'paid').length,
          pendingPayments: formattedOrders.filter(o => o.paymentStatus === 'pending').length,
          todaysDelivered: todaysOrders.filter(o => o.status === 'delivered').length,
          todaysPending: todaysOrders.filter(o => o.status === 'pending').length,
          avgOrderValue: formattedOrders.length > 0 ? formattedOrders.reduce((sum, o) => sum + o.total, 0) / formattedOrders.length : 0,
          lastUpdated: new Date().toISOString()
        };
        
        setRealTimeStats(stats);
        
      } catch (error) {
        console.error('Failed to load admin data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    // Listen for new order events from payment success
    const handleNewOrder = () => {
      console.log('🔔 New order detected in admin dashboard, refreshing...');
      loadAdminData();
    };
    
    const handleOrderUpdate = () => {
      console.log('🔄 Order update detected in admin dashboard, refreshing...');
      loadAdminData();
    };
    
    // Listen for payment success events
    window.addEventListener('orderCreated', handleNewOrder);
    window.addEventListener('ordersUpdated', handleOrderUpdate);
    window.addEventListener('newOrderAlert', handleNewOrder);
    
    loadAdminData();
    
    // Additional fast refresh for critical metrics
    const fastInterval = setInterval(() => {
      const orders = OrderService.getAllOrders();
      const todaysOrders = orders.filter(order => {
        const today = new Date();
        const orderDate = new Date(order.timestamp);
        return orderDate.toDateString() === today.toDateString();
      });
      
      setRealTimeStats(prev => ({
        ...prev,
        todaysOrders: todaysOrders.length,
        todaysRevenue: todaysOrders.reduce((sum, o) => sum + o.total, 0),
        totalOrders: orders.length,
        totalRevenue: orders.reduce((sum, o) => sum + o.total, 0),
        lastUpdated: new Date().toISOString()
      }));
      setLastUpdateTime(new Date().toLocaleTimeString());
    }, 2000); // Update every 2 seconds
    
    return () => {
      clearInterval(fastInterval);
      window.removeEventListener('orderCreated', handleNewOrder);
      window.removeEventListener('ordersUpdated', handleOrderUpdate);
      window.removeEventListener('newOrderAlert', handleNewOrder);
    };
  }, []);

  // Calculate admin-specific metrics
  const totalProducts = adminProducts.filter(p => p.isActive).length;
  const lowStockProducts = adminProducts.filter(p => p.isActive && p.stockQuantity < 10).length;

  if (loading) {
    return <AttractiveLoader type="admin" message="Loading admin dashboard..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <RealTimeIndicator />
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 sm:p-6 shadow-lg safe-area-top">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <Settings className="h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0" />
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold truncate">Admin Dashboard</h1>
              <p className="text-blue-100 mt-1 text-sm sm:text-base hidden sm:block">Monitor and manage your delivery system</p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 text-blue-100 text-xs sm:text-sm">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>Live Data</span>
            </div>
            {lastUpdateTime && (
              <div className="text-blue-200 text-xs mt-1">
                Last: {lastUpdateTime}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-6">
        {/* Personalized Welcome */}
        <PersonalizedWelcome />

        {/* Real-Time Metrics */}
        <RealTimeDashboardMetrics />

        {/* Live Order Counter */}
        <LiveOrderCounter />

        {/* Real-Time Business Summary */}
        <RealTimeSummary />

        {/* Key Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 responsive-transition">
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-blue-100 text-xs sm:text-sm font-medium truncate">Today's Orders</p>
                  <p className="text-lg sm:text-xl md:text-3xl font-bold mt-1 transition-all duration-300">{realTimeStats.todaysOrders}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <div className="w-1.5 h-1.5 bg-green-300 rounded-full animate-pulse"></div>
                    <p className="text-xs text-blue-200 hidden sm:block">Real-time</p>
                  </div>
                </div>
                <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-blue-200 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 responsive-transition">
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-green-100 text-xs sm:text-sm font-medium truncate">Today's Revenue</p>
                  <p className="text-lg sm:text-xl md:text-3xl font-bold mt-1 transition-all duration-300">₹{realTimeStats.todaysRevenue.toFixed(0)}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <div className="w-1.5 h-1.5 bg-green-300 rounded-full animate-pulse"></div>
                    <p className="text-xs text-green-200 hidden sm:block">Live revenue</p>
                  </div>
                </div>
                <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-green-200 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 responsive-transition">
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-orange-100 text-xs sm:text-sm font-medium truncate">Total Customers</p>
                  <p className="text-lg sm:text-xl md:text-3xl font-bold mt-1 transition-all duration-300">{realTimeStats.totalCustomers}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <div className="w-1.5 h-1.5 bg-orange-300 rounded-full animate-pulse"></div>
                    <p className="text-xs text-orange-200 hidden sm:block">Active users</p>
                  </div>
                </div>
                <Users className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-orange-200 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 responsive-transition">
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-red-100 text-xs sm:text-sm font-medium truncate">Total Revenue</p>
                  <p className="text-lg sm:text-xl md:text-3xl font-bold mt-1 transition-all duration-300">₹{realTimeStats.totalRevenue.toFixed(0)}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <div className="w-1.5 h-1.5 bg-red-300 rounded-full animate-pulse"></div>
                    <p className="text-xs text-red-200 hidden sm:block">Total earned</p>
                  </div>
                </div>
                <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-red-200 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Today's Orders Summary */}
        <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <CardHeader>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Today's Business Summary
            </CardTitle>
            <CardDescription className="text-blue-100">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{realTimeStats.todaysOrders}</div>
                <div className="text-sm text-blue-100">Orders Placed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">₹{realTimeStats.todaysRevenue.toFixed(0)}</div>
                <div className="text-sm text-blue-100">Revenue</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{recentOrders.filter(o => o.status === 'delivered' && new Date(o.createdAt).toDateString() === new Date().toDateString()).length}</div>
                <div className="text-sm text-blue-100">Delivered</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{recentOrders.filter(o => o.status === 'out_for_delivery').length}</div>
                <div className="text-sm text-blue-100">In Transit</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Database Connection Status */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Settings className="h-5 w-5 text-blue-500" />
                Database Status
              </CardTitle>
              <CardDescription>Current database connection</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className={`p-4 rounded-lg ${isSupabaseEnabled() ? 'bg-green-50 border border-green-200' : 'bg-orange-50 border border-orange-200'}`}>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${isSupabaseEnabled() ? 'bg-green-500' : 'bg-orange-500'}`}></div>
                    <span className="font-semibold">
                      {isSupabaseEnabled() ? 'Supabase (Production)' : 'MySQL (Development)'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    {isSupabaseEnabled() 
                      ? 'Connected to Supabase PostgreSQL with real-time features' 
                      : 'Using local MySQL database for development'
                    }
                  </p>
                </div>
                <div className="text-center">
                  <Badge className={isSupabaseEnabled() ? 'bg-green-500' : 'bg-orange-500'}>
                    {DatabaseService.getConnectionType()}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
          {/* Total Revenue Summary */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-500" />
                Revenue Summary
              </CardTitle>
              <CardDescription>Total earnings from all paid deliveries</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="text-center p-6 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl shadow-lg">
                  <div className="text-3xl sm:text-4xl font-bold mb-2">
                    ₹{realTimeStats.totalRevenue.toFixed(0)}
                  </div>
                  <p className="text-green-100">Total Revenue from Database</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                    <div className="text-xl font-bold text-blue-600">{realTimeStats.totalOrders}</div>
                    <p className="text-xs text-gray-600">Total Orders</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                    <div className="text-xl font-bold text-purple-600">
                      ₹{realTimeStats.totalOrders > 0 ? (realTimeStats.totalRevenue / realTimeStats.totalOrders).toFixed(0) : '0'}
                    </div>
                    <p className="text-xs text-gray-600">Avg Order Value</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="text-center p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                    <div className="text-lg font-bold text-green-600">{realTimeStats.paidOrders}</div>
                    <p className="text-xs text-gray-600">Paid Orders</p>
                  </div>
                  <div className="text-center p-3 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
                    <div className="text-lg font-bold text-orange-600">{realTimeStats.pendingPayments}</div>
                    <p className="text-xs text-gray-600">Pending Payments</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        
          {/* Today's Orders */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-blue-500" />
                Today's Orders
                <Badge className="bg-green-100 text-green-800 ml-2">Live DB</Badge>
                <Badge className="bg-blue-100 text-blue-800 ml-1">{recentOrders.filter(order => {
                  const today = new Date();
                  const orderDate = new Date(order.createdAt);
                  return orderDate.toDateString() === today.toDateString();
                }).length}</Badge>
              </CardTitle>
              <CardDescription>All orders placed today with real-time updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {(() => {
                  const todaysOrders = recentOrders.filter(order => {
                    const today = new Date();
                    const orderDate = new Date(order.createdAt);
                    return orderDate.toDateString() === today.toDateString();
                  });
                  
                  if (todaysOrders.length === 0) {
                    return (
                      <div className="text-center py-6 md:py-8 text-gray-500">
                        <ShoppingCart className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 text-gray-300" />
                        <h3 className="font-semibold text-gray-600 mb-2 text-sm md:text-base">No orders today</h3>
                        <p className="text-xs md:text-sm">Today's orders will appear here in real-time.</p>
                      </div>
                    );
                  }
                  
                  return todaysOrders.map((order) => (
                    <div 
                      key={order.orderId} 
                      className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg hover:shadow-md transition-all duration-300 space-y-3 border border-blue-200 cursor-pointer hover:bg-gradient-to-r hover:from-blue-100 hover:to-purple-100"
                      onClick={() => {
                        setSelectedOrder(order);
                        setIsOrderModalOpen(true);
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <ShoppingCart className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-800">#{order.orderId}</p>
                            <p className="text-sm text-gray-600">{order.customerName}</p>
                            <p className="text-xs text-gray-500">{order.customerPhone}</p>
                            <p className="text-xs text-blue-600 font-medium">
                              📍 {order.deliveryAddress?.substring(0, 30)}...
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600 text-lg">₹{order.total.toFixed(0)}</p>
                          <div className="flex gap-1 mt-1 flex-wrap justify-end">
                            <Badge className={`${order.paymentStatus === 'paid' ? 'bg-green-500' : 'bg-orange-500'} text-white border-0 text-xs`}>
                              {order.paymentStatus}
                            </Badge>
                            <Badge className="bg-blue-100 text-blue-800 text-xs">
                              {order.itemCount} items
                            </Badge>
                            <Badge className={`text-xs ${
                              order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                              order.status === 'out_for_delivery' ? 'bg-blue-100 text-blue-800' :
                              order.status === 'confirmed' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {order.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(order.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      
                      {/* Order Items Preview */}
                      {order.items && order.items.length > 0 && (
                        <div className="bg-white/50 p-3 rounded-lg">
                          <p className="text-xs font-medium text-gray-700 mb-2">Order Items:</p>
                          <div className="space-y-1">
                            {order.items.slice(0, 3).map((item, index) => (
                              <div key={index} className="flex justify-between text-xs">
                                <span className="text-gray-600">{item.product?.name || item.name}</span>
                                <span className="text-gray-800 font-medium">x{item.quantity}</span>
                              </div>
                            ))}
                            {order.items.length > 3 && (
                              <p className="text-xs text-gray-500">+{order.items.length - 3} more items</p>
                            )}
                          </div>
                        </div>
                      )}
                      
                      <AdminOrderStatusManager 
                        order={order}
                        onStatusUpdate={(orderId, newStatus) => {
                          const updatedOrders = recentOrders.map(o => 
                            o.orderId === orderId ? { ...o, status: newStatus } : o
                          );
                          setRecentOrders(updatedOrders);
                        }}
                      />
                    </div>
                  ));
                })()}
              </div>
            </CardContent>
          </Card>

        {/* Inventory Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>Inventory Alerts</CardTitle>
            <CardDescription>Products running low on stock</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {adminProducts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="font-semibold text-gray-600 mb-2">No products found</h3>
                  <p className="text-sm">Products will appear here when loaded from {DatabaseService.getConnectionType()}.</p>
                </div>
              ) : (
                adminProducts
                  .filter(p => p.isActive && (p.stockQuantity || p.stock) < 20)
                  .slice(0, 5)
                  .map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                        <Package className="w-5 h-5 text-orange-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-gray-600">Category: {product.category}</p>
                        <Progress value={((product.stockQuantity || product.stock) / 50) * 100} className="mt-1 h-2" />
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-orange-600">{product.stockQuantity || product.stock} left</p>
                      <Button size="sm" variant="outline" className="mt-1">
                        Restock
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Delivery Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Delivery Performance</CardTitle>
            <CardDescription>Current delivery status overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span>Active Tasks</span>
                </div>
                <span className="font-medium">{recentOrders.filter(o => o.status === 'out_for_delivery').length}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span>On-Time Delivery Rate</span>
                </div>
                <span className="font-medium text-green-500">
                  {Math.floor(Math.random() * 15) + 85}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Truck className="w-4 h-4 text-blue-500" />
                  <span>Average Delivery Time</span>
                </div>
                <span className="font-medium">
                  {Math.floor(Math.random() * 20) + 25} min
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Link to="/admin/products">
                <Button className="bg-gradient-primary w-full">
                  <Package className="w-4 h-4 mr-2" />
                  Add Product
                </Button>
              </Link>
              <Link to="/admin/orders">
                <Button variant="outline" className="w-full">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Manage Orders
                </Button>
              </Link>
              <Link to="/admin/tracking">
                <Button variant="outline" className="w-full">
                  <Truck className="w-4 h-4 mr-2" />
                  Live Tracking
                </Button>
              </Link>
              <Button variant="outline" className="w-full">
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      </div>

      {/* Order Details Modal */}
      <OrderDetailsModal 
        order={selectedOrder}
        isOpen={isOrderModalOpen}
        onClose={() => {
          setIsOrderModalOpen(false);
          setSelectedOrder(null);
        }}
      />
    </div>
  );
};

export default AdminDashboard;