import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { CreditCard, Smartphone, Wallet, Lock, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Razorpay types
declare global {
  interface Window {
    Razorpay: any;
  }
}

interface PaymentGatewayProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  onSuccess: (paymentId?: string, isTestMode?: boolean) => void;
}

const PaymentGateway = ({ isOpen, onClose, amount, onSuccess }: PaymentGatewayProps) => {
  const { toast } = useToast();
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'wallet'>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Form states
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [upiId, setUpiId] = useState('');

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleRazorpayPayment = () => {
    setIsProcessing(true);
    
    const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_1DP5mmOlF5G5ag';
    const isTestMode = razorpayKey.includes('test');
    
    const options = {
      key: razorpayKey,
      amount: Math.round(amount * 100), // Amount in paise
      currency: 'INR',
      name: 'Shirpur Delivery',
      description: 'Order Payment',
      image: '/favicon.ico',
      handler: function (response: any) {
        setIsProcessing(false);
        setIsSuccess(true);
        
        // Both test and live payments are considered successful here
        const isTestMode = options.key.includes('test');
        const paymentId = response.razorpay_payment_id || `test_${Date.now()}`;
        
        setTimeout(() => {
          toast({
            title: "Payment Successful!",
            description: isTestMode ? 
              "Test payment completed - Order will be created and tracked!" : 
              `Payment ID: ${paymentId} - Order confirmed!`,
          });
          
          // Call onSuccess with payment details for order creation
          onSuccess(paymentId, isTestMode);
          onClose();
          setIsSuccess(false);
        }, 2000);
      },
      prefill: {
        name: 'Customer Name',
        email: 'customer@example.com',
        contact: '9999999999'
      },
      notes: {
        address: 'Shirpur Delivery Address'
      },
      theme: {
        color: '#3B82F6'
      },
      modal: {
        ondismiss: function() {
          setIsProcessing(false);
          toast({
            title: "Payment Cancelled",
            description: "Payment was cancelled by user.",
            variant: "destructive"
          });
        }
      }
    };
    
    if (window.Razorpay) {
      const rzp = new window.Razorpay(options);
      rzp.open();
    } else {
      toast({
        title: "Payment Error",
        description: "Payment gateway not loaded. Please try again.",
        variant: "destructive"
      });
      setIsProcessing(false);
    }
  };

  const handleUPIPayment = () => {
    if (!upiId) {
      toast({
        title: "UPI ID Required",
        description: "Please enter your UPI ID",
        variant: "destructive"
      });
      return;
    }
    handleRazorpayPayment();
  };

  const handlePayment = () => {
    if (paymentMethod === 'upi') {
      handleUPIPayment();
    } else {
      handleRazorpayPayment();
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  if (isSuccess) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-green-600 mb-2">Payment Successful!</h2>
            <p className="text-muted-foreground">Your order has been placed successfully.</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Lock className="w-5 h-5 mr-2" />
            Secure Payment
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Amount Display */}
          <div className="bg-muted p-4 rounded-lg text-center">
            <p className="text-sm text-muted-foreground">Total Amount</p>
            <p className="text-2xl font-bold text-primary">₹{amount.toFixed(2)}</p>
          </div>

          {/* Payment Method Selection */}
          <div className="space-y-3">
            <Label>Select Payment Method</Label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={paymentMethod === 'card' ? 'default' : 'outline'}
                onClick={() => setPaymentMethod('card')}
                className="flex flex-col items-center p-4 h-auto"
              >
                <CreditCard className="w-6 h-6 mb-2" />
                <span className="text-xs">Card</span>
              </Button>
              <Button
                variant={paymentMethod === 'upi' ? 'default' : 'outline'}
                onClick={() => setPaymentMethod('upi')}
                className="flex flex-col items-center p-4 h-auto"
              >
                <Smartphone className="w-6 h-6 mb-2" />
                <span className="text-xs">UPI</span>
              </Button>
              <Button
                variant={paymentMethod === 'wallet' ? 'default' : 'outline'}
                onClick={() => setPaymentMethod('wallet')}
                className="flex flex-col items-center p-4 h-auto"
              >
                <Wallet className="w-6 h-6 mb-2" />
                <span className="text-xs">Wallet</span>
              </Button>
            </div>
          </div>

          <Separator />

          {/* Payment Forms */}
          {paymentMethod === 'card' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input
                  id="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                  maxLength={19}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expiry">Expiry Date</Label>
                  <Input
                    id="expiry"
                    placeholder="MM/YY"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    maxLength={5}
                  />
                </div>
                <div>
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    placeholder="123"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    maxLength={3}
                    type="password"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="cardName">Cardholder Name</Label>
                <Input
                  id="cardName"
                  placeholder="John Doe"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                />
              </div>
            </div>
          )}

          {paymentMethod === 'upi' && (
            <div className="space-y-4">
              <div className="bg-blue-50 p-3 rounded text-sm text-blue-800">
                <p>Pay using any UPI app - GPay, PhonePe, Paytm, BHIM, etc.</p>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="p-2">
                  <div className="w-8 h-8 bg-blue-600 rounded mx-auto mb-1"></div>
                  <span className="text-xs">GPay</span>
                </div>
                <div className="p-2">
                  <div className="w-8 h-8 bg-purple-600 rounded mx-auto mb-1"></div>
                  <span className="text-xs">PhonePe</span>
                </div>
                <div className="p-2">
                  <div className="w-8 h-8 bg-blue-800 rounded mx-auto mb-1"></div>
                  <span className="text-xs">Paytm</span>
                </div>
                <div className="p-2">
                  <div className="w-8 h-8 bg-orange-600 rounded mx-auto mb-1"></div>
                  <span className="text-xs">BHIM</span>
                </div>
              </div>
            </div>
          )}

          {paymentMethod === 'wallet' && (
            <div className="space-y-4">
              <div className="bg-green-50 p-3 rounded text-sm text-green-800">
                <p>Pay using your preferred wallet - all major wallets supported.</p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center p-2">
                  <div className="w-8 h-8 bg-blue-800 rounded mx-auto mb-1"></div>
                  <span className="text-xs">Paytm</span>
                </div>
                <div className="text-center p-2">
                  <div className="w-8 h-8 bg-orange-500 rounded mx-auto mb-1"></div>
                  <span className="text-xs">Amazon Pay</span>
                </div>
                <div className="text-center p-2">
                  <div className="w-8 h-8 bg-purple-600 rounded mx-auto mb-1"></div>
                  <span className="text-xs">Mobikwik</span>
                </div>
              </div>
            </div>
          )}

          {/* Payment Button */}
          <Button
            onClick={handlePayment}
            disabled={isProcessing}
            className="w-full bg-gradient-primary"
            size="lg"
          >
            {isProcessing ? (
              <div className="flex items-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Processing Payment...
              </div>
            ) : (
              `Pay ₹${amount.toFixed(2)}`
            )}
          </Button>

          <div className="text-center text-xs text-muted-foreground">
            <Lock className="w-3 h-3 inline mr-1" />
            Your payment information is secure and encrypted
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentGateway;