// Simple order service for error-free customer flow
export interface SimpleOrder {
  id: string;
  order_id: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  items: any[];
  total_amount: number;
  status: string;
  payment_status: string;
  created_at: string;
}

class SimpleOrderService {
  async createOrder(orderData: any): Promise<string> {
    try {
      console.log('📦 Creating order with data:', orderData);
      
      // Validate required fields
      if (!orderData.order_id || !orderData.customer_name || !orderData.customer_phone) {
        const missing = [];
        if (!orderData.order_id) missing.push('order_id');
        if (!orderData.customer_name) missing.push('customer_name');
        if (!orderData.customer_phone) missing.push('customer_phone');
        throw new Error(`Missing required fields: ${missing.join(', ')}`);
      }
      
      if (!orderData.items || orderData.items.length === 0) {
        throw new Error('Order must have at least one item');
      }
      
      // Get Supabase config from environment
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      console.log('🔧 Supabase config:', { url: supabaseUrl, hasKey: !!supabaseKey });
      
      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Supabase configuration missing from environment variables');
      }
      
      // Prepare order data with proper JSON formatting
      const formattedOrderData = {
        order_id: orderData.order_id,
        customer_name: orderData.customer_name,
        customer_phone: orderData.customer_phone,
        customer_address: orderData.customer_address || '',
        items: JSON.stringify(orderData.items),
        total_amount: parseFloat(orderData.total_amount) || 0
      };
      
      console.log('📋 Sending to Supabase:', formattedOrderData);
      
      // Test connection first
      console.log('🔍 Testing Supabase connection...');
      const testResponse = await fetch(`${supabaseUrl}/rest/v1/orders?limit=1`, {
        method: 'GET',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      });
      
      if (!testResponse.ok) {
        const testError = await testResponse.text();
        console.error('❌ Supabase connection test failed:', testError);
        throw new Error(`Supabase connection failed: ${testError}`);
      }
      
      console.log('✅ Supabase connection test passed');
      
      // Direct Supabase insert
      console.log('📤 Inserting order into Supabase...');
      const response = await fetch(`${supabaseUrl}/rest/v1/orders`, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(formattedOrderData)
      });
      
      console.log('📥 Supabase response status:', response.status, response.statusText);
      
      if (response.ok) {
        const savedOrder = await response.json();
        console.log('✅ Order successfully saved to Supabase:', savedOrder);
        
        // Verify the order was actually saved
        const verifyResponse = await fetch(`${supabaseUrl}/rest/v1/orders?order_id=eq.${orderData.order_id}`, {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`
          }
        });
        
        if (verifyResponse.ok) {
          const verifyData = await verifyResponse.json();
          console.log('✅ Order verification successful:', verifyData.length, 'records found');
        }
        
        // Trigger events for real-time updates
        window.dispatchEvent(new CustomEvent('orderCreated', { 
          detail: { orderId: orderData.order_id, status: 'confirmed' } 
        }));
        window.dispatchEvent(new CustomEvent('ordersUpdated'));
        
        return orderData.order_id;
      } else {
        const errorText = await response.text();
        console.error('❌ Supabase insert failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
          headers: response.headers ? Object.fromEntries(response.headers.entries()) : 'No headers'
        });
        
        // Try to parse error details
        let errorDetails = errorText;
        try {
          const errorJson = JSON.parse(errorText);
          errorDetails = errorJson.message || errorJson.hint || errorJson.details || errorText;
          console.error('❌ Parsed error details:', errorJson);
        } catch (e) {
          console.error('❌ Could not parse error response');
        }
        
        throw new Error(`Supabase insert failed (${response.status}): ${errorDetails}`);
      }
    } catch (error) {
      console.error('❌ Order creation failed:', error);
      console.error('❌ Error stack:', error.stack);
      
      // Show user-friendly error message
      if (error.message.includes('relation "orders" does not exist')) {
        console.error('🚨 Orders table does not exist in Supabase!');
        throw new Error('Orders table not found. Please run the SQL schema first.');
      }
      
      if (error.message.includes('Failed to fetch')) {
        throw new Error('Network error: Cannot connect to Supabase. Check your internet connection.');
      }
      
      throw error;
    }
  }

  async getCustomerOrders(customerPhone: string): Promise<SimpleOrder[]> {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      const response = await fetch(`${supabaseUrl}/rest/v1/orders?customer_phone=eq.${customerPhone}&order=created_at.desc`, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const orders = await response.json();
        return orders || [];
      } else {
        console.error('Failed to fetch orders');
        return [];
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      return [];
    }
  }
}

export const simpleOrderService = new SimpleOrderService();