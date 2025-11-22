import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Phone, ShoppingCart, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/lib/authService";
import { SimpleFreeOtp, OTPResult } from "@/lib/simpleFreeOtp";

interface QuickAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const QuickAuthModal = ({ isOpen, onClose, onSuccess }: QuickAuthModalProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length !== 10) {
      toast({
        title: "Invalid Phone",
        description: "Please enter a valid 10-digit phone number",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Generate and send OTP using the same service as main login
      const generatedOtp = SimpleFreeOtp.generateOTP();
      const result: OTPResult = await SimpleFreeOtp.sendOTP(phone, generatedOtp);
      
      if (result.success) {
        setShowOtpInput(true);
        
        // Show OTP in alert for testing (same as main login)
        if (window.alert) {
          window.alert(`Your OTP is: ${generatedOtp}\n\nThis is shown for testing purposes.`);
        }
        
        toast({
          title: "OTP Sent!",
          description: result.message,
        });
      } else {
        toast({
          title: "Failed to Send OTP",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter a valid 6-digit OTP",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Verify OTP using the same service as main login
      const isValidOTP = SimpleFreeOtp.verifyOTP(phone, otp);
      
      if (isValidOTP) {
        // Get or create user (same logic as main login)
        let user = await authService.getUserByPhone(phone);
        
        if (!user) {
          // Create new user
          user = {
            id: Date.now(),
            phone,
            role: 'customer',
            is_first_login_complete: false
          };
        }
        
        // Update last login and save user
        user.last_login = new Date().toISOString();
        authService.saveUser(user);
        authService.storeSession(user);
        
        // Set customer phone for cart and orders
        localStorage.setItem('customerPhone', phone);
        
        // Force cart reload to trigger transfer
        const { cartService } = await import('@/lib/cartService');
        await cartService.getCartItems(); // This will trigger transfer
        
        // Trigger cart update event
        window.dispatchEvent(new CustomEvent('cartUpdated'));
        
        // Small delay to ensure cart is updated
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('cartUpdated'));
        }, 500);
        
        toast({
          title: "Login Successful",
          description: "Welcome! Proceeding to checkout...",
        });
        onSuccess();
      } else {
        toast({
          title: "Invalid OTP",
          description: "The OTP you entered is incorrect or expired. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Verification Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestCheckout = () => {
    // Create a temporary guest session
    const guestPhone = `guest_${Date.now()}`;
    localStorage.setItem('customerPhone', guestPhone);
    localStorage.setItem('userSession', JSON.stringify({
      phone: guestPhone,
      name: 'Guest User',
      isGuest: true
    }));
    
    toast({
      title: "Guest Checkout",
      description: "Proceeding as guest user",
    });
    onSuccess();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl font-bold text-center">
            <ShoppingCart className="w-6 h-6 mr-2 text-orange-500" />
            Quick Checkout
          </DialogTitle>
          <p className="text-gray-600 text-sm text-center">Login or create account to continue</p>
        </DialogHeader>

        <div className="space-y-4">
          {!showOtpInput ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter 10-digit phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    className="pl-10"
                    maxLength={10}
                    required
                  />
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-orange-500 hover:bg-orange-600"
                disabled={isLoading || phone.length !== 10}
              >
                {isLoading ? "Sending OTP..." : "Send OTP"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <Label htmlFor="otp">Enter OTP</Label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="otp"
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="pl-10 text-center text-lg tracking-widest"
                    maxLength={6}
                    required
                  />
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  OTP sent to +91 {phone}
                </p>
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={isLoading || otp.length !== 6}
              >
                {isLoading ? "Verifying..." : "Verify & Continue"}
              </Button>
              
              <Button 
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => {
                  setShowOtpInput(false);
                  setOtp('');
                }}
              >
                Change Phone Number
              </Button>
            </form>
          )}
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or</span>
          </div>
        </div>

        <Button 
          onClick={handleGuestCheckout}
          variant="outline" 
          className="w-full border-2 border-gray-300 hover:bg-gray-50"
        >
          Continue as Guest
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default QuickAuthModal;