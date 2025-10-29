import { createOrderDirect } from './directSupabase';
import { AdminOrderService } from './adminOrderService';

export const testCompleteOrderFlow = async () => {
  console.log('🧪 Testing complete order flow...');
  
  try {
    // Step 1: Create test order
    const testOrder = {
      order_id: `TEST-${Date.now()}`,
      customer_name: 'Test Customer',
      customer_phone: '9999999999',
      customer_address: 'Test Address, Test City',
      items: [
        { product_id: 1, product_name: 'Test Product', price: 100, quantity: 2 }
      ],
      total_amount: 200,
      order_status: 'confirmed',
      payment_status: 'paid',
      payment_id: `pay_test_${Date.now()}`
    };
    
    console.log('📦 Creating test order:', testOrder);
    const createdOrder = await createOrderDirect(testOrder);
    console.log('✅ Order created:', createdOrder);
    
    // Step 2: Verify admin can see it
    console.log('🔍 Fetching all orders for admin...');
    const allOrders = await AdminOrderService.getAllOrders();
    console.log('📊 All orders in admin:', allOrders.length);
    
    const testOrderFound = allOrders.find(o => o.order_id === testOrder.order_id);
    if (testOrderFound) {
      console.log('✅ Test order found in admin panel:', testOrderFound);
    } else {
      console.log('❌ Test order NOT found in admin panel');
    }
    
    return {
      success: true,
      createdOrder,
      totalOrders: allOrders.length,
      testOrderFound: !!testOrderFound
    };
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Make it available globally
if (typeof window !== 'undefined') {
  (window as any).testCompleteOrderFlow = testCompleteOrderFlow;
}