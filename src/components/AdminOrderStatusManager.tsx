import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Truck, Clock, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { orderManagementService } from '@/lib/orderManagementService';

interface AdminOrderStatusManagerProps {
  order: any;
  onStatusUpdate: () => void;
}

const AdminOrderStatusManager = ({ order, onStatusUpdate }: AdminOrderStatusManagerProps) => {
  const [updating, setUpdating] = useState(false);
  const { toast } = useToast();

  const markReadyForDelivery = async () => {
    setUpdating(true);
    
    const result = await orderManagementService.markOrderReadyForDelivery(order.id);
    
    if (result.success) {
      toast({
        title: "Order Ready for Delivery!",
        description: `Order #${order.id.slice(-6)} has been sent to all delivery agents`,
      });
      onStatusUpdate();
    } else {
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive"
      });
    }
    
    setUpdating(false);
  };

  const markOutForDelivery = async () => {
    setUpdating(true);
    
    const result = await orderManagementService.markOrderOutForDelivery(order.id);
    
    if (result.success) {
      toast({
        title: "Order Out for Delivery!",
        description: `Order #${order.id.slice(-6)} is now visible to all delivery agents`,
      });
      onStatusUpdate();
    } else {
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive"
      });
    }
    
    setUpdating(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'preparing': return 'bg-orange-100 text-orange-800';
      case 'ready_for_delivery': return 'bg-purple-100 text-purple-800';
      case 'out_for_delivery': return 'bg-green-100 text-green-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const canMarkReady = order.status === 'preparing';
  const canMarkOutForDelivery = ['confirmed', 'preparing', 'ready_for_delivery'].includes(order.status);
  const isOutForDelivery = order.status === 'out_for_delivery';

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">Order #{order.id?.slice(-6)}</CardTitle>
            <p className="text-sm text-gray-600">{order.customer_name}</p>
          </div>
          <Badge className={getStatusColor(order.status)}>
            {order.status?.replace('_', ' ').toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="text-sm text-gray-600">
          <p><strong>Amount:</strong> ₹{order.total_amount}</p>
          <p><strong>Address:</strong> {order.customer_address}</p>
          {order.delivery_agent_name && (
            <p><strong>Delivery Agent:</strong> {order.delivery_agent_name}</p>
          )}
        </div>

        {canMarkReady && (
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800 mb-3">
              Order is prepared and ready to be sent to delivery agents
            </p>
            <Button 
              onClick={markReadyForDelivery}
              disabled={updating}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {updating ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Truck className="w-4 h-4 mr-2" />
              )}
              Mark Ready for Delivery
            </Button>
          </div>
        )}

        {canMarkOutForDelivery && (
          <div className="bg-green-50 p-3 rounded-lg border border-green-200">
            <p className="text-sm text-green-800 mb-3">
              Directly mark order as out for delivery (visible to all delivery agents)
            </p>
            <Button 
              onClick={markOutForDelivery}
              disabled={updating}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {updating ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Truck className="w-4 h-4 mr-2" />
              )}
              Mark Out for Delivery
            </Button>
          </div>
        )}

        {order.status === 'ready_for_delivery' && (
          <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
            <div className="flex items-center gap-2 text-purple-800">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">Waiting for delivery agent to accept...</span>
            </div>
          </div>
        )}

        {isOutForDelivery && (
          <div className="bg-green-50 p-3 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">
                Out for delivery with {order.delivery_agent_name}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminOrderStatusManager;