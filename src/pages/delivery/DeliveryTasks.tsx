import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, DollarSign, Clock, Navigation, Truck, Star, TrendingUp, Package } from "lucide-react";
import { DeliveryDataService } from "@/lib/deliveryDataService";
import { Link } from "react-router-dom";

const DeliveryTasks = () => {
  const [deliveryTasks, setDeliveryTasks] = useState([]);
  const [metrics, setMetrics] = useState({
    activeTasks: 0,
    availableOrders: 0,
    todaysEarnings: 0,
    completionRate: 95
  });

  useEffect(() => {
    const loadDeliveryData = async () => {
      try {
        const tasks = await DeliveryDataService.getAvailableDeliveries();
        setDeliveryTasks(tasks);
        setMetrics(DeliveryDataService.getDeliveryMetrics(tasks));
      } catch (error) {
        console.error('Failed to load delivery data:', error);
      }
    };
    
    loadDeliveryData();
    const interval = setInterval(loadDeliveryData, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleAcceptDelivery = async (orderId: string) => {
    const success = await DeliveryDataService.acceptDelivery(orderId);
    if (success) {
      // Refresh data
      const tasks = await DeliveryDataService.getAvailableDeliveries();
      setDeliveryTasks(tasks);
      setMetrics(DeliveryDataService.getDeliveryMetrics(tasks));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-orange-600 text-white p-4 sm:p-6 shadow-lg">
        <div className="flex items-center gap-3">
          <Truck className="h-8 w-8" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">My Delivery Tasks</h1>
            <p className="text-blue-100 mt-1">Manage your deliveries and track earnings</p>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Active Tasks</p>
                  <p className="text-2xl sm:text-3xl font-bold mt-1">{metrics.activeTasks}</p>
                </div>
                <Package className="h-8 w-8 text-blue-200" />
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

        {/* Tasks List */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-xl font-bold text-gray-800">Available Tasks</h2>
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
                <Card key={task.id} className="hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-bold text-gray-800">Order #{task.order_id || task.orderId}</h3>
                          <Badge className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0">
                            Pending
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
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right bg-green-50 p-4 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">₹{task.total.toFixed(0)}</p>
                        <p className="text-sm text-gray-600 mt-1">Order Value</p>
                        <div className="mt-2 pt-2 border-t border-green-200">
                          <p className="text-lg font-bold text-green-700">₹{task.estimatedEarning}</p>
                          <p className="text-xs text-gray-500">Your Earning (15%)</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      {task.status === 'confirmed' ? (
                        <Button 
                          className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-md"
                          onClick={() => handleAcceptDelivery(task.orderId)}
                        >
                          <Package className="w-4 h-4 mr-2" />
                          Accept Delivery
                        </Button>
                      ) : (
                        <Link to={`/delivery/task/${task.id}`} className="flex-1">
                          <Button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-md">
                            <Navigation className="w-4 h-4 mr-2" />
                            View Details & Navigate
                          </Button>
                        </Link>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeliveryTasks;