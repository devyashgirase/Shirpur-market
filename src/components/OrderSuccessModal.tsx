import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

interface OrderSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
}

const OrderSuccessModal = ({ isOpen, onClose, orderId }: OrderSuccessModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <div className="text-center py-6">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-green-600 mb-2">Order Placed Successfully!</h2>
          <p className="text-gray-600 mb-4">Order ID: {orderId}</p>
          <p className="text-sm text-gray-500 mb-6">
            Your order has been confirmed and will be delivered within 30 minutes.
          </p>
          
          <div className="space-y-3">
            <Link to="/customer/track" className="block">
              <Button className="w-full bg-blue-500 hover:bg-blue-600">
                <MapPin className="w-4 h-4 mr-2" />
                Track Your Order
              </Button>
            </Link>
            
            <Button variant="outline" onClick={onClose} className="w-full">
              Continue Shopping
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderSuccessModal;