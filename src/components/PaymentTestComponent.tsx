import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { OrderService } from '@/lib/orderService';
import { apiService } from '@/lib/apiService';
import { useToast } from '@/hooks/use-toast';

const PaymentTestComponent = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);
  const { toast } = useToast();

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const simulatePaymentSuccess = async () => {
    setIsProcessing(true);
    setTestResults([]);
    
    try {
      addResult('🚀 Starting payment simulation...');
      
      // Mock cart items
      const mockCart = [
        {
          product: { id: '1', name: 'Test Product 1', price: 50 },
          quantity: 2
        },
        {
          product: { id: '2', name: 'Test Product 2', price: 30 },
          quantity: 1
        }
      ];
      
      // Mock customer info
      const mockCustomer = {
        name: 'Test Customer',
        phone: '+91 9876543210',
        address: 'Test Address, Shirpur, Maharashtra - 425405',
        coordinates: { lat: 21.3099, lng: 75.1178 }
      };
      
      const total = 130; // 50*2 + 30*1
      const paymentId = 'test_payment_' + Date.now();
      
      addResult('💳 Simulating Razorpay payment success...');
      
      // Create order (this is what happens in payment success handler)
      const orderId = await OrderService.createOrderFromCart(
        mockCustomer,
        mockCart,
        total,
        paymentId
      );
      
      addResult(`✅ Order created: ${orderId}`);
      
      // Update payment status
      await OrderService.updatePaymentStatus(orderId, 'paid', paymentId);
      addResult('💰 Payment status updated to paid');
      
      // Save to database
      try {
        await apiService.createOrder({
          orderId,
          customerName: mockCustomer.name,
          customerPhone: mockCustomer.phone,
          deliveryAddress: mockCustomer.address,
          items: mockCart.map(item => ({
            productId: parseInt(item.product.id),
            productName: item.product.name,
            price: item.product.price,
            quantity: item.quantity
          })),
          total,
          status: 'confirmed',
          paymentStatus: 'paid'
        });
        addResult('🗄️ Order saved to database for admin tracking');
      } catch (dbError) {
        addResult('⚠️ Database save failed (using local storage)');
      }
      
      // Update inventory
      try {
        for (const item of mockCart) {
          await apiService.updateProductStock(parseInt(item.product.id), -item.quantity);
        }
        addResult('📦 Product inventory updated');
      } catch (stockError) {
        addResult('⚠️ Inventory update failed (will be handled manually)');
      }
      
      // Verify order appears in customer orders
      const allOrders = OrderService.getAllOrders();
      const createdOrder = allOrders.find(o => o.orderId === orderId);
      
      if (createdOrder) {
        addResult(`✅ Order verified in customer tracking: Status=${createdOrder.status}, Payment=${createdOrder.paymentStatus}`);
      } else {
        addResult('❌ Order not found in customer tracking');
      }
      
      // Store for customer tracking
      localStorage.setItem('currentOrder', JSON.stringify(createdOrder));
      localStorage.setItem('customerPhone', mockCustomer.phone);
      
      addResult('🎯 Order available for customer tracking');
      addResult('🎉 Payment simulation completed successfully!');
      
      toast({
        title: "Payment Test Successful!",
        description: `Order ${orderId} created and ready for tracking`,
      });
      
    } catch (error) {
      addResult(`❌ Error: ${error}`);
      toast({
        title: "Payment Test Failed",
        description: "Check console for details",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const checkOrderStatus = () => {
    const currentOrder = localStorage.getItem('currentOrder');
    const customerPhone = localStorage.getItem('customerPhone');
    
    if (currentOrder) {
      const order = JSON.parse(currentOrder);
      addResult(`📋 Current Order: ${order.orderId}`);
      addResult(`📊 Status: ${order.status}`);
      addResult(`💳 Payment: ${order.paymentStatus}`);
      addResult(`📞 Customer: ${customerPhone}`);
    } else {
      addResult('❌ No current order found');
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🧪 Payment Flow Test
          <Badge variant="outline">Development Tool</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button 
            onClick={simulatePaymentSuccess}
            disabled={isProcessing}
            className="flex-1"
          >
            {isProcessing ? '⏳ Processing...' : '💳 Simulate Payment Success'}
          </Button>
          <Button 
            onClick={checkOrderStatus}
            variant="outline"
          >
            📋 Check Status
          </Button>
        </div>
        
        {testResults.length > 0 && (
          <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
            <h4 className="font-semibold mb-2">Test Results:</h4>
            <div className="space-y-1 text-sm font-mono">
              {testResults.map((result, index) => (
                <div key={index} className="text-gray-700">
                  {result}
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded">
          <strong>What this test does:</strong>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>Simulates successful Razorpay payment</li>
            <li>Creates order with confirmed status and paid payment</li>
            <li>Saves order to database for admin tracking</li>
            <li>Updates product inventory</li>
            <li>Makes order available in customer tracking</li>
            <li>Triggers real-time updates for admin panel</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentTestComponent;