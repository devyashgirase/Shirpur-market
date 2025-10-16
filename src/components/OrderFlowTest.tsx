import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { orderManagementService } from '@/lib/orderManagementService';

const OrderFlowTest = () => {
  const [testing, setTesting] = useState(false);
  const { toast } = useToast();

  const testOrderFlow = async () => {
    setTesting(true);
    
    try {
      // Step 1: Create test order
      console.log('🧪 Step 1: Creating test order...');
      
      // Step 2: Mark it ready for delivery
      console.log('🧪 Step 2: Marking order ready for delivery...');
      const result = await orderManagementService.markOrderReadyForDelivery('TEST001');
      
      if (result.success) {
        toast({
          title: "Test Successful!",
          description: "Order marked ready for delivery. Check delivery agent dashboard.",
        });
        
        // Step 3: Check if delivery agents can see it
        console.log('🧪 Step 3: Checking if delivery agents can see the order...');
        const ordersResult = await orderManagementService.getOrdersReadyForDelivery();
        
        if (ordersResult.success && ordersResult.orders.length > 0) {
          console.log('✅ Delivery agents can see orders:', ordersResult.orders);
          toast({
            title: "Flow Working!",
            description: `${ordersResult.orders.length} orders visible to delivery agents`,
          });
        } else {
          console.error('❌ No orders visible to delivery agents');
          toast({
            title: "Issue Found",
            description: "Orders not visible to delivery agents",
            variant: "destructive"
          });
        }
      } else {
        toast({
          title: "Test Failed",
          description: result.error || "Failed to mark order ready",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('🧪 Test failed:', error);
      toast({
        title: "Test Error",
        description: error.message,
        variant: "destructive"
      });
    }
    
    setTesting(false);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>🧪 Order Flow Test</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-4">
          Test the complete flow from admin marking order ready to delivery agents seeing it.
        </p>
        <Button 
          onClick={testOrderFlow}
          disabled={testing}
          className="w-full"
        >
          {testing ? 'Testing...' : 'Test Order Flow'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default OrderFlowTest;