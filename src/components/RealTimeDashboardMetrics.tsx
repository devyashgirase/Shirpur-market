import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingCart, 
  DollarSign, 
  TrendingUp, 
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { adminRealTimeService, type AdminStats } from '@/lib/adminRealTimeService';

const RealTimeDashboardMetrics = () => {
  const [stats, setStats] = useState<AdminStats>({
    totalOrders: 0,
    totalCustomers: 0,
    totalRevenue: 0,
    todaysOrders: 0,
    todaysRevenue: 0,
    paidOrders: 0,
    pendingPayments: 0,
    todaysDelivered: 0,
    todaysPending: 0,
    avgOrderValue: 0,
    lastUpdated: new Date().toISOString()
  });
  
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  useEffect(() => {
    const handleStatsUpdate = (newStats: AdminStats) => {
      setIsUpdating(true);
      setStats(newStats);
      setLastUpdate(new Date().toLocaleTimeString());
      
      // Reset updating indicator after animation
      setTimeout(() => setIsUpdating(false), 500);
    };

    adminRealTimeService.subscribe('statsUpdate', handleStatsUpdate);
    
    // Initial load
    adminRealTimeService.fetchRealTimeStats().then(handleStatsUpdate);

    return () => {
      adminRealTimeService.unsubscribe('statsUpdate', handleStatsUpdate);
    };
  }, []);

  const MetricCard = ({ 
    title, 
    value, 
    icon: Icon, 
    color, 
    subtitle,
    trend 
  }: {
    title: string;
    value: string | number;
    icon: any;
    color: string;
    subtitle?: string;
    trend?: 'up' | 'down' | 'neutral';
  }) => (
    <Card className={`border-0 shadow-lg transition-all duration-500 ${isUpdating ? 'scale-105 shadow-xl' : ''}`}>
      <CardContent className={`p-4 bg-gradient-to-br ${color} text-white`}>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-xs opacity-90 font-medium">{title}</p>
            <p className={`text-2xl font-bold mt-1 transition-all duration-300 ${isUpdating ? 'animate-pulse' : ''}`}>
              {value}
            </p>
            {subtitle && (
              <p className="text-xs opacity-75 mt-1">{subtitle}</p>
            )}
          </div>
          <div className="flex flex-col items-center">
            <Icon className="h-6 w-6 opacity-80" />
            {trend && (
              <TrendingUp className={`h-3 w-3 mt-1 ${
                trend === 'up' ? 'text-green-300' : 
                trend === 'down' ? 'text-red-300 rotate-180' : 
                'text-gray-300'
              }`} />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
      {/* Real-time Status Header */}
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isUpdating ? 'bg-yellow-300 animate-ping' : 'bg-green-300 animate-pulse'}`}></div>
          <span className="font-semibold">Real-Time Dashboard</span>
        </div>
        <div className="text-right text-sm">
          <div>Last Update: {lastUpdate}</div>
          <Badge className="bg-white/20 text-white border-0 text-xs mt-1">
            Auto-refresh: 3s
          </Badge>
        </div>
      </div>

      {/* Today's Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard
          title="Today's Orders"
          value={stats.todaysOrders}
          icon={ShoppingCart}
          color="from-blue-500 to-blue-600"
          subtitle="Live count"
          trend="up"
        />
        
        <MetricCard
          title="Today's Revenue"
          value={`₹${stats.todaysRevenue.toFixed(0)}`}
          icon={DollarSign}
          color="from-green-500 to-green-600"
          subtitle="Paid orders"
          trend="up"
        />
        
        <MetricCard
          title="Delivered Today"
          value={stats.todaysDelivered}
          icon={CheckCircle}
          color="from-emerald-500 to-emerald-600"
          subtitle="Completed"
          trend="up"
        />
        
        <MetricCard
          title="Pending Today"
          value={stats.todaysPending}
          icon={AlertCircle}
          color="from-orange-500 to-orange-600"
          subtitle="In progress"
          trend="neutral"
        />
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <MetricCard
          title="Total Revenue"
          value={`₹${stats.totalRevenue.toFixed(0)}`}
          icon={TrendingUp}
          color="from-purple-500 to-purple-600"
          subtitle="All time"
          trend="up"
        />
        
        <MetricCard
          title="Average Order"
          value={`₹${stats.avgOrderValue.toFixed(0)}`}
          icon={DollarSign}
          color="from-indigo-500 to-indigo-600"
          subtitle="Per order"
          trend="neutral"
        />
        
        <MetricCard
          title="Total Orders"
          value={stats.totalOrders}
          icon={ShoppingCart}
          color="from-pink-500 to-pink-600"
          subtitle="All time"
          trend="up"
        />
      </div>

      {/* Live Update Indicator */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600">
          <Clock className="h-4 w-4" />
          <span>Data refreshes every 3 seconds</span>
          <div className={`w-2 h-2 rounded-full ${isUpdating ? 'bg-yellow-500 animate-ping' : 'bg-green-500 animate-pulse'}`}></div>
        </div>
      </div>
    </div>
  );
};

export default RealTimeDashboardMetrics;