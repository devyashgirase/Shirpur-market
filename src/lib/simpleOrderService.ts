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
      console.log('📦 Creating order:', orderData);
      
      // Validate required fields
      if (!orderData.order_id || !orderData.customer_name || !orderData.customer_phone) {
        throw new Error('Missing required order fields');
      }
      
      if (!orderData.items || orderData.items.length === 0) {
        throw new Error('Order must have at least one item');
      }
      
      // Prepare order data with proper JSON formatting
      const formattedOrderData = {
        ...orderData,
        items: JSON.stringify(orderData.items) // Ensure items is JSON string
      };
      
      console.log('📋 Formatted order data:', formattedOrderData);
      
      // Get Supabase config from environment
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Supabase configuration missing');
      }
      
      // Direct Supabase insert
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
      
      if (response.ok) {
        const savedOrder = await response.json();
        console.log('✅ Order saved to Supabase:', savedOrder);
        
        // Trigger events for real-time updates
        window.dispatchEvent(new CustomEvent('orderCreated', { 
          detail: { orderId: orderData.order_id, status: orderData.status } 
        }));
        window.dispatchEvent(new CustomEvent('ordersUpdated'));
        
        return orderData.order_id;
      } else {
        const errorText = await response.text();
        console.error('❌ Supabase error response:', response.status, errorText);
        
        // Try to parse error details
        let errorDetails = errorText;
        try {
          const errorJson = JSON.parse(errorText);
          errorDetails = errorJson.message || errorJson.hint || errorText;
        } catch (e) {
          // Keep original error text
        }
        
        throw new Error(`Database error: ${errorDetails}`);
      }
    } catch (error) {
      console.error('❌ Order creation error:', error);
      
      // Show user-friendly error message
      if (error.message.includes('relation "orders" does not exist')) {
        console.error('🚨 Orders table does not exist in Supabase!');
        throw new Error('Database not properly set up. Please contact support.');
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