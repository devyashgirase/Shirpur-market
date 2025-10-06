import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { OrderService } from "@/lib/orderService";
import { useToast } from "@/hooks/use-toast";

interface OrderStatusManagerProps {
  order: any;
  onStatusUpdate: (orderId: string, newStatus: string) => void;
}

const AdminOrderStatusManager = ({ order, onStatusUpdate }: OrderStatusManagerProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdating(true);
    
    try {
      // Update order status using OrderService
      const success = await OrderService.updateOrderStatus(order.orderId, newStatus as any);
      
      if (success) {
        // Create delivery notification when status is 'packing' (ready for delivery)
        if (newStatus === 'packing') {
          const orderData = OrderService.getOrderById(order.orderId);
          if (orderData) {
            OrderService.createDeliveryNotification(orderData);
            
            toast({
              title: "Order Ready for Delivery",
              description: `Order ${order.orderId} is now available for delivery agents`,
            });
            
            // Trigger delivery agent notifications
            window.dispatchEvent(new CustomEvent('deliveryNotificationCreated', { detail: orderData }));
          }
        }
        
        onStatusUpdate(order.orderId, newStatus);
        
        toast({
          title: "Status Updated",
          description: `Order ${order.orderId} status changed to ${newStatus.replace('_', ' ')}`,
        });
      }
    } catch (error) {
      console.error('Failed to update order status:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update order status",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'packing': return 'bg-orange-100 text-orange-800';
      case 'out_for_delivery': return 'bg-green-100 text-green-800';
      case 'delivered': return 'bg-green-500 text-white';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex items-center gap-3">
      <Badge className={getStatusColor(order.status)}>
        {order.status.replace('_', ' ')}
      </Badge>
      
      <Select onValueChange={handleStatusChange} disabled={isUpdating}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Change Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="confirmed">Confirmed</SelectItem>
          <SelectItem value="packing">Packing</SelectItem>
          <SelectItem value="out_for_delivery">Ready for Delivery</SelectItem>
          <SelectItem value="delivered">Delivered</SelectItem>
        </SelectContent>
      </Select>
      
      {order.status === 'confirmed' && (
        <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
          Available for nearby agents
        </div>
      )}
      
      {order.status === 'out_for_delivery' && order.deliveryAgent && (
        <div className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
          Assigned to {order.deliveryAgent.name}
        </div>
      )}
    </div>
  );
};

export default AdminOrderStatusManager;