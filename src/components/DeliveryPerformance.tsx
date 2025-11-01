import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Clock, Star, Target, TrendingUp } from "lucide-react";
import { deliveryAuthService } from "@/lib/deliveryAuthService";

const DeliveryPerformance = () => {
  const [performance, setPerformance] = useState({
    todayDeliveries: 0,
    onTimeRate: 0,
    avgRating: 4.8,
    totalEarnings: 0,
    weeklyTarget: 50,
    completedThisWeek: 0
  });
  
  useEffect(() => {
    const calculateRealTimePerformance = async () => {
      try {
        const currentAgent = await deliveryAuthService.getCurrentAgent();
        if (!currentAgent) return;
        
        const { supabaseApi } = await import('@/lib/supabase');
        const allOrders = await supabaseApi.getOrders();
        
        // Filter orders for current agent
        const agentOrders = allOrders.filter((order: any) => 
          order.delivery_agent_id === currentAgent.userId
        );
        
        // Calculate today's deliveries
        const today = new Date().toDateString();
        const todayOrders = agentOrders.filter((order: any) => 
          new Date(order.created_at).toDateString() === today &&
          (order.status === 'delivered' || order.order_status === 'delivered')
        );
        
        // Calculate this week's deliveries
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        const weekOrders = agentOrders.filter((order: any) => 
          new Date(order.created_at) >= weekStart &&
          (order.status === 'delivered' || order.order_status === 'delivered')
        );
        
        // Calculate earnings (15% of order value)
        const todayEarnings = todayOrders.reduce((sum: number, order: any) => 
          sum + (Number(order.total_amount) * 0.15), 0
        );
        
        // Calculate on-time rate (mock calculation)
        const onTimeRate = agentOrders.length > 0 ? 
          Math.min(95, 85 + (agentOrders.length * 2)) : 0;
        
        setPerformance({
          todayDeliveries: todayOrders.length,
          onTimeRate: Math.round(onTimeRate),
          avgRating: 4.8, // Mock rating
          totalEarnings: Math.round(todayEarnings),
          weeklyTarget: 50,
          completedThisWeek: weekOrders.length
        });
        
        console.log('📊 Performance calculated:', {
          agentId: currentAgent.userId,
          todayDeliveries: todayOrders.length,
          weeklyDeliveries: weekOrders.length,
          earnings: Math.round(todayEarnings)
        });
        
      } catch (error) {
        console.error('Error calculating performance:', error);
      }
    };
    
    calculateRealTimePerformance();
    
    // Refresh every 30 seconds
    const interval = setInterval(calculateRealTimePerformance, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const weeklyProgress = (performance.completedThisWeek / performance.weeklyTarget) * 100;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Today</p>
              <p className="text-2xl font-bold">{performance.todayDeliveries}</p>
              <p className="text-xs text-blue-200">Deliveries</p>
            </div>
            <Target className="h-8 w-8 text-blue-200" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">On-Time</p>
              <p className="text-2xl font-bold">{performance.onTimeRate}%</p>
              <p className="text-xs text-green-200">Rate</p>
            </div>
            <Clock className="h-8 w-8 text-green-200" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm">Rating</p>
              <p className="text-2xl font-bold">{performance.avgRating}</p>
              <p className="text-xs text-yellow-200">Average</p>
            </div>
            <Star className="h-8 w-8 text-yellow-200" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Earnings</p>
              <p className="text-2xl font-bold">₹{performance.totalEarnings}</p>
              <p className="text-xs text-purple-200">Today</p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-200" />
          </div>
        </CardContent>
      </Card>

      <Card className="col-span-2 lg:col-span-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Weekly Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span>Deliveries Completed</span>
              <Badge variant="outline">{performance.completedThisWeek}/{performance.weeklyTarget}</Badge>
            </div>
            <Progress value={weeklyProgress} className="h-3" />
            <p className="text-sm text-gray-600">
              {performance.weeklyTarget - performance.completedThisWeek} more deliveries to reach weekly target
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeliveryPerformance;