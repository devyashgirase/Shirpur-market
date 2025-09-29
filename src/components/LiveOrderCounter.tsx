import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ShoppingCart, 
  TrendingUp, 
  Bell, 
  Volume2, 
  VolumeX,
  RefreshCw
} from 'lucide-react';
import { adminRealTimeService, type AdminStats } from '@/lib/adminRealTimeService';

const LiveOrderCounter = () => {
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
  
  const [previousStats, setPreviousStats] = useState<AdminStats | null>(null);
  const [isNewOrder, setIsNewOrder] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create audio element for notifications
    audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
    
    const handleStatsUpdate = (newStats: AdminStats) => {
      if (previousStats) {
        // Check for new orders
        if (newStats.todaysOrders > previousStats.todaysOrders) {
          setIsNewOrder(true);
          
          // Play notification sound
          if (soundEnabled && audioRef.current) {
            audioRef.current.play().catch(console.error);
          }
          
          // Reset animation after 2 seconds
          setTimeout(() => setIsNewOrder(false), 2000);
        }
      }
      
      setPreviousStats(stats);
      setStats(newStats);
    };

    adminRealTimeService.subscribe('statsUpdate', handleStatsUpdate);
    
    // Initial load
    adminRealTimeService.fetchRealTimeStats().then(handleStatsUpdate);

    return () => {
      adminRealTimeService.unsubscribe('statsUpdate', handleStatsUpdate);
    };
  }, [stats, previousStats, soundEnabled]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await adminRealTimeService.forceRefresh();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <Card className={`border-0 shadow-lg transition-all duration-500 ${
      isNewOrder ? 'ring-4 ring-green-400 ring-opacity-75 animate-pulse' : ''
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <ShoppingCart className={`h-5 w-5 ${isNewOrder ? 'animate-bounce text-green-500' : 'text-blue-500'}`} />
            Live Order Counter
            {isNewOrder && (
              <Badge className="bg-green-500 text-white animate-pulse">
                NEW ORDER!
              </Badge>
            )}
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2"
            >
              {soundEnabled ? (
                <Volume2 className="h-4 w-4 text-green-500" />
              ) : (
                <VolumeX className="h-4 w-4 text-gray-400" />
              )}
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Today's Orders - Large Display */}
        <div className={`text-center p-6 rounded-xl transition-all duration-500 ${
          isNewOrder 
            ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white transform scale-105' 
            : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
        }`}>
          <div className="flex items-center justify-center gap-2 mb-2">
            <ShoppingCart className="h-6 w-6" />
            <span className="text-lg font-semibold">Today's Orders</span>
          </div>
          
          <div className={`text-5xl font-bold mb-2 transition-all duration-300 ${
            isNewOrder ? 'animate-bounce' : ''
          }`}>
            {stats.todaysOrders}
          </div>
          
          <div className="flex items-center justify-center gap-4 text-sm opacity-90">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
              <span>Live Updates</span>
            </div>
            <div>
              Last: {formatTime(stats.lastUpdated)}
            </div>
          </div>
        </div>

        {/* Revenue Display */}
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
            <div className="text-2xl font-bold text-green-600">
              ₹{stats.todaysRevenue.toFixed(0)}
            </div>
            <div className="text-sm text-green-700 font-medium">Today's Revenue</div>
            <div className="text-xs text-green-600 mt-1">
              {stats.todaysOrders > 0 ? `₹${(stats.todaysRevenue / stats.todaysOrders).toFixed(0)} avg` : '₹0 avg'}
            </div>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
            <div className="text-2xl font-bold text-blue-600">
              {stats.todaysDelivered}
            </div>
            <div className="text-sm text-blue-700 font-medium">Delivered</div>
            <div className="text-xs text-blue-600 mt-1">
              {stats.todaysPending} pending
            </div>
          </div>
        </div>

        {/* Order Status Breakdown */}
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700">Today's Order Status</div>
          
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center p-2 bg-green-50 rounded border border-green-200">
              <div className="font-bold text-green-600">{stats.todaysDelivered}</div>
              <div className="text-green-700">Delivered</div>
            </div>
            
            <div className="text-center p-2 bg-orange-50 rounded border border-orange-200">
              <div className="font-bold text-orange-600">{stats.todaysPending}</div>
              <div className="text-orange-700">Pending</div>
            </div>
            
            <div className="text-center p-2 bg-blue-50 rounded border border-blue-200">
              <div className="font-bold text-blue-600">{stats.todaysOrders}</div>
              <div className="text-blue-700">Total</div>
            </div>
          </div>
        </div>

        {/* Performance Indicators */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span className="text-gray-600">
              {stats.todaysOrders > (previousStats?.todaysOrders || 0) ? 'Growing' : 'Stable'}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Bell className={`h-4 w-4 ${soundEnabled ? 'text-green-500' : 'text-gray-400'}`} />
            <span className="text-gray-600">
              Notifications {soundEnabled ? 'ON' : 'OFF'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LiveOrderCounter;