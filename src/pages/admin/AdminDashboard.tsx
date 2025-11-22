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
import { AdminOrderService } from "@/lib/adminOrderService";
import { useToast } from "@/hooks/use-toast";
import { DatabaseService, isSupabaseEnabled } from "@/lib/databaseService";
import RealTimeIndicator from "@/components/RealTimeIndicator";
import AttractiveLoader from "@/components/AttractiveLoader";
import { DashboardCardSkeleton, OrderCardSkeleton } from "@/components/LoadingSkeleton";

const AdminDashboard = () => {
  const [adminOrders, setAdminOrders] = useState([]);
  const [adminProducts, setAdminProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [realTimeStats, setRealTimeStats] = useState({
    totalOrders: 0,
    totalCustomers: 0,
    totalRevenue: 0,
    todaysOrders: 0,
    todaysRevenue: 0,
    paidOrders: 0,
    pendingPayments: 0,
    lastUpdated: new Date().toISOString()
  });
  const [lastUpdateTime, setLastUpdateTime] = useState<string>('');
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    const loadAdminData = async () => {
      try {
        // Load data directly from Supabase
        const { supabaseApi } = await import('@/lib/supabase');
        const products = await supabaseApi.getProducts();
        setAdminProducts(products);
        
        // Load orders from Supabase
        const dbOrders = await supabaseApi.getOrders();
        console.log('📊 Raw orders from Supabase:', dbOrders);
        
        const formattedOrders = dbOrders.map(order => ({
          orderId: order.id,
          customerName: order.customer_name || 'Customer',
          customerPhone: order.customer_phone || '',
          deliveryAddress: order.customer_address || '',
          total: order.total_amount || 0,
          status: order.order_status || 'placed',
          paymentStatus: order.payment_status || 'pending',
          createdAt: order.created_at || new Date().toISOString(),
          itemCount: order.items?.length || 0,
          items: order.items || []
        }));
        
        console.log('📊 Formatted orders for display:', formattedOrders);
        setRecentOrders(formattedOrders);
        setAdminOrders(formattedOrders);
        
        // Calculate stats
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
          lastUpdated: new Date().toISOString()
        };
        
        setRealTimeStats(stats);
        
      } catch (error) {
        console.error('Failed to load admin data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadAdminData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="p-4 sm:p-6 space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <DashboardCardSkeleton key={i} />
            ))}
          </div>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <OrderCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <RealTimeIndicator />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 sm:p-6 shadow-lg">
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
        {/* Key Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-blue-100 text-xs sm:text-sm font-medium truncate">Today's Orders</p>
                  <p className="text-lg sm:text-xl md:text-3xl font-bold mt-1">{realTimeStats.todaysOrders}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <div className="w-1.5 h-1.5 bg-green-300 rounded-full animate-pulse"></div>
                    <p className="text-xs text-blue-200 hidden sm:block">Real-time</p>
                  </div>
                </div>
                <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-blue-200 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg">
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-green-100 text-xs sm:text-sm font-medium truncate">Today's Revenue</p>
                  <p className="text-lg sm:text-xl md:text-3xl font-bold mt-1">₹{realTimeStats.todaysRevenue.toFixed(0)}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <div className="w-1.5 h-1.5 bg-green-300 rounded-full animate-pulse"></div>
                    <p className="text-xs text-green-200 hidden sm:block">Live revenue</p>
                  </div>
                </div>
                <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-green-200 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg">
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-orange-100 text-xs sm:text-sm font-medium truncate">Total Orders</p>
                  <p className="text-lg sm:text-xl md:text-3xl font-bold mt-1">{realTimeStats.totalOrders}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <div className="w-1.5 h-1.5 bg-orange-300 rounded-full animate-pulse"></div>
                    <p className="text-xs text-orange-200 hidden sm:block">All time</p>
                  </div>
                </div>
                <Package className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-orange-200 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-0 shadow-lg">
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-red-100 text-xs sm:text-sm font-medium truncate">Total Revenue</p>
                  <p className="text-lg sm:text-xl md:text-3xl font-bold mt-1">₹{realTimeStats.totalRevenue.toFixed(0)}</p>
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

        {/* Recent Orders */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-blue-500" />
              Recent Orders
              <Badge className="bg-green-100 text-green-800 ml-2">Live DB</Badge>
              <Badge className="bg-blue-100 text-blue-800 ml-1">{recentOrders.length}</Badge>
            </CardTitle>
            <CardDescription>All orders from Supabase database</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {recentOrders.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="font-semibold text-gray-600 mb-2">No orders found</h3>
                  <p className="text-sm">Orders will appear here when customers place them.</p>
                </div>
              ) : (
                recentOrders.map((order) => (
                  <div 
                    key={order.orderId} 
                    className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg hover:shadow-md transition-all duration-300 space-y-3 border border-blue-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <ShoppingCart className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-800">#{order.orderId.slice(-8)}</p>
                          <p className="text-sm text-gray-600">{order.customerName}</p>
                          <p className="text-xs text-gray-500">{order.customerPhone}</p>
                          <p className="text-xs text-blue-600 font-medium">
                            📍 {order.deliveryAddress?.substring(0, 30)}...
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600 text-lg">₹{order.total}</p>
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
                          {new Date(order.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
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
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;