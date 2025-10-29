import { createOrderInSupabase } from './orderCreationService';

export const testOrderCreation = async () => {
  console.log('🧪 Testing order creation...');
  
  const testOrder = {
    order_id: `TEST-${Date.now()}`,
    customer_name: 'Test Customer',
    customer_phone: '9876543210',
    customer_address: 'Test Address, Test City - 123456',
    items: [
      { product_id: 1, product_name: 'Test Product', price: 100, quantity: 2 }
    ],
    total_amount: 200,
    order_status: 'confirmed',
    payment_status: 'paid',
    payment_id: `pay_test_${Date.now()}`
  };

  try {
    const result = await createOrderInSupabase(testOrder);
    console.log('✅ Test order created successfully:', result);
    return { success: true, order: result };
  } catch (error) {
    console.error('❌ Test order creation failed:', error);
    return { success: false, error: error.message };
  }
};

// Make available globally for testing
if (typeof window !== 'undefined') {
  (window as any).testOrderCreation = testOrderCreation;
}