import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ShoppingCart, 
  User, 
  Phone, 
  MapPin, 
  Calendar, 
  DollarSign,
  Package,
  X
} from 'lucide-react';
import { type CustomerOrder } from '@/lib/adminRealTimeService';

interface OrderDetailsModalProps {
  order: CustomerOrder | null;
  isOpen: boolean;
  onClose: () => void;
}

const OrderDetailsModal = ({ order, isOpen, onClose }: OrderDetailsModalProps) => {
  if (!order) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'out_for_delivery': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentColor = (status: string) => {
    return status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Order Details - #{order.orderId}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Status */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Badge className={getStatusColor(order.status)}>
                {order.status.replace('_', ' ').toUpperCase()}
              </Badge>
              <Badge className={getPaymentColor(order.paymentStatus)}>
                {order.paymentStatus.toUpperCase()}
              </Badge>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">₹{order.total.toFixed(0)}</div>
              <div className="text-sm text-gray-500">Total Amount</div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <User className="h-4 w-4" />
                Customer Details
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <span>{order.customerName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span>{order.customerPhone}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Order Information
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-500">Order Date:</span>
                  <div>{new Date(order.createdAt).toLocaleString()}</div>
                </div>
                <div>
                  <span className="text-gray-500">Items Count:</span>
                  <span className="ml-2 font-medium">{order.itemCount} items</span>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          {order.deliveryAddress && (
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Delivery Address
              </h3>
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm">{order.deliveryAddress}</p>
              </div>
            </div>
          )}

          {/* Order Items */}
          {order.items && order.items.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Package className="h-4 w-4" />
                Order Items ({order.items.length})
              </h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{item.product?.name || item.name}</div>
                      <div className="text-sm text-gray-500">
                        Quantity: {item.quantity} × ₹{item.price || item.product?.price || 0}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">₹{((item.quantity || 1) * (item.price || item.product?.price || 0)).toFixed(0)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Payment Summary */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Payment Summary
            </h3>
            <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium">Total Amount:</span>
                <span className="text-2xl font-bold text-green-600">₹{order.total.toFixed(0)}</span>
              </div>
              <div className="flex justify-between items-center mt-2 text-sm">
                <span>Payment Status:</span>
                <Badge className={getPaymentColor(order.paymentStatus)}>
                  {order.paymentStatus.toUpperCase()}
                </Badge>
              </div>
            </div>
          </div>

          {/* Close Button */}
          <div className="flex justify-end pt-4 border-t">
            <Button onClick={onClose} variant="outline">
              <X className="h-4 w-4 mr-2" />
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailsModal;