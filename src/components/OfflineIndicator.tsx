import { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const OfflineIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOffline, setShowOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOffline(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showOffline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 safe-top">
      <Alert className="rounded-none border-0 bg-red-500 text-white">
        <WifiOff className="h-4 w-4" />
        <AlertDescription className="text-sm">
          No internet connection. Some features may not work.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default OfflineIndicator;