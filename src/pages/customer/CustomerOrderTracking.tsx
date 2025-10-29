import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Truck, Clock, CheckCircle, Package, ArrowLeft } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { orderTrackingService, type TrackingData } from "@/lib/orderTrackingService";

const CustomerOrderTracking = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      navigate('/customer/orders');
      return;
    }

    const loadTracking = async () => {
      setLoading(true);
      const data = await orderTrackingService.getTrackingData(orderId);
      setTrackingData(data);
      setLoading(false);
    };

    loadTracking();

    // Subscribe to real-time updates
    const unsubscribe = orderTrackingService.subscribeToTracking(orderId, (data) => {
      setTrackingData(data);
    });

    return unsubscribe;
  }, [orderId, navigate]);

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100', text: 'Order Placed' };
      case 'confirmed':
        return { icon: Package, color: 'text-blue-600', bg: 'bg-blue-100', text: 'Order Confirmed' };
      case 'preparing':
        return { icon: Package, color: 'text-orange-600', bg: 'bg-orange-100', text: 'Preparing Order' };
      case 'out_for_delivery':
        return { icon: Truck, color: 'text-primary', bg: 'bg-blue-100', text: 'Out for Delivery' };
      case 'delivered':
        return { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100', text: 'Delivered' };
      default:
        return { icon: Clock, color: 'text-gray-600', bg: 'bg-gray-100', text: 'Processing' };
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading order tracking...</p>
        </div>
      </div>
    );
  }

  if (!trackingData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <Package className="w-24 h-24 text-muted-foreground mx-auto mb-6" />
          <h2 className="text-2xl font-bold mb-4">Order Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The order you're looking for could not be found
          </p>
          <Button onClick={() => navigate('/customer/orders')}>
            View My Orders
          </Button>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(trackingData.status);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/customer/orders')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Orders
            </Button>
            <div className="flex-1 text-center">
              <h1 className="text-2xl md:text-3xl font-bold">Track Your Order</h1>
            </div>
          </div>
          <p className="text-sm md:text-base text-muted-foreground px-4">Real-time order tracking from Supabase</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <StatusIcon className={`w-6 h-6 mr-2 ${statusInfo.color}`} />
              <span className="truncate">Order #{trackingData.orderId}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4 gap-2">
              <Badge className={`${statusInfo.bg} ${statusInfo.color} border-0 text-sm w-fit`}>
                {statusInfo.text}
              </Badge>
            </div>
            
            {trackingData.status === 'confirmed' && (
              <div className="bg-blue-50 p-3 rounded text-sm text-blue-800 mt-3">
                ✅ Your order has been confirmed and is being prepared.
              </div>
            )}
            {trackingData.status === 'preparing' && (
              <div className="bg-orange-50 p-3 rounded text-sm text-orange-800 mt-3">
                📦 Your order is being prepared and will be out for delivery soon.
              </div>
            )}
            {trackingData.status === 'out_for_delivery' && (
              <div className="bg-blue-50 p-3 rounded text-sm text-blue-800 mt-3">
                🚚 Your order is on the way!
                {trackingData.deliveryAgentLocation && (
                  <div className="mt-2 text-sm">
                    📍 Live location tracking active
                  </div>
                )}
              </div>
            )}
            {trackingData.status === 'delivered' && (
              <div className="bg-green-50 p-3 rounded text-sm text-green-800 mt-3">
                🎉 Your order has been delivered successfully!
              </div>
            )}
          </CardContent>
        </Card>

        {trackingData.status === 'out_for_delivery' && trackingData.deliveryAgentLocation && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Truck className="w-5 h-5 mr-2" />
                Live Delivery Tracking
                <Badge className="ml-2 bg-red-500 text-white animate-pulse">
                  LIVE
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">📍 Delivery Agent Location</h4>
                  <p className="text-sm text-green-700">
                    Lat: {trackingData.deliveryAgentLocation.lat.toFixed(6)}<br/>
                    Lng: {trackingData.deliveryAgentLocation.lng.toFixed(6)}<br/>
                    Last updated: {new Date(trackingData.deliveryAgentLocation.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {trackingData.status !== 'out_for_delivery' && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6 text-center">
              <Package className="w-12 h-12 mx-auto text-blue-600 mb-4" />
              <h3 className="text-lg font-semibold text-blue-800 mb-2">Live Tracking Not Available</h3>
              <p className="text-blue-700">
                Live tracking will be available when your order is out for delivery
              </p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Delivery Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold mb-2">Delivery Address</h4>
                <div className="bg-muted p-3 rounded">
                  <p className="text-sm">{trackingData.customerAddress}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold">Status History</h4>
                {trackingData.statusHistory.map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
                    <span className="capitalize">{item.status.replace('_', ' ')}</span>
                    <span className="text-sm text-muted-foreground">
                      {new Date(item.timestamp).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CustomerOrderTracking;