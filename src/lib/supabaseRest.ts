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
    console.log('🔍 Supabase POST to:', `${this.baseUrl}/${table}`);
    console.log('📤 Data being sent:', JSON.stringify(data, null, 2));
    
    const response = await fetch(`${this.baseUrl}/${table}`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Supabase error details:', errorText);
      throw new Error(`Supabase error: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json();
    console.log('✅ Supabase response:', result);
    return result;
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
    console.log('📦 Creating order with data:', orderData);
    
    if (!SUPABASE_URL || !SUPABASE_KEY) {
      console.warn('⚠️ Supabase credentials missing, using localStorage');
      const orders = JSON.parse(localStorage.getItem('orders') || '[]');
      const newOrder = { id: Date.now(), ...orderData, created_at: new Date().toISOString() };
      orders.push(newOrder);
      localStorage.setItem('orders', JSON.stringify(orders));
      return newOrder;
    }
    
    try {
      const uniqueOrderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const cleanData = {
        order_id: uniqueOrderId,
        customer_name: orderData.customer_name,
        customer_phone: orderData.customer_phone,
        customer_address: orderData.customer_address,
        items: JSON.stringify(orderData.items),
        total_amount: Number(orderData.total_amount),
        payment_status: orderData.payment_status || 'paid'
      };
      
      console.log('📦 Sending to Supabase:', cleanData);
      console.log('🌐 Supabase URL:', SUPABASE_URL);
      console.log('🔑 Using API Key:', SUPABASE_KEY ? 'Key exists' : 'No key');
      
      const result = await supabaseRest.post('orders', cleanData);
      
      console.log('✅ Order saved to Supabase:', result);
      console.log('🎯 Order ID created:', result[0]?.order_id || result?.order_id);
      return result[0] || result;
    } catch (error) {
      console.error('❌ Supabase save failed:', error);
      // Fallback to localStorage
      const orders = JSON.parse(localStorage.getItem('orders') || '[]');
      const newOrder = { id: Date.now(), ...orderData, created_at: new Date().toISOString() };
      orders.push(newOrder);
      localStorage.setItem('orders', JSON.stringify(orders));
      console.log('💾 Saved to localStorage instead');
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