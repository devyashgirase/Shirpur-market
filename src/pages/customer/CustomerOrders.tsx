import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, Clock, CheckCircle, Truck, XCircle } from "lucide-react";
import { mockOrders } from "@/lib/mockData";

const CustomerOrders = () => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'confirmed':
      case 'preparing':
        return <Package className="w-4 h-4" />;
      case 'out_for_delivery':
        return <Truck className="w-4 h-4" />;
      case 'delivered':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'pending':
        return 'secondary';
      case 'confirmed':
      case 'preparing':
        return 'default';
      case 'out_for_delivery':
        return 'default';
      case 'delivered':
        return 'secondary';
      case 'cancelled':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">My Orders</h1>
        <p className="text-muted-foreground">Track your order history and delivery status</p>
      </div>

      <div className="space-y-6">
        {mockOrders.map((order) => (
          <Card key={order.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Order #{order.id}</CardTitle>
                <Badge variant={getStatusVariant(order.status)} className="flex items-center gap-1">
                  {getStatusIcon(order.status)}
                  {formatStatus(order.status)}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Placed on {formatDate(order.created_at)}
              </p>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">Delivery Address</p>
                  <p className="text-sm text-muted-foreground">
                    {order.customer_address}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">${order.total.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">
                    Payment: {order.payment_status === 'paid' ? '✓ Paid' : 'Pending'}
                  </p>
                </div>
              </div>

              {/* Order Status Timeline */}
              <div className="border rounded-lg p-4 bg-muted/30">
                <h4 className="font-semibold mb-3">Order Progress</h4>
                <div className="flex items-center space-x-4 overflow-x-auto">
                  {['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'].map((status, index) => (
                    <div key={status} className="flex items-center space-x-2 whitespace-nowrap">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'].indexOf(order.status) >= index
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {getStatusIcon(status)}
                      </div>
                      <span className={`text-sm ${
                        ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'].indexOf(order.status) >= index
                          ? 'text-foreground font-medium' 
                          : 'text-muted-foreground'
                      }`}>
                        {formatStatus(status)}
                      </span>
                      {index < 4 && (
                        <div className={`w-8 h-0.5 ${
                          ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'].indexOf(order.status) > index
                            ? 'bg-primary' 
                            : 'bg-muted'
                        }`} />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  View Details
                </Button>
                {order.status === 'delivered' && (
                  <Button variant="outline" size="sm">
                    Reorder
                  </Button>
                )}
                {['pending', 'confirmed'].includes(order.status) && (
                  <Button variant="outline" size="sm" className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground">
                    Cancel Order
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {mockOrders.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-24 h-24 text-muted-foreground mx-auto mb-6" />
            <h3 className="text-xl font-semibold mb-4">No orders yet</h3>
            <p className="text-muted-foreground mb-6">
              Start shopping to see your orders here
            </p>
            <Button className="bg-gradient-primary">
              Browse Products
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerOrders;