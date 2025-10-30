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
      
      // Direct Supabase insert using XMLHttpRequest to avoid library conflicts
      console.log('📤 Inserting order into Supabase...');
      const response = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `${supabaseUrl}/rest/v1/orders`);
        xhr.setRequestHeader('apikey', supabaseKey);
        xhr.setRequestHeader('Authorization', `Bearer ${supabaseKey}`);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.setRequestHeader('Prefer', 'return=representation');
        
        xhr.onload = () => {
          resolve({
            ok: xhr.status >= 200 && xhr.status < 300,
            status: xhr.status,
            statusText: xhr.statusText,
            text: () => Promise.resolve(xhr.responseText),
            json: () => Promise.resolve(JSON.parse(xhr.responseText))
          });
        };
        
        xhr.onerror = () => reject(new Error('Network error'));
        xhr.send(JSON.stringify(formattedOrderData));
      });
      
      if (!response) {
        throw new Error('No response received from Supabase');
      }
      
      console.log('📥 Supabase response status:', response.status || 'unknown');
      
      if (response.ok) {
        const savedOrder = await response.json();
        console.log('✅ Order successfully saved to Supabase:', savedOrder);
        
        // Trigger events for real-time updates
        window.dispatchEvent(new CustomEvent('orderCreated', { 
          detail: { orderId: orderData.order_id, status: 'confirmed' } 
        }));
        window.dispatchEvent(new CustomEvent('ordersUpdated'));
        
        return orderData.order_id;
      } else {
        const errorText = await response.text().catch(() => 'Could not read error response');
        console.error('❌ Supabase insert failed:', {
          status: response.status || 'unknown',
          statusText: response.statusText || 'unknown',
          error: errorText
        });
        
        throw new Error(`Supabase insert failed: ${errorText}`);
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
      
      if (!supabaseUrl || !supabaseKey) {
        console.error('Supabase config missing');
        return [];
      }
      
      const response = await new Promise((resolve) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', `${supabaseUrl}/rest/v1/orders?customer_phone=eq.${customerPhone}&order=created_at.desc`);
        xhr.setRequestHeader('apikey', supabaseKey);
        xhr.setRequestHeader('Authorization', `Bearer ${supabaseKey}`);
        xhr.setRequestHeader('Content-Type', 'application/json');
        
        xhr.onload = () => {
          resolve({
            ok: xhr.status >= 200 && xhr.status < 300,
            status: xhr.status,
            json: () => Promise.resolve(JSON.parse(xhr.responseText))
          });
        };
        
        xhr.onerror = () => resolve(null);
        xhr.send();
      });
      
      if (!response) {
        return [];
      }
      
      if (response.ok) {
        const orders = await response.json().catch(() => []);
        return orders || [];
      } else {
        console.error('Failed to fetch orders:', response.status);
        return [];
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      return [];
    }
  }
}

export const simpleOrderService = new SimpleOrderService();