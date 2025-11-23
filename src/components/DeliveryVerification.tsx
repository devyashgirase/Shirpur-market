import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle, X, Shield } from 'lucide-react';

interface DeliveryVerificationProps {
  orderId: string;
  customerPhone: string;
  onVerificationSuccess: () => void;
  onCancel: () => void;
}

const DeliveryVerification = ({ orderId, customerPhone, onVerificationSuccess, onCancel }: DeliveryVerificationProps) => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const generateOTP = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
  };

  const handleVerify = async () => {
    setLoading(true);
    
    const storedOTP = localStorage.getItem(`delivery_otp_${orderId}`);
    
    if (!storedOTP) {
      // Generate OTP if not found
      const newOTP = generateOTP();
      localStorage.setItem(`delivery_otp_${orderId}`, newOTP);
      alert(`📱 OTP generated for customer: ${newOTP}`);
      setLoading(false);
      return;
    }
    
    if (otp === storedOTP) {
      localStorage.removeItem(`delivery_otp_${orderId}`);
      onVerificationSuccess();
    } else {
      alert('❌ Invalid OTP. Please try again.');
    }
    
    setLoading(false);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <Shield className="w-6 h-6 text-blue-600" />
        </div>
        <CardTitle>Delivery Verification Required</CardTitle>
        <p className="text-sm text-gray-600">Order #{orderId.slice(-8)}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-4">
            Enter the OTP provided by the customer to complete delivery
          </p>
        </div>
        
        <div className="space-y-3">
          <Input
            type="text"
            placeholder="Enter 4-digit OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value.slice(0, 4))}
            className="text-center text-lg tracking-widest"
            maxLength={4}
          />
          
          <div className="flex gap-2">
            <Button
              onClick={handleVerify}
              disabled={loading || otp.length !== 4}
              className="flex-1 bg-green-500 hover:bg-green-600"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              {loading ? 'Verifying...' : 'Verify & Complete'}
            </Button>
            
            <Button
              onClick={onCancel}
              variant="outline"
              className="px-4"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <Button
            onClick={() => {
              const newOTP = generateOTP();
              localStorage.setItem(`delivery_otp_${orderId}`, newOTP);
              alert(`📱 New OTP: ${newOTP}`);
            }}
            variant="ghost"
            className="w-full text-sm"
          >
            Generate New OTP
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DeliveryVerification;