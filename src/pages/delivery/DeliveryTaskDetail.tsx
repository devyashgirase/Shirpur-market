import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Phone, CheckCircle, Navigation } from "lucide-react";
import { mockDeliveryTasks } from "@/lib/mockData";
import { useToast } from "@/hooks/use-toast";

const DeliveryTaskDetail = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const task = mockDeliveryTasks.find(t => t.id === taskId);

  if (!task) {
    return <div className="container mx-auto px-4 py-8">Task not found</div>;
  }

  const handleVerifyOTP = async () => {
    setIsVerifying(true);
    
    // Mock OTP verification
    setTimeout(() => {
      if (otp === "123456") {
        toast({
          title: "Delivery confirmed!",
          description: "Order has been successfully delivered.",
        });
        navigate("/delivery");
      } else {
        toast({
          title: "Invalid OTP",
          description: "Please check the OTP and try again.",
          variant: "destructive",
        });
      }
      setIsVerifying(false);
    }, 1000);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Delivery Details - Order #{task.order_id}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="font-semibold">Customer</Label>
                <p>{task.customer_name}</p>
              </div>
              <div>
                <Label className="font-semibold">Order Value</Label>
                <p className="text-xl font-bold text-primary">${task.total_amount?.toFixed(2)}</p>
              </div>
            </div>

            <div>
              <Label className="font-semibold flex items-center mb-2">
                <MapPin className="w-4 h-4 mr-2" />
                Delivery Address
              </Label>
              <p className="text-sm bg-muted p-3 rounded">{task.customer_address}</p>
            </div>

            {/* Mock Map */}
            <div className="bg-muted rounded-lg h-64 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-12 h-12 text-primary mx-auto mb-2" />
                <p className="text-muted-foreground">Interactive map would be here</p>
                <p className="text-sm text-muted-foreground">
                  Lat: {task.delivery_lat}, Lng: {task.delivery_lng}
                </p>
              </div>
            </div>

            <div className="flex space-x-2">
              <Button variant="outline" className="flex-1">
                <Phone className="w-4 h-4 mr-2" />
                Call Customer
              </Button>
              <Button variant="outline" className="flex-1">
                <Navigation className="w-4 h-4 mr-2" />
                Open Maps
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* OTP Verification */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              Confirm Delivery
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Enter the OTP provided by the customer to confirm delivery
            </p>
            
            <div className="space-y-2">
              <Label htmlFor="otp">6-Digit OTP</Label>
              <Input
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter OTP (demo: 123456)"
                maxLength={6}
                className="text-center text-lg tracking-wider"
              />
            </div>

            <Button 
              onClick={handleVerifyOTP}
              disabled={otp.length !== 6 || isVerifying}
              className="w-full bg-gradient-success"
            >
              {isVerifying ? "Verifying..." : "Confirm Delivery"}
            </Button>

            <div className="text-center pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Your delivery fee: <span className="font-semibold text-success">${((task.total_amount || 0) * 0.15).toFixed(2)}</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DeliveryTaskDetail;