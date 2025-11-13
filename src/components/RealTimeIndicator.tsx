import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { WifiOff } from 'lucide-react';

const RealTimeIndicator = () => {
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    // Check connection status
    const checkConnection = () => {
      setIsConnected(navigator.onLine);
    };

    window.addEventListener('online', checkConnection);
    window.addEventListener('offline', checkConnection);

    return () => {
      window.removeEventListener('online', checkConnection);
      window.removeEventListener('offline', checkConnection);
    };
  }, []);

  // Only show indicator when offline
  if (isConnected) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-40 flex items-center gap-2">
      <Badge 
        variant="destructive"
        className="flex items-center gap-1 bg-red-500 text-white animate-pulse"
      >
        <WifiOff className="w-3 h-3" />
        Offline
      </Badge>
    </div>
  );
};

export default RealTimeIndicator;