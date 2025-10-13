import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, MapPin, Package } from "lucide-react";
import { Link } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState } from "react";

interface OrderSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
}

const OrderSuccessModal = ({ isOpen, onClose, orderId }: OrderSuccessModalProps) => {
  const [orderDetails, setOrderDetails] = useState<any>(null);

  useEffect(() => {
    if (isOpen && orderId) {
      const currentOrder = JSON.parse(localStorage.getItem('currentOrder') || '{}');
      setOrderDetails(currentOrder);
    }
  }, [isOpen, orderId]);

  const handleViewOrders = () => {
    onClose();
    // Navigate to orders page
    window.location.href = '/customer/orders';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <div className="text-center py-6">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-green-600 mb-2">Order Confirmation</h2>
          <p className="text-lg font-semibold text-gray-800 mb-2">Order ID: {orderId}</p>
          
          {orderDetails && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-semibold mb-3 flex items-center">
                <Package className="w-4 h-4 mr-2" />
                Order Details
              </h3>
              
              <div className="space-y-2 text-sm">
                {orderDetails.items?.map((item: any, index: number) => (
                  <div key={index} className="flex justify-between">
                    <span>{item.product?.name || item.name} x {item.quantity}</span>
                    <span>₹{((item.product?.price || item.price) * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              
              <Separator className="my-3" />
              
              <div className="flex justify-between font-semibold text-base">
                <span>Total Amount Paid:</span>
                <span className="text-green-600">₹{orderDetails.total?.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between text-sm mt-2">
                <span>Payment Status:</span>
                <span className="text-green-600 font-medium">Success ✓</span>
              </div>
            </div>
          )}
          
          <p className="text-sm text-gray-500 mb-6">
            Your order has been confirmed and will be delivered within 30 minutes.
          </p>
          
          <div className="space-y-3">
            <Link to="/customer/orders" className="block">
              <Button onClick={handleViewOrders} className="w-full bg-blue-500 hover:bg-blue-600">
                <Package className="w-4 h-4 mr-2" />
                View My Orders
              </Button>
            </Link>
            
            <Link to="/customer/track" className="block">
              <Button variant="outline" className="w-full">
                <MapPin className="w-4 h-4 mr-2" />
                Track This Order
              </Button>
            </Link>
            
            <Link to="/customer" className="block">
              <Button variant="ghost" onClick={onClose} className="w-full">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderSuccessModal;