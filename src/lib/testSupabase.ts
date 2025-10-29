import { supabaseApi } from './supabase';

export const testSupabaseConnection = async () => {
  console.log('🧪 Testing Supabase connection...');
  
  try {
    // Test simple order creation
    const testOrder = {
      order_id: `TEST-${Date.now()}`,
      customer_name: 'Test Customer',
      customer_phone: '9999999999',
      customer_address: 'Test Address',
      items: [{ product_id: 1, product_name: 'Test Product', price: 100, quantity: 1 }],
      total_amount: 100,
      order_status: 'confirmed',
      payment_status: 'paid',
      payment_id: 'test_payment_123'
    };
    
    console.log('📦 Creating test order:', testOrder);
    const result = await supabaseApi.createOrder(testOrder);
    console.log('✅ Test order created:', result);
    
    return result;
  } catch (error) {
    console.error('❌ Supabase test failed:', error);
    throw error;
  }
};

// Make it available globally for testing
if (typeof window !== 'undefined') {
  (window as any).testSupabaseConnection = testSupabaseConnection;
}