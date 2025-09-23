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
  Star
} from "lucide-react";
import { AdminDataService } from "@/lib/adminDataService";
import { realTimeDataService } from "@/lib/realTimeDataService";
import RealTimeIndicator from "@/components/RealTimeIndicator";

const AdminDashboard = () => {
  const [adminOrders, setAdminOrders] = useState([]);
  const [adminProducts, setAdminProducts] = useState([]);
  const [metrics, setMetrics] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    todaysOrders: 0,
    todaysRevenue: 0,
    outForDelivery: 0
  });

  useEffect(() => {
    // Initialize real-time data service
    realTimeDataService.initializeDeliveryAgents();
    realTimeDataService.startRealTimeUpdates();
    
    const loadAdminData = async () => {
      try {
        // Get fresh dynamic data
        realTimeDataService.getFreshData('products');
        realTimeDataService.getFreshData('orders');
        
        const orders = await AdminDataService.getAdminOrders();
        const products = await AdminDataService.getAdminProducts();
        
        setAdminOrders(orders);
        setAdminProducts(products);
        setMetrics(AdminDataService.getAdminMetrics(orders));
      } catch (error) {
        console.error('Failed to load admin data:', error);
      }
    };
    
    // Subscribe to real-time updates
    const handleProductUpdate = (products: any[]) => {
      setAdminProducts(products);
    };
    
    const handleOrderUpdate = (orders: any[]) => {
      setAdminOrders(orders);
      setMetrics(AdminDataService.getAdminMetrics(orders));
    };
    
    realTimeDataService.subscribe('products', handleProductUpdate);
    realTimeDataService.subscribe('orders', handleOrderUpdate);
    
    loadAdminData();
    const interval = setInterval(loadAdminData, 5000); // More frequent updates
    
    return () => {
      clearInterval(interval);
      realTimeDataService.unsubscribe('products', handleProductUpdate);
      realTimeDataService.unsubscribe('orders', handleOrderUpdate);
      realTimeDataService.stopRealTimeUpdates();
    };
  }, []);

  // Calculate admin-specific metrics
  const totalProducts = adminProducts.filter(p => p.isActive).length;
  const lowStockProducts = adminProducts.filter(p => p.isActive && p.stockQuantity < 10).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <RealTimeIndicator />
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 sm:p-6 shadow-lg">
        <div className="flex items-center gap-3">
          <Settings className="h-8 w-8" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-blue-100 mt-1">Monitor and manage your delivery system</p>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-6">

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Today's Orders</p>
                  <p className="text-2xl sm:text-3xl font-bold mt-1">{metrics.todaysOrders}</p>
                  <p className="text-xs text-blue-200 mt-1">Real-time</p>
                </div>
                <ShoppingCart className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Today's Revenue</p>
                  <p className="text-2xl sm:text-3xl font-bold mt-1">₹{metrics.todaysRevenue.toFixed(0)}</p>
                  <p className="text-xs text-green-200 mt-1">Paid orders</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Out for Delivery</p>
                  <p className="text-2xl sm:text-3xl font-bold mt-1">{metrics.outForDelivery}</p>
                  <p className="text-xs text-orange-200 mt-1">Active</p>
                </div>
                <Truck className="h-8 w-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm font-medium">Low Stock</p>
                  <p className="text-2xl sm:text-3xl font-bold mt-1">{lowStockProducts}</p>
                  <p className="text-xs text-red-200 mt-1">Restock needed</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                    ₹{metrics.totalRevenue.toFixed(0)}
                  </div>
                  <p className="text-green-100">Total Revenue from All Orders</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                    <div className="text-xl font-bold text-blue-600">{metrics.totalOrders}</div>
                    <p className="text-xs text-gray-600">Total Orders</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                    <div className="text-xl font-bold text-purple-600">
                      ₹{metrics.totalOrders > 0 ? (metrics.totalRevenue / metrics.totalOrders).toFixed(0) : '0'}
                    </div>
                    <p className="text-xs text-gray-600">Avg Order Value</p>
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
              </CardTitle>
              <CardDescription>Latest paid orders from customers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {adminOrders.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="font-semibold text-gray-600 mb-2">No orders yet</h3>
                    <p className="text-sm">Orders will appear here when customers make purchases.</p>
                  </div>
                ) : (
                  adminOrders.slice(-5).reverse().map((order) => (
                    <div key={order.orderId} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg hover:shadow-md transition-all duration-300">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                          <ShoppingCart className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-800">Order #{order.orderId}</p>
                          <p className="text-sm text-gray-600">{order.customerName}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">₹{order.total.toFixed(0)}</p>
                        <Badge className={`${order.status === 'delivered' ? 'bg-green-500' : 'bg-orange-500'} text-white border-0`}>
                          {order.status.replace('_', ' ')}
                        </Badge>
                      </div>
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
                  <p className="text-sm">Products will appear here when loaded.</p>
                </div>
              ) : (
                adminProducts
                  .filter(p => p.isActive && p.stockQuantity < 20)
                  .slice(0, 5)
                  .map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-warning/10 rounded-full flex items-center justify-center">
                        <Package className="w-5 h-5 text-warning" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">Category: {product.category}</p>
                        <Progress value={(product.stockQuantity / 50) * 100} className="mt-1 h-2" />
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-warning">{product.stockQuantity} left</p>
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
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>Active Tasks</span>
                </div>
                <span className="font-medium">{metrics.outForDelivery}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-success" />
                  <span>On-Time Delivery Rate</span>
                </div>
                <span className="font-medium text-success">
                  {Math.floor(Math.random() * 15) + 85}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Truck className="w-4 h-4 text-primary" />
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
                View Reports
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