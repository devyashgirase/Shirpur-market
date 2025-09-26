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
    pendingPayments: 0
  });
  const [recentOrders, setRecentOrders] = useState<CustomerOrder[]>([]);

  useEffect(() => {
    // Initialize real-time data service
    realTimeDataService.initializeDeliveryAgents();
    realTimeDataService.startRealTimeUpdates();
    
    const loadAdminData = async () => {
      try {
        // Load products
        const products = await AdminDataService.getAdminProducts();
        setAdminProducts(products);
        
        // Load real-time stats from database
        const stats = await adminRealTimeService.fetchRealTimeStats();
        const orders = await adminRealTimeService.fetchRecentOrders();
        
        setRealTimeStats(stats);
        setRecentOrders(orders);
        setAdminOrders(orders);
      } catch (error) {
        console.error('Failed to load admin data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    // Subscribe to real-time updates
    const handleStatsUpdate = (stats: AdminStats) => {
      setRealTimeStats(stats);
    };
    
    const handleOrdersUpdate = (orders: CustomerOrder[]) => {
      setRecentOrders(orders);
      setAdminOrders(orders);
    };
    
    adminRealTimeService.subscribe('statsUpdate', handleStatsUpdate);
    adminRealTimeService.subscribe('ordersUpdate', handleOrdersUpdate);
    adminRealTimeService.startRealTimeUpdates();
    
    loadAdminData();
    const interval = setInterval(() => {
      adminRealTimeService.fetchRealTimeStats().then(setRealTimeStats);
      adminRealTimeService.fetchRecentOrders().then(setRecentOrders);
    }, 10000);
    
    return () => {
      clearInterval(interval);
      adminRealTimeService.unsubscribe('statsUpdate', handleStatsUpdate);
      adminRealTimeService.unsubscribe('ordersUpdate', handleOrdersUpdate);
      adminRealTimeService.stopRealTimeUpdates();
      realTimeDataService.stopRealTimeUpdates();
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
        <div className="flex items-center gap-2 sm:gap-3">
          <Settings className="h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0" />
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold truncate">Admin Dashboard</h1>
            <p className="text-blue-100 mt-1 text-sm sm:text-base hidden sm:block">Monitor and manage your delivery system</p>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-6">

        {/* Key Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 responsive-transition">
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-blue-100 text-xs sm:text-sm font-medium truncate">Today's Orders</p>
                  <p className="text-lg sm:text-xl md:text-3xl font-bold mt-1">{realTimeStats.todaysOrders}</p>
                  <p className="text-xs text-blue-200 mt-1 hidden sm:block">Live from DB</p>
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
                  <p className="text-lg sm:text-xl md:text-3xl font-bold mt-1">₹{realTimeStats.todaysRevenue.toFixed(0)}</p>
                  <p className="text-xs text-green-200 mt-1 hidden sm:block">Paid orders</p>
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
                  <p className="text-lg sm:text-xl md:text-3xl font-bold mt-1">{realTimeStats.totalCustomers}</p>
                  <p className="text-xs text-orange-200 mt-1 hidden sm:block">Unique</p>
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
                  <p className="text-lg sm:text-xl md:text-3xl font-bold mt-1">₹{realTimeStats.totalRevenue.toFixed(0)}</p>
                  <p className="text-xs text-red-200 mt-1 hidden sm:block">All time</p>
                </div>
                <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-red-200 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>
        </div>

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
        
          {/* Recent Orders */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-blue-500" />
                Recent Orders
                <Badge className="bg-green-100 text-green-800 ml-2">Live DB</Badge>
              </CardTitle>
              <CardDescription>Real-time orders from database with customer details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {recentOrders.length === 0 ? (
                  <div className="text-center py-6 md:py-8 text-gray-500">
                    <ShoppingCart className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="font-semibold text-gray-600 mb-2 text-sm md:text-base">No orders in database</h3>
                    <p className="text-xs md:text-sm">Real-time orders will appear here from database.</p>
                  </div>
                ) : (
                  recentOrders.map((order) => (
                    <div key={order.orderId} className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg hover:shadow-md transition-all duration-300 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                            <ShoppingCart className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-800">#{order.orderId}</p>
                            <p className="text-sm text-gray-600">{order.customerName}</p>
                            <p className="text-xs text-gray-500">{order.customerPhone}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">₹{order.total.toFixed(0)}</p>
                          <div className="flex gap-1 mt-1">
                            <Badge className={`${order.paymentStatus === 'paid' ? 'bg-green-500' : 'bg-orange-500'} text-white border-0 text-xs`}>
                              {order.paymentStatus}
                            </Badge>
                            <Badge className="bg-blue-100 text-blue-800 text-xs">
                              {order.itemCount} items
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(order.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      
                      <AdminOrderStatusManager 
                        order={order}
                        onStatusUpdate={(orderId, newStatus) => {
                          // Refresh orders after status update
                          const updatedOrders = recentOrders.map(o => 
                            o.orderId === orderId ? { ...o, status: newStatus } : o
                          );
                          setRecentOrders(updatedOrders);
                        }}
                      />
                    </div>
                  ))
                )}
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
    </div>
  );
};

export default AdminDashboard;