import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Truck, Clock, CheckCircle } from 'lucide-react';

interface TrackingProps {
  orderId: string;
  customerPhone: string;
}

const CustomerOrderTracking = ({ orderId, customerPhone }: TrackingProps) => {
  const [orderStatus, setOrderStatus] = useState('confirmed');
  const [deliveryLocation, setDeliveryLocation] = useState<{lat: number, lng: number} | null>(null);
  const [estimatedTime, setEstimatedTime] = useState('--');
  const [agentName, setAgentName] = useState('');

  useEffect(() => {
    // Listen for real-time tracking updates
    const handleTrackingUpdate = (event: any) => {
      if (event.detail.orderId === orderId) {
        setDeliveryLocation(event.detail.location);
        setOrderStatus(event.detail.status || 'out_for_delivery');
        setAgentName(event.detail.agentName || 'Delivery Agent');
        
        // Calculate estimated time (simple calculation)
        if (event.detail.location) {
          setEstimatedTime('15-20 min');
        }
      }
    };

    // Listen for order status changes
    const handleStatusUpdate = (event: any) => {
      if (event.detail.orderId === orderId) {
        setOrderStatus(event.detail.status);
      }
    };

    window.addEventListener('trackingStarted', handleTrackingUpdate);
    window.addEventListener('orderStatusUpdated', handleStatusUpdate);

    // Check if tracking already exists
    const existingTracking = localStorage.getItem(`tracking_${orderId}`);
    if (existingTracking) {
      const locations = JSON.parse(existingTracking);
      if (locations.length > 0) {
        setDeliveryLocation(locations[locations.length - 1]);
        setOrderStatus('out_for_delivery');
        setEstimatedTime('15-20 min');
      }
    }

    return () => {
      window.removeEventListener('trackingStarted', handleTrackingUpdate);
      window.removeEventListener('orderStatusUpdated', handleStatusUpdate);
    };
  }, [orderId]);

  const getStatusColor = (status: string) => {
    const colors = {
      confirmed: 'bg-blue-100 text-blue-800',
      preparing: 'bg-orange-100 text-orange-800',
      ready_for_delivery: 'bg-purple-100 text-purple-800',
      out_for_delivery: 'bg-green-100 text-green-800',
      delivered: 'bg-green-500 text-white'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'out_for_delivery':
        return <Truck className="w-4 h-4" />;
      case 'delivered':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-blue-500" />
          Live Order Tracking
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Order Status:</span>
          <Badge className={getStatusColor(orderStatus)}>
            {getStatusIcon(orderStatus)}
            <span className="ml-1">{orderStatus.replace('_', ' ')}</span>
          </Badge>
        </div>

        {orderStatus === 'out_for_delivery' && (
          <>
            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <Truck className="w-4 h-4 text-green-600" />
                <span className="font-medium text-green-800">Your order is on the way!</span>
              </div>
              {agentName && (
                <p className="text-sm text-green-700">Delivery Agent: {agentName}</p>
              )}
              <p className="text-sm text-green-700">Estimated Time: {estimatedTime}</p>
            </div>

            {deliveryLocation && (
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-blue-800">Live Location</span>
                </div>
                <p className="text-sm text-blue-700">
                  📍 {deliveryLocation.lat.toFixed(4)}, {deliveryLocation.lng.toFixed(4)}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Last updated: {new Date().toLocaleTimeString()}
                </p>
              </div>
            )}

            <div className="text-center">
              <button
                onClick={() => {
                  if (deliveryLocation) {
                    window.open(
                      `https://www.google.com/maps?q=${deliveryLocation.lat},${deliveryLocation.lng}`,
                      '_blank'
                    );
                  }
                }}
                className="text-blue-600 text-sm underline hover:text-blue-800"
              >
                📍 View on Google Maps
              </button>
            </div>
          </>
        )}

        {orderStatus === 'delivered' && (
          <div className="bg-green-100 p-3 rounded-lg border border-green-300 text-center">
            <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="font-medium text-green-800">Order Delivered!</p>
            <p className="text-sm text-green-700">Thank you for your order</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CustomerOrderTracking;