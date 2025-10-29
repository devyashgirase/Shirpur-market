import { supabase } from './directSupabase';

export const createOrderInSupabase = async (orderData: any) => {
  console.log('🔍 Creating order with data:', orderData);
  
  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  try {
    // Ensure all required fields are present
    const cleanOrderData = {
      order_id: orderData.order_id || `ORD-${Date.now()}`,
      customer_name: orderData.customer_name || 'Unknown Customer',
      customer_phone: orderData.customer_phone || '',
      customer_address: orderData.customer_address || '',
      items: Array.isArray(orderData.items) ? orderData.items : [],
      total_amount: Number(orderData.total_amount) || 0,
      order_status: orderData.order_status || 'confirmed',
      payment_status: orderData.payment_status || 'paid',
      payment_id: orderData.payment_id || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('📦 Clean order data:', cleanOrderData);

    const { data, error } = await supabase
      .from('orders')
      .insert([cleanOrderData])
      .select()
      .single();

    if (error) {
      console.error('❌ Supabase insert error:', error);
      throw error;
    }

    console.log('✅ Order created successfully:', data);
    
    // Trigger admin dashboard update
    window.dispatchEvent(new CustomEvent('orderCreated', {
      detail: { orderId: data.order_id, order: data }
    }));

    return data;
  } catch (error) {
    console.error('❌ Order creation failed:', error);
    throw error;
  }
};