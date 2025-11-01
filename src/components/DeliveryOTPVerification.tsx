import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Shield, CheckCircle, AlertCircle, Phone, Clock } from "lucide-react";
import { OTPService } from "@/lib/otpService";

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
  const [otpDetails, setOtpDetails] = useState<any>(null);
  
  useEffect(() => {
    // Load OTP details for this order
    const loadOTPDetails = async () => {
      const details = await OTPService.getOTPDetails(orderId);
      setOtpDetails(details);
      console.log('📱 OTP Details loaded:', details);
    };
    loadOTPDetails();
  }, [orderId]);



  const verifyOTP = async () => {
    if (!otp || otp.length !== 4) {
      setError("Please enter a valid 4-digit OTP");
      return;
    }

    setIsVerifying(true);
    setError("");

    try {
      const result = await OTPService.verifyDeliveryOTP(orderId, otp);
      
      if (result.success) {
        onVerificationSuccess();
      } else {
        setError(result.error || "Invalid OTP. Please try again.");
      }
    } catch (error) {
      setError("Verification failed. Please try again.");
    } finally {
      setIsVerifying(false);
    }
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

        {otpDetails ? (
          <div className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="font-semibold text-green-700">OTP Already Sent</span>
              </div>
              <p className="text-sm text-green-600">
                OTP was sent to {customerPhone} when order went out for delivery.
              </p>
              <div className="mt-2 p-2 bg-white rounded border">
                <div className="flex items-center gap-2 text-xs">
                  <Clock className="w-3 h-3 text-gray-500" />
                  <span className="text-gray-600">
                    Sent: {new Date(otpDetails.created_at).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Expires: {new Date(otpDetails.expires_at).toLocaleTimeString()}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Enter OTP from Customer
              </label>
              <Input
                type="text"
                placeholder="Enter 4-digit OTP"
                value={otp}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                  setOtp(value);
                  setError("");
                }}
                className="text-center text-lg tracking-widest"
                maxLength={4}
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

            <Button
              onClick={verifyOTP}
              disabled={isVerifying || otp.length !== 4}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
            >
              {isVerifying ? "Verifying..." : "Verify & Complete Delivery"}
            </Button>
          </div>
        ) : (
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-4 w-4 text-yellow-500" />
              <span className="font-semibold text-yellow-700">No OTP Found</span>
            </div>
            <p className="text-sm text-yellow-600">
              OTP should have been sent when order status changed to 'out for delivery'.
            </p>
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