// Test order creation to debug customer orders issue
import { OrderService } from './orderService';
import { supabaseApi } from './supabase';

export const createTestOrder = async () => {
  try {
    console.log('🧪 Creating test order...');
    
    const testCustomerInfo = {
      name: 'Test Customer',
      phone: '9999999999',
      address: 'Test Address, Shirpur, Maharashtra',
      coordinates: { lat: 21.3099, lng: 75.1178 }
    };
    
    const testCartItems = [
      {
        product: { id: '1', name: 'Test Product', price: 100 },
        quantity: 2
      }
    ];
    
    const testTotal = 200;
    
    // Create order using OrderService
    const orderId = await OrderService.createOrderFromCart(
      testCustomerInfo,
      testCartItems,
      testTotal,
      'test_payment_123'
    );
    
    console.log('✅ Test order created:', orderId);
    
    // Also save to Supabase
    try {
      await supabaseApi.createOrder({
        order_id: orderId,
        customer_name: testCustomerInfo.name,
        customer_phone: testCustomerInfo.phone,
        customer_address: testCustomerInfo.address,
        delivery_address: testCustomerInfo.address,
        items: JSON.stringify(testCartItems.map(item => ({
          product_id: parseInt(item.product.id),
          product_name: item.product.name,
          price: item.product.price,
          quantity: item.quantity
        }))),
        total: testTotal,
        total_amount: testTotal,
        status: 'confirmed',
        payment_status: 'paid',
        created_at: new Date().toISOString()
      });
      console.log('✅ Test order also saved to Supabase');
    } catch (dbError) {
      console.warn('⚠️ Supabase save failed:', dbError);
    }
    
    // Trigger events
    window.dispatchEvent(new CustomEvent('orderCreated', { detail: { orderId } }));
    window.dispatchEvent(new CustomEvent('ordersUpdated'));
    
    return orderId;
  } catch (error) {
    console.error('❌ Test order creation failed:', error);
    throw error;
  }
};

// Make it available globally for testing
if (typeof window !== 'undefined') {
  (window as any).createTestOrder = createTestOrder;
}