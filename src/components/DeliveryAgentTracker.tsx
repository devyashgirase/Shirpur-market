import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Navigation, MapPin, Clock, Phone, CheckCircle } from 'lucide-react';
import { LiveTrackingService } from '@/lib/liveTrackingService';
import { useToast } from '@/hooks/use-toast';

interface DeliveryAgentTrackerProps {
  orderId: string;
  agentId: string;
}

export const DeliveryAgentTracker = ({ orderId, agentId }: DeliveryAgentTrackerProps) => {
  const { toast } = useToast();
  const [isTracking, setIsTracking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<any>(null);
  const [orderDetails, setOrderDetails] = useState<any>(null);

  useEffect(() => {
    // Load order details
    const orders = JSON.parse(localStorage.getItem('customerOrders') || '[]');
    const order = orders.find((o: any) => o.orderId === orderId);
    setOrderDetails(order);

    // Check if already tracking
    const trackingStatus = localStorage.getItem(`tracking_${orderId}`);
    if (trackingStatus === 'active') {
      setIsTracking(true);
      LiveTrackingService.startAgentTracking(orderId, agentId);
    }

    return () => {
      if (isTracking) {
        LiveTrackingService.stopTracking();
      }
    };
  }, [orderId, agentId]);

  const startTracking = () => {
    LiveTrackingService.startAgentTracking(orderId, agentId);
    setIsTracking(true);
    localStorage.setItem(`tracking_${orderId}`, 'active');
    
    toast({
      title: "Live Tracking Started",
      description: "Your location is now being shared with the customer",
    });
  };

  const stopTracking = () => {
    LiveTrackingService.stopTracking();
    setIsTracking(false);
    localStorage.removeItem(`tracking_${orderId}`);
    
    toast({
      title: "Tracking Stopped",
      description: "Location sharing has been disabled",
    });
  };

  const markAsDelivered = () => {
    // Update order status
    const orders = JSON.parse(localStorage.getItem('customerOrders') || '[]');
    const orderIndex = orders.findIndex((o: any) => o.orderId === orderId);
    
    if (orderIndex >= 0) {
      orders[orderIndex].status = 'delivered';
      orders[orderIndex].deliveredAt = new Date().toISOString();
      localStorage.setItem('customerOrders', JSON.stringify(orders));
    }

    stopTracking();
    
    toast({
      title: "Order Delivered!",
      description: "Order has been marked as delivered successfully",
    });
  };

  if (!orderDetails) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p>Loading order details...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Order Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Order #{orderId}</span>
            <Badge className={isTracking ? 'bg-green-500' : 'bg-gray-500'}>
              {isTracking ? '🟢 Live Tracking' : '⚫ Offline'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <p className="font-semibold">{orderDetails.customerName}</p>
              <p className="text-sm text-gray-600">{orderDetails.customerPhone}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Delivery Address:</p>
              <p className="text-sm text-gray-600">{orderDetails.deliveryAddress}</p>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Total Amount:</span>
              <span className="font-bold">₹{orderDetails.total}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tracking Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Navigation className="w-5 h-5" />
            <span>Live Tracking</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {!isTracking ? (
              <Button 
                onClick={startTracking}
                className="w-full bg-green-500 hover:bg-green-600"
              >
                <MapPin className="w-4 h-4 mr-2" />
                Start Live Tracking
              </Button>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-center space-x-2 p-3 bg-green-50 rounded-lg">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-700 font-medium">Sharing location with customer</span>
                </div>
                
                <Button 
                  onClick={stopTracking}
                  variant="outline"
                  className="w-full"
                >
                  Stop Tracking
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="flex-1">
              <Phone className="w-4 h-4 mr-2" />
              Call Customer
            </Button>
            <Button 
              onClick={markAsDelivered}
              className="flex-1 bg-green-500 hover:bg-green-600"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Mark Delivered
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Location Status */}
      {isTracking && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm">Location updates every 10 seconds</span>
              </div>
              <Clock className="w-4 h-4 text-gray-500" />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};