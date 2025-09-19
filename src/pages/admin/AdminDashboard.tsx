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
  Clock
} from "lucide-react";
import { mockProducts, mockOrders, mockDeliveryTasks } from "@/lib/mockData";

const AdminDashboard = () => {
  const [realOrders, setRealOrders] = useState([]);
  const [metrics, setMetrics] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    todaysOrders: 0,
    todaysRevenue: 0,
    outForDelivery: 0
  });

  useEffect(() => {
    const loadRealData = () => {
      const allOrders = JSON.parse(localStorage.getItem('allOrders') || '[]');
      setRealOrders(allOrders);
      
      const today = new Date().toDateString();
      
      // Calculate real metrics from actual orders
      const totalOrders = allOrders.length;
      const totalRevenue = allOrders
        .filter(o => o.paymentStatus === 'paid')
        .reduce((sum, o) => sum + o.total, 0);
      
      const todaysOrders = allOrders.filter(o => {
        const orderDate = new Date(o.timestamp).toDateString();
        return today === orderDate;
      }).length;
      
      const todaysRevenue = allOrders
        .filter(o => {
          const orderDate = new Date(o.timestamp).toDateString();
          return today === orderDate && o.paymentStatus === 'paid';
        })
        .reduce((sum, o) => sum + o.total, 0);
      
      const outForDelivery = allOrders.filter(o => o.status === 'out_for_delivery').length;
      
      setMetrics({
        totalOrders,
        totalRevenue,
        todaysOrders,
        todaysRevenue,
        outForDelivery
      });
    };
    
    loadRealData();
    const interval = setInterval(loadRealData, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  // Calculate static metrics
  const totalProducts = mockProducts.filter(p => p.is_active).length;
  const lowStockProducts = mockProducts.filter(p => p.is_active && p.stock_qty < 10).length;
  const deliveryTasks = mockDeliveryTasks.length;

  return (
    <div className="container mx-auto px-4 py-4 md:py-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2 md:mb-4">Dashboard Overview</h1>
        <p className="text-sm md:text-base text-muted-foreground">Monitor your delivery system performance</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
        <Card className="bg-gradient-primary text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Today's Orders</CardTitle>
            <ShoppingCart className="h-3 w-3 md:h-4 md:w-4" />
          </CardHeader>
          <CardContent className="pb-3">
            <div className="text-xl md:text-2xl font-bold">{metrics.todaysOrders}</div>
            <p className="text-xs text-white/80">
              Real-time
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-success text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Today's Revenue</CardTitle>
            <DollarSign className="h-3 w-3 md:h-4 md:w-4" />
          </CardHeader>
          <CardContent className="pb-3">
            <div className="text-lg md:text-2xl font-bold">₹{metrics.todaysRevenue.toFixed(2)}</div>
            <p className="text-xs text-white/80">
              Paid orders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Out for Delivery</CardTitle>
            <Truck className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pb-3">
            <div className="text-xl md:text-2xl font-bold">{metrics.outForDelivery}</div>
            <p className="text-xs text-muted-foreground">
              Active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Low Stock</CardTitle>
            <AlertTriangle className="h-3 w-3 md:h-4 md:w-4 text-warning" />
          </CardHeader>
          <CardContent className="pb-3">
            <div className="text-xl md:text-2xl font-bold text-warning">{lowStockProducts}</div>
            <p className="text-xs text-muted-foreground">
              Restock
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
        {/* Total Revenue Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Summary</CardTitle>
            <CardDescription>Total earnings from all paid deliveries</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="text-center p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  ₹{metrics.totalRevenue.toFixed(2)}
                </div>
                <p className="text-sm text-muted-foreground">Total Revenue from All Orders</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-xl font-bold text-blue-600">{metrics.totalOrders}</div>
                  <p className="text-xs text-muted-foreground">Total Orders</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-xl font-bold text-purple-600">
                    ₹{metrics.totalOrders > 0 ? (metrics.totalRevenue / metrics.totalOrders).toFixed(2) : '0.00'}
                  </div>
                  <p className="text-xs text-muted-foreground">Avg Order Value</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Latest paid orders from customers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {realOrders.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No orders yet. Orders will appear here when customers make purchases.</p>
                </div>
              ) : (
                realOrders.slice(-5).reverse().map((order) => (
                  <div key={order.orderId} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <ShoppingCart className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Order #{order.orderId}</p>
                        <p className="text-sm text-muted-foreground">{order.customerAddress?.name || 'Customer'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">₹{order.total.toFixed(2)}</p>
                      <Badge variant={order.status === 'delivered' ? 'default' : 'secondary'}>
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
              {mockProducts
                .filter(p => p.is_active && p.stock_qty < 20)
                .slice(0, 5)
                .map((product) => (
                <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-warning/10 rounded-full flex items-center justify-center">
                      <Package className="w-5 h-5 text-warning" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
                      <Progress value={(product.stock_qty / 50) * 100} className="mt-1 h-2" />
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-warning">{product.stock_qty} left</p>
                    <Button size="sm" variant="outline" className="mt-1">
                      Restock
                    </Button>
                  </div>
                </div>
              ))}
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
                <span className="font-medium">{deliveryTasks}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-success" />
                  <span>On-Time Delivery Rate</span>
                </div>
                <span className="font-medium text-success">94.5%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Truck className="w-4 h-4 text-primary" />
                  <span>Average Delivery Time</span>
                </div>
                <span className="font-medium">32 min</span>
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
  );
};

export default AdminDashboard;