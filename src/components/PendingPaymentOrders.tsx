import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, CreditCard, X } from "lucide-react";
import { DatabaseService } from "@/lib/databaseService";
import { authService } from "@/lib/authService";

interface PendingOrder {
  id: string;
  orderId: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  createdAt: string;
}

interface PendingPaymentOrdersProps {
  onPayNow: (order: PendingOrder) => void;
  onRemove: (orderId: string) => void;
}

const PendingPaymentOrders = ({ onPayNow, onRemove }: PendingPaymentOrdersProps) => {
  const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([]);

  useEffect(() => {
    const loadPendingOrders = async () => {
      try {
        const user = authService.getCurrentUser();
        if (!user?.phone) return;
        
        const orders = await DatabaseService.getOrders();
        const userPendingOrders = orders
          .filter(order => 
            order.customer_phone === user.phone && 
            order.payment_status === 'pending'
          )
          .map(order => ({
            id: order.id?.toString() || order.order_id,
            orderId: order.order_id,
            items: JSON.parse(order.items || '[]'),
            total: order.total_amount || order.total,
            createdAt: order.created_at || order.createdAt
          }));
        
        setPendingOrders(userPendingOrders);
      } catch (error) {
        console.error('Failed to load pending orders:', error);
      }
    };

    loadPendingOrders();
    const interval = setInterval(loadPendingOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleRemoveOrder = async (orderId: string) => {
    try {
      await DatabaseService.updateOrderStatus(orderId, 'cancelled');
      const updatedOrders = pendingOrders.filter(order => order.orderId !== orderId);
      setPendingOrders(updatedOrders);
      onRemove(orderId);
    } catch (error) {
      console.error('Failed to remove order:', error);
    }
  };

  if (pendingOrders.length === 0) return null;

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-700">
          <Clock className="h-5 w-5" />
          Pending Payment Orders
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {pendingOrders.map((order) => (
          <div key={order.orderId} className="bg-white p-3 rounded-lg border border-orange-200">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-semibold text-sm">Order #{order.orderId}</p>
                <p className="text-xs text-gray-600">
                  {new Date(order.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-orange-600 border-orange-300">
                  Payment Pending
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveOrder(order.orderId)}
                  className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
            
            <div className="text-xs text-gray-600 mb-2">
              {order.items.map((item, index) => (
                <span key={index}>
                  {item.name} x{item.quantity}
                  {index < order.items.length - 1 ? ', ' : ''}
                </span>
              ))}
            </div>
            
            <div className="flex justify-between items-center">
              <p className="font-bold text-green-600">₹{order.total.toFixed(2)}</p>
              <Button
                size="sm"
                onClick={() => onPayNow(order)}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                <CreditCard className="h-3 w-3 mr-1" />
                Pay Now
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default PendingPaymentOrders;