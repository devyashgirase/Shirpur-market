import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
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
  // Calculate metrics
  const totalProducts = mockProducts.filter(p => p.is_active).length;
  const lowStockProducts = mockProducts.filter(p => p.is_active && p.stock_qty < 10).length;
  const todaysOrders = mockOrders.filter(o => {
    const today = new Date().toDateString();
    const orderDate = new Date(o.created_at).toDateString();
    return today === orderDate;
  }).length;
  const outForDelivery = mockOrders.filter(o => o.status === 'out_for_delivery').length;
  const todaysRevenue = mockOrders
    .filter(o => {
      const today = new Date().toDateString();
      const orderDate = new Date(o.created_at).toDateString();
      return today === orderDate && o.payment_status === 'paid';
    })
    .reduce((sum, o) => sum + o.total, 0);

  const deliveryTasks = mockDeliveryTasks.length;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Dashboard Overview</h1>
        <p className="text-muted-foreground">Monitor your delivery system performance</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-primary text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Orders</CardTitle>
            <ShoppingCart className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todaysOrders}</div>
            <p className="text-xs text-white/80">
              +12% from yesterday
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-success text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue Today</CardTitle>
            <DollarSign className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${todaysRevenue.toFixed(2)}</div>
            <p className="text-xs text-white/80">
              +8% from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out for Delivery</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{outForDelivery}</div>
            <p className="text-xs text-muted-foreground">
              Active deliveries
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{lowStockProducts}</div>
            <p className="text-xs text-muted-foreground">
              Need restocking
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Latest customer orders requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockOrders.slice(0, 5).map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <ShoppingCart className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Order #{order.id}</p>
                      <p className="text-sm text-muted-foreground">{order.customer_name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${order.total.toFixed(2)}</p>
                    <Badge variant={order.status === 'delivered' ? 'default' : 'secondary'}>
                      {order.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              ))}
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
              <Button className="bg-gradient-primary">
                <Package className="w-4 h-4 mr-2" />
                Add Product
              </Button>
              <Button variant="outline">
                <ShoppingCart className="w-4 h-4 mr-2" />
                View All Orders
              </Button>
              <Button variant="outline">
                <Truck className="w-4 h-4 mr-2" />
                Assign Delivery
              </Button>
              <Button variant="outline">
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