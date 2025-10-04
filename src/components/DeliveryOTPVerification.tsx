import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Shield, CheckCircle, AlertCircle, Phone } from "lucide-react";

interface DeliveryOTPVerificationProps {
  orderId: string;
  customerPhone: string;
  customerName: string;
  onVerificationSuccess: () => void;
  onCancel: () => void;
}

const DeliveryOTPVerification = ({ 
  orderId, 
  customerPhone, 
  customerName, 
  onVerificationSuccess, 
  onCancel 
}: DeliveryOTPVerificationProps) => {
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  // Generate and store OTP
  const generateOTP = () => {
    const generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
    localStorage.setItem(`delivery_otp_${orderId}`, generatedOTP);
    return generatedOTP;
  };

  const sendOTP = async () => {
    try {
      const generatedOTP = generateOTP();
      
      // Simulate SMS sending (in real app, integrate with SMS service)
      console.log(`📱 Sending OTP ${generatedOTP} to ${customerPhone}`);
      
      // Store OTP with timestamp
      localStorage.setItem(`delivery_otp_${orderId}`, JSON.stringify({
        otp: generatedOTP,
        timestamp: Date.now(),
        phone: customerPhone
      }));
      
      setOtpSent(true);
      setError("");
      
      // Show success message
      alert(`📱 OTP sent to customer ${customerName} at ${customerPhone}\n\nFor demo: OTP is ${generatedOTP}`);
      
    } catch (error) {
      console.error("Failed to send OTP:", error);
      setError("Failed to send OTP. Please try again.");
    }
  };

  const verifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setIsVerifying(true);
    setError("");

    try {
      // Get stored OTP
      const storedOTPData = localStorage.getItem(`delivery_otp_${orderId}`);
      
      if (!storedOTPData) {
        setError("OTP not found. Please request a new OTP.");
        setIsVerifying(false);
        return;
      }

      const otpData = JSON.parse(storedOTPData);
      const currentTime = Date.now();
      const otpAge = currentTime - otpData.timestamp;
      
      // Check if OTP is expired (5 minutes)
      if (otpAge > 5 * 60 * 1000) {
        setError("OTP has expired. Please request a new OTP.");
        localStorage.removeItem(`delivery_otp_${orderId}`);
        setOtpSent(false);
        setIsVerifying(false);
        return;
      }

      // Verify OTP
      if (otp === otpData.otp) {
        // OTP verified successfully
        localStorage.removeItem(`delivery_otp_${orderId}`);
        
        // Mark order as delivered
        const allOrders = JSON.parse(localStorage.getItem('allOrders') || '[]');
        const updatedOrders = allOrders.map((order: any) => {
          if (order.orderId === orderId) {
            return {
              ...order,
              status: 'delivered',
              deliveredAt: new Date().toISOString(),
              otpVerified: true
            };
          }
          return order;
        });
        
        localStorage.setItem('allOrders', JSON.stringify(updatedOrders));
        
        // Trigger success callback
        onVerificationSuccess();
        
      } else {
        setError("Invalid OTP. Please check and try again.");
      }
    } catch (error) {
      console.error("OTP verification failed:", error);
      setError("Verification failed. Please try again.");
    }
    
    setIsVerifying(false);
  };

  return (
    <Card className="w-full max-w-md mx-auto border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-2">
          <Shield className="h-12 w-12 text-orange-500" />
        </div>
        <CardTitle className="text-xl text-orange-800">
          Delivery Verification Required
        </CardTitle>
        <p className="text-sm text-gray-600 mt-2">
          Order #{orderId}
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="bg-white p-4 rounded-lg border border-orange-200">
          <div className="flex items-center gap-2 mb-2">
            <Phone className="h-4 w-4 text-blue-500" />
            <span className="font-semibold text-gray-700">Customer Details</span>
          </div>
          <p className="text-sm font-medium">{customerName}</p>
          <p className="text-sm text-gray-600">{customerPhone}</p>
        </div>

        {!otpSent ? (
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4 text-blue-500" />
                <span className="font-semibold text-blue-700">Verification Process</span>
              </div>
              <p className="text-sm text-blue-600">
                An OTP will be sent to the customer's phone. Ask the customer to share the OTP to confirm delivery.
              </p>
            </div>
            
            <Button 
              onClick={sendOTP}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
            >
              <Phone className="h-4 w-4 mr-2" />
              Send OTP to Customer
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="font-semibold text-green-700">OTP Sent Successfully</span>
              </div>
              <p className="text-sm text-green-600">
                OTP has been sent to {customerPhone}. Ask the customer to share the 6-digit code.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Enter OTP from Customer
              </label>
              <Input
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setOtp(value);
                  setError("");
                }}
                className="text-center text-lg tracking-widest"
                maxLength={6}
              />
            </div>

            {error && (
              <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                <p className="text-sm text-red-600 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={verifyOTP}
                disabled={isVerifying || otp.length !== 6}
                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
              >
                {isVerifying ? "Verifying..." : "Verify & Complete Delivery"}
              </Button>
              
              <Button
                onClick={() => {
                  setOtpSent(false);
                  setOtp("");
                  setError("");
                }}
                variant="outline"
                className="px-4"
              >
                Resend OTP
              </Button>
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-4 border-t">
          <Button
            onClick={onCancel}
            variant="outline"
            className="flex-1"
          >
            Cancel
          </Button>
        </div>

        <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
          <p className="text-xs text-yellow-700">
            <strong>Security Note:</strong> OTP verification ensures secure delivery confirmation and prevents unauthorized completion.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default DeliveryOTPVerification;