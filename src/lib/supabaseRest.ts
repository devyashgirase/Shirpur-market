// Minimal Supabase REST API client without SDK
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

class SupabaseRest {
  private baseUrl: string;
  private headers: Record<string, string>;

  constructor() {
    this.baseUrl = `${SUPABASE_URL}/rest/v1`;
    this.headers = {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    };
  }

  async post(table: string, data: any) {
    const response = await fetch(`${this.baseUrl}/${table}`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`Supabase error: ${response.status}`);
    }
    
    return response.json();
  }

  async get(table: string, query = '') {
    const response = await fetch(`${this.baseUrl}/${table}${query ? '?' + query : ''}`, {
      method: 'GET',
      headers: this.headers
    });
    
    if (!response.ok) {
      throw new Error(`Supabase error: ${response.status}`);
    }
    
    return response.json();
  }
}

export const supabaseRest = new SupabaseRest();

// Order service using REST API
export const orderService = {
  async createOrder(orderData: any) {
    try {
      const result = await supabaseRest.post('orders', {
        order_id: orderData.order_id,
        customer_name: orderData.customer_name,
        customer_phone: orderData.customer_phone,
        customer_address: orderData.customer_address,
        items: orderData.items,
        total_amount: orderData.total_amount,
        status: 'confirmed',
        payment_status: 'paid'
      });
      
      console.log('✅ Order saved to Supabase:', result);
      return result[0];
    } catch (error) {
      console.error('❌ Supabase save failed:', error);
      // Fallback to localStorage
      const orders = JSON.parse(localStorage.getItem('orders') || '[]');
      const newOrder = { id: Date.now(), ...orderData };
      orders.push(newOrder);
      localStorage.setItem('orders', JSON.stringify(orders));
      return newOrder;
    }
  },

  async getOrders() {
    try {
      return await supabaseRest.get('orders', 'order=created_at.desc');
    } catch (error) {
      console.error('❌ Supabase fetch failed:', error);
      return JSON.parse(localStorage.getItem('orders') || '[]');
    }
  }
};