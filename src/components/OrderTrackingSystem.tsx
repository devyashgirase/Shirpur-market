import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, User, Phone, CheckCircle, Truck } from 'lucide-react';
import { orderManagementService } from '@/lib/orderManagementService';

interface OrderTrackingSystemProps {
  orderId: string;
  userType: 'admin' | 'customer';
}

const OrderTrackingSystem = ({ orderId, userType }: OrderTrackingSystemProps) => {
  const [tracking, setTracking] = useState<any[]>([]);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrackingData();
    
    // Subscribe to real-time tracking updates
    const subscription = orderManagementService.subscribeToDeliveryTracking(
      orderId,
      (payload) => {
        if (payload.new) {
          setTracking(prev => [...prev, payload.new]);
        }
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, [orderId]);

  const loadTrackingData = async () => {
    const result = await orderManagementService.getOrderTracking(orderId);
    if (result.success) {
      setTracking(result.tracking);
    }
    setLoading(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'out_for_delivery': return <Truck className="w-4 h-4 text-blue-600" />;
      case 'delivered': return <CheckCircle className="w-4 h-4 text-green-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'out_for_delivery': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading tracking information...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Order Tracking - #{orderId.slice(-6)}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {tracking.length === 0 ? (
          <div className="text-center py-4">
            <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">No tracking updates yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tracking.map((update, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 mt-1">
                  {getStatusIcon(update.status)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <Badge className={getStatusColor(update.status)}>
                      {update.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {new Date(update.timestamp).toLocaleString()}
                    </span>
                  </div>
                  
                  {update.delivery_agents && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                      <User className="w-3 h-3" />
                      <span>{update.delivery_agents.name}</span>
                      {userType === 'admin' && (
                        <>
                          <Phone className="w-3 h-3 ml-2" />
                          <span>{update.delivery_agents.phone}</span>
                        </>
                      )}
                    </div>
                  )}
                  
                  {update.location && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                      <MapPin className="w-3 h-3" />
                      <span>Location updated</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {userType === 'customer' && tracking.length > 0 && (
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 mt-4">
            <p className="text-sm text-blue-800">
              📱 You'll receive real-time updates as your order progresses
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OrderTrackingSystem;