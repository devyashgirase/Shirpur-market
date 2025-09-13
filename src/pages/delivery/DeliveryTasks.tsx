import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, DollarSign, Clock, Navigation } from "lucide-react";
import { mockDeliveryTasks } from "@/lib/mockData";
import { Link } from "react-router-dom";

const DeliveryTasks = () => {
  const totalEarnings = mockDeliveryTasks.reduce((sum, task) => sum + (task.total_amount || 0), 0) * 0.15;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">My Delivery Tasks</h1>
        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Tasks</p>
                  <p className="text-2xl font-bold">{mockDeliveryTasks.length}</p>
                </div>
                <Clock className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Today's Earnings</p>
                  <p className="text-2xl font-bold text-success">${totalEarnings.toFixed(2)}</p>
                </div>
                <DollarSign className="w-8 h-8 text-success" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completion Rate</p>
                  <p className="text-2xl font-bold">95%</p>
                </div>
                <Badge className="bg-gradient-success">Excellent</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="space-y-4">
        {mockDeliveryTasks.map((task) => (
          <Card key={task.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Order #{task.order_id}</CardTitle>
                <Badge variant="secondary">Pending</Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="font-semibold">Customer</span>
                  </div>
                  <p className="text-sm">{task.customer_name}</p>
                  <p className="text-sm text-muted-foreground">{task.customer_address}</p>
                </div>
                
                <div className="text-right">
                  <p className="text-xl font-bold text-primary">${task.total_amount?.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">Your fee: ${((task.total_amount || 0) * 0.15).toFixed(2)}</p>
                </div>
              </div>

              <div className="flex space-x-2">
                <Link to={`/delivery/task/${task.id}`} className="flex-1">
                  <Button className="w-full bg-gradient-primary">
                    <Navigation className="w-4 h-4 mr-2" />
                    Start Delivery
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DeliveryTasks;