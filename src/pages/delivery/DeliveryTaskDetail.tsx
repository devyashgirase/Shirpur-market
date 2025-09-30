import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, CheckCircle, Navigation, Play, Square } from "lucide-react";
import { mockDeliveryTasks } from "@/lib/mockData";
import { useToast } from "@/hooks/use-toast";
import { OrderService } from "@/lib/orderService";
import { NotificationService } from "@/lib/notificationService";
import { WhatsAppService } from "@/lib/whatsappService";
import { FreeSmsService } from "@/lib/freeSmsService";
import { DeliveryAgentTracker } from "@/components/DeliveryAgentTracker";

const DeliveryTaskDetail = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isDeliveryStarted, setIsDeliveryStarted] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);

  const task = mockDeliveryTasks.find((t) => t.id === taskId);

  useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  if (!task) {
    return <div className="container mx-auto px-4 py-8">Task not found</div>;
  }

  const handleStartDelivery = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Location not supported",
        description: "Your device doesn't support location tracking.",
        variant: "destructive",
      });
      return;
    }

    setIsDeliveryStarted(true);
    const id = navigator.geolocation.watchPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setCurrentLocation(newLocation);
        
        // Update delivery location using OrderService
        OrderService.updateDeliveryLocation(task.order_id, newLocation);
      },
      (error) => {
        toast({
          title: "Location error",
          description: "Unable to get your current location.",
          variant: "destructive",
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
    setWatchId(id);
    
    // Send out for delivery notification
    const customerAddress = JSON.parse(localStorage.getItem('customerAddress') || '{}');
    const currentOrder = JSON.parse(localStorage.getItem('currentOrder') || '{}');
    if (customerAddress.phone && currentOrder.orderId === task.order_id) {
      try {
        const deliveryAgent = {
          name: 'Delivery Partner',
          phone: '+91 98765 43210'
        };
        WhatsAppService.sendOutForDeliveryNotification(customerAddress, currentOrder, deliveryAgent);
        console.log('✅ Out for delivery notification sent via WhatsApp');
        
        // Also send FREE SMS
        const otp = WhatsAppService.getStoredOTP(task.order_id);
        FreeSmsService.sendOutForDeliverySMS(customerAddress, currentOrder, deliveryAgent, otp);
        console.log('✅ Out for delivery FREE SMS sent');
      } catch (error) {
        console.error('❌ Failed to send out for delivery notification:', error);
      }
    }
    
    toast({
      title: "Delivery started!",
      description: "Real-time tracking is now active. Customer notified via WhatsApp & SMS.",
    });
  };

  const handleStopDelivery = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    setIsDeliveryStarted(false);
    setCurrentLocation(null);
    
    toast({
      title: "Delivery stopped",
      description: "Location tracking has been disabled.",
    });
  };

  const handleVerifyOTP = async () => {
    setIsVerifying(true);
    
    try {
      // Use OrderService to complete delivery
      const success = await OrderService.completeDelivery(task.order_id, otp);
      
      if (success) {
        handleStopDelivery();
        
        toast({
          title: "Delivery Completed!",
          description: "Order has been successfully delivered. Customer notified automatically.",
        });
        
        // Send delivery notification
        NotificationService.sendOrderStatusNotification(
          task.order_id, 
          'delivered', 
          'delivery'
        );
        
        setTimeout(() => {
          navigate("/delivery");
        }, 1500);
      } else {
        toast({
          title: "Invalid OTP",
          description: "Please enter the correct 6-digit OTP from the customer.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Delivery completion error:', error);
      toast({
        title: "Error",
        description: "Failed to complete delivery. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-4 md:py-8">
      <div className="max-w-4xl mx-auto space-y-4 md:space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 md:mb-6 gap-3">
          <h1 className="text-2xl md:text-3xl font-bold">Delivery Task</h1>
          <Button variant="outline" onClick={() => navigate("/delivery")} size="sm">
            Back to Tasks
          </Button>
        </div>

        <Card>
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="flex items-center text-base md:text-lg">
              <MapPin className="w-4 h-4 md:w-5 md:h-5 mr-2" />
              Order #{task.order_id}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0 space-y-3 md:space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <div>
                <h4 className="font-semibold mb-2 text-sm md:text-base">Customer Details</h4>
                <div className="space-y-1 text-xs md:text-sm">
                  <p><strong>Name:</strong> {task.customer_name}</p>
                  <p><strong>Phone:</strong> 
                    <a href={`tel:${task.customer_phone}`} className="text-blue-600 hover:underline ml-1">
                      {task.customer_phone || 'N/A'}
                    </a>
                  </p>
                  <p><strong>Address:</strong> {task.customer_address}</p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-sm md:text-base">Order Details</h4>
                <div className="space-y-1 text-xs md:text-sm">
                  <p><strong>Total:</strong> ₹{task.total_amount?.toFixed(2) || '0.00'}</p>
                  <p><strong>Items:</strong> {task.items?.length || 0} items</p>
                  <p><strong>Payment:</strong> 
                    <span className="ml-1 px-2 py-1 rounded text-xs bg-green-100 text-green-800">
                      PAID
                    </span>
                  </p>
                  <p><strong>Status:</strong> 
                    <span className={`ml-2 px-2 py-1 rounded text-xs ${
                      task.status === 'accepted' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {task.status.toUpperCase()}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Live Tracking Component */}
        <DeliveryAgentTracker orderId={task.order_id} agentId="agent_001" />

        <Card>
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="text-base md:text-lg">Delivery Verification</CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0 space-y-3 md:space-y-4">
            <div>
              <Label htmlFor="otp" className="text-sm">Enter 6-digit OTP from customer</Label>
              <Input
                id="otp"
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                className="text-center text-base md:text-lg font-mono"
              />
            </div>
            
            <Button 
              onClick={handleVerifyOTP}
              disabled={otp.length !== 6 || isVerifying}
              className="w-full bg-green-500 hover:bg-green-600 text-sm md:text-base"
              size="sm"
            >
              {isVerifying ? (
                <div className="flex items-center">
                  <div className="w-3 h-3 md:w-4 md:h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Verifying...
                </div>
              ) : (
                <>
                  <CheckCircle className="w-3 h-3 md:w-4 md:h-4 mr-2" />
                  Complete Delivery
                </>
              )}
            </Button>
            
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <p className="text-xs md:text-sm text-blue-800 text-center font-medium">
                🔐 Ask the customer for their 6-digit OTP to confirm delivery
              </p>
              <p className="text-xs text-blue-600 text-center mt-1">
                The OTP was sent to them via WhatsApp and SMS when the order was placed
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DeliveryTaskDetail;