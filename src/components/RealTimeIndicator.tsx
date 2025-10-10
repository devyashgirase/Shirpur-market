import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Zap, Wifi, WifiOff } from 'lucide-react';
import { realTimeDataService } from '@/lib/realTimeDataService';

const RealTimeIndicator = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    // Subscribe to all data updates
    const handleUpdate = () => {
      setIsUpdating(true);
      setLastUpdate(new Date());
      setIsConnected(true);
      
      // Reset updating state after animation
      setTimeout(() => setIsUpdating(false), 1000);
    };

    realTimeDataService.subscribe('products', handleUpdate);
    realTimeDataService.subscribe('orders', handleUpdate);
    realTimeDataService.subscribe('deliveryAgents', handleUpdate);
    realTimeDataService.subscribe('marketTrends', handleUpdate);

    // Check connection status
    const checkConnection = () => {
      setIsConnected(navigator.onLine);
    };

    window.addEventListener('online', checkConnection);
    window.addEventListener('offline', checkConnection);

    return () => {
      realTimeDataService.unsubscribe('products', handleUpdate);
      realTimeDataService.unsubscribe('orders', handleUpdate);
      realTimeDataService.unsubscribe('deliveryAgents', handleUpdate);
      realTimeDataService.unsubscribe('marketTrends', handleUpdate);
      window.removeEventListener('online', checkConnection);
      window.removeEventListener('offline', checkConnection);
    };
  }, []);

  // Only show indicator when offline or updating
  if (!isUpdating && isConnected) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-40 flex items-center gap-2">
      {/* Connection Status - only when offline */}
      {!isConnected && (
        <Badge 
          variant="destructive"
          className="flex items-center gap-1 bg-red-500 text-white animate-pulse"
        >
          <WifiOff className="w-3 h-3" />
          Offline
        </Badge>
      )}

      {/* Real-time Update Indicator - only when updating */}
      {isUpdating && (
        <Badge 
          variant="outline"
          className="flex items-center gap-1 bg-blue-500 text-white border-blue-500 animate-pulse"
        >
          <Zap className="w-3 h-3 animate-spin" />
          Updating...
        </Badge>
      )}
    </div>
  );
};

export default RealTimeIndicator;