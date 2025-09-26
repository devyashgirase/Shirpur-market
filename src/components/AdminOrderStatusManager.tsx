import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { deliveryCoordinationService } from "@/lib/deliveryCoordinationService";

interface OrderStatusManagerProps {
  order: any;
  onStatusUpdate: (orderId: string, newStatus: string) => void;
}

const AdminOrderStatusManager = ({ order, onStatusUpdate }: OrderStatusManagerProps) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdating(true);
    
    try {
      // Update order status in localStorage
      const orders = JSON.parse(localStorage.getItem('allOrders') || '[]');
      const orderIndex = orders.findIndex((o: any) => o.orderId === order.orderId);
      
      if (orderIndex >= 0) {
        orders[orderIndex].status = newStatus;
        
        // If status is changed to 'out_for_delivery', make it available for nearby agents
        if (newStatus === 'confirmed') {
          // Remove delivery agent if going back to confirmed
          delete orders[orderIndex].deliveryAgent;
        }
        
        localStorage.setItem('allOrders', JSON.stringify(orders));
        
        // Update current order if it matches
        const currentOrder = JSON.parse(localStorage.getItem('currentOrder') || '{}');
        if (currentOrder.orderId === order.orderId) {
          currentOrder.status = newStatus;
          if (newStatus === 'confirmed') {
            delete currentOrder.deliveryAgent;
          }
          localStorage.setItem('currentOrder', JSON.stringify(currentOrder));
        }
        
        onStatusUpdate(order.orderId, newStatus);
      }
    } catch (error) {
      console.error('Failed to update order status:', error);
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