import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { OrderStatusService, OrderStatus } from '@/lib/orderStatusService';
import { orderManagementService } from '@/lib/orderManagementService';
import OrderStatusFlow from './OrderStatusFlow';

interface EnhancedOrderStatusManagerProps {
  order: any;
  onStatusUpdate: () => void;
}

const EnhancedOrderStatusManager = ({ order, onStatusUpdate }: EnhancedOrderStatusManagerProps) => {
  const [updating, setUpdating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>(order.status);
  const { toast } = useToast();

  const currentStatusInfo = OrderStatusService.getStatusInfo(order.status);
  const nextStatuses = OrderStatusService.getNextStatuses(order.status);

  const updateOrderStatus = async (newStatus: OrderStatus) => {
    const validation = OrderStatusService.validateTransition(order.status, newStatus);
    
    if (!validation.valid) {
      toast({
        title: "Invalid Status Change",
        description: validation.reason,
        variant: "destructive"
      });
      return;
    }

    setUpdating(true);
    
    try {
      let result;
      
      // Use specific methods for certain transitions
      if (newStatus === 'ready_for_delivery') {
        result = await orderManagementService.markOrderReadyForDelivery(order.id);
      } else if (newStatus === 'out_for_delivery') {
        result = await orderManagementService.markOrderOutForDelivery(order.id);
      } else {
        // Generic status update
        result = await orderManagementService.updateOrderStatus(order.id, newStatus, 'admin');
      }
      
      if (result.success) {
        toast({
          title: "Status Updated!",
          description: `Order #${order.id.slice(-6)} is now ${OrderStatusService.getStatusInfo(newStatus).label}`,
        });
        onStatusUpdate();
      } else {
        toast({
          title: "Update Failed",
          description: result.error || "Failed to update order status",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    }
    
    setUpdating(false);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg">Order #{order.id?.slice(-6)}</CardTitle>
              <p className="text-sm text-gray-600">{order.customer_name}</p>
            </div>
            <Badge {...OrderStatusService.getStatusBadgeProps(order.status)}>
              {OrderStatusService.getStatusInfo(order.status).label}
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

          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-800 mb-2">
              <strong>Current Status:</strong> {currentStatusInfo.description}
            </p>
            <p className="text-xs text-blue-600">
              Estimated time remaining: {OrderStatusService.getEstimatedDeliveryTime(order.status)} minutes
            </p>
          </div>

          {nextStatuses.length > 0 && !currentStatusInfo.isTerminal && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-700">Quick Actions:</p>
              <div className="flex flex-wrap gap-2">
                {nextStatuses.map((statusInfo) => (
                  <Button
                    key={statusInfo.status}
                    onClick={() => updateOrderStatus(statusInfo.status)}
                    disabled={updating}
                    size="sm"
                    className={`${statusInfo.bgColor} ${statusInfo.color} hover:opacity-80`}
                  >
                    {updating ? (
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current mr-1"></div>
                    ) : (
                      <span className="mr-1">{statusInfo.icon}</span>
                    )}
                    {statusInfo.label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Manual Status Change:</p>
            <div className="flex gap-2">
              <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as OrderStatus)}>
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {OrderStatusService.getAdminStatuses().map((statusInfo) => (
                    <SelectItem key={statusInfo.status} value={statusInfo.status}>
                      {statusInfo.icon} {statusInfo.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={() => updateOrderStatus(selectedStatus)}
                disabled={updating || selectedStatus === order.status}
                size="sm"
              >
                Update
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <OrderStatusFlow currentStatus={order.status} showDescription={false} showTimeline={true} />
    </div>
  );
};

export default EnhancedOrderStatusManager;