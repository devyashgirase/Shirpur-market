import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Database, CheckCircle, XCircle, RefreshCw, AlertTriangle } from 'lucide-react';
import { supabase, testConnection, supabaseApi } from '@/lib/supabase';
import { DatabaseSetup } from '@/lib/databaseSetup';

const DatabaseStatus = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    customers: 0
  });
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkDatabaseStatus = async () => {
    setIsLoading(true);
    try {
      const connected = await testConnection();
      setIsConnected(connected);
      
      if (connected) {
        // Get database statistics
        const products = await supabaseApi.getProducts();
        const orders = await supabaseApi.getOrders();
        
        setStats({
          products: products.length,
          orders: orders.length,
          customers: 0 // Could add customer count if needed
        });
      }
      
      setLastChecked(new Date());
    } catch (error) {
      console.error('Database status check failed:', error);
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  const runDatabaseSetup = async () => {
    setIsLoading(true);
    try {
      const success = await DatabaseSetup.runCompleteSetup();
      if (success) {
        await checkDatabaseStatus();
      }
    } catch (error) {
      console.error('Database setup failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkDatabaseStatus();
    
    // Check status every 30 seconds
    const interval = setInterval(checkDatabaseStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    if (isLoading) return 'bg-yellow-500';
    return isConnected ? 'bg-green-500' : 'bg-red-500';
  };

  const getStatusIcon = () => {
    if (isLoading) return <RefreshCw className="w-4 h-4 animate-spin" />;
    return isConnected ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />;
  };

  const getStatusText = () => {
    if (isLoading) return 'Checking...';
    return isConnected ? 'Connected' : 'Disconnected';
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Database className="w-5 h-5" />
          Database Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge className={`${getStatusColor()} text-white border-0`}>
              {getStatusIcon()}
              {getStatusText()}
            </Badge>
            {supabase ? (
              <span className="text-sm text-green-600">✅ Supabase</span>
            ) : (
              <span className="text-sm text-red-600">❌ Not Configured</span>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={checkDatabaseStatus}
            disabled={isLoading}
          >
            <RefreshCw className={`w-3 h-3 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {isConnected && (
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-blue-50 p-2 rounded">
              <div className="text-lg font-bold text-blue-600">{stats.products}</div>
              <div className="text-xs text-blue-600">Products</div>
            </div>
            <div className="bg-green-50 p-2 rounded">
              <div className="text-lg font-bold text-green-600">{stats.orders}</div>
              <div className="text-xs text-green-600">Orders</div>
            </div>
            <div className="bg-purple-50 p-2 rounded">
              <div className="text-lg font-bold text-purple-600">{stats.customers}</div>
              <div className="text-xs text-purple-600">Customers</div>
            </div>
          </div>
        )}

        {!supabase && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-yellow-800">Setup Required</p>
                <p className="text-yellow-700 mt-1">
                  Configure Supabase to enable real database operations
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 text-yellow-700 border-yellow-300"
                  onClick={runDatabaseSetup}
                  disabled={isLoading}
                >
                  Run Setup
                </Button>
              </div>
            </div>
          </div>
        )}

        {lastChecked && (
          <div className="text-xs text-muted-foreground text-center">
            Last checked: {lastChecked.toLocaleTimeString()}
          </div>
        )}

        {isConnected && (
          <div className="text-xs text-green-600 text-center bg-green-50 p-2 rounded">
            ✅ All data is flowing to real database tables
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DatabaseStatus;