import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Truck, CheckCircle, AlertCircle } from 'lucide-react';

const SystemInitializationStatus = () => {
  const [status, setStatus] = useState<{
    initialized: boolean;
    message: string;
    agentsCreated?: number;
  }>({
    initialized: false,
    message: 'Initializing system...'
  });

  useEffect(() => {
    const handleSystemInitialized = (event: CustomEvent) => {
      setStatus({
        initialized: true,
        message: event.detail.message,
        agentsCreated: event.detail.agentsCreated
      });
      
      // Hide after 5 seconds
      setTimeout(() => {
        setStatus(prev => ({ ...prev, message: '' }));
      }, 5000);
    };

    window.addEventListener('systemInitialized', handleSystemInitialized as EventListener);
    
    return () => {
      window.removeEventListener('systemInitialized', handleSystemInitialized as EventListener);
    };
  }, []);

  if (!status.message) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <Card className="bg-white/95 backdrop-blur-sm shadow-lg border-l-4 border-l-green-500">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            {status.initialized ? (
              <CheckCircle className="w-6 h-6 text-green-500" />
            ) : (
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Truck className="w-4 h-4 text-blue-600" />
                <span className="font-semibold text-sm">Shirpur Delivery</span>
                <Badge variant="secondary" className="text-xs">
                  {status.initialized ? 'Ready' : 'Starting'}
                </Badge>
              </div>
              <p className="text-sm text-gray-600">{status.message}</p>
              {status.agentsCreated && (
                <p className="text-xs text-green-600 mt-1">
                  🚚 {status.agentsCreated} delivery agents available
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemInitializationStatus;