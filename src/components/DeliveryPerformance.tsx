import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Clock, Star, Target, TrendingUp } from "lucide-react";

const DeliveryPerformance = () => {
  const performance = {
    todayDeliveries: 12,
    onTimeRate: 94,
    avgRating: 4.8,
    totalEarnings: 850,
    weeklyTarget: 50,
    completedThisWeek: 38
  };

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