// Simple Supabase implementation without SDK to avoid headers error
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_KEY);

// Simple REST API wrapper
const api = {
  async request(endpoint: string, options: RequestInit = {}) {
    if (!SUPABASE_URL || !SUPABASE_KEY) {
      throw new Error('Supabase not configured');
    }

    const response = await fetch(`${SUPABASE_URL}/rest/v1/${endpoint}`, {
      ...options,
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
        ...options.headers
      }
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API Error: ${response.status} - ${error}`);
    }

    return response.json();
  },

  async post(table: string, data: any) {
    return this.request(table, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async get(table: string, query = '') {
    return this.request(`${table}${query ? '?' + query : ''}`);
  },

  async patch(table: string, data: any, filter: string) {
    return this.request(`${table}?${filter}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }
};

export const supabaseApi = {
  async createOrder(orderData: any) {
    try {
      const result = await api.post('orders', {
        order_id: `ORD-${Date.now()}`,
        customer_name: orderData.customer_name,
        customer_phone: orderData.customer_phone,
        customer_address: orderData.customer_address,
        items: JSON.stringify(orderData.items),
        total_amount: Number(orderData.total_amount),
        payment_status: orderData.payment_status || 'paid',
        order_status: 'confirmed'
      });
      
      console.log('✅ Order saved to Supabase:', result);
      return result[0] || result;
    } catch (error) {
      console.error('❌ Supabase save failed:', error);
      // Fallback to localStorage
      const orders = JSON.parse(localStorage.getItem('orders') || '[]');
      const newOrder = { 
        id: Date.now(), 
        ...orderData, 
        created_at: new Date().toISOString() 
      };
      orders.push(newOrder);
      localStorage.setItem('orders', JSON.stringify(orders));
      return newOrder;
    }
  },

  async getOrders() {
    try {
      return await api.get('orders', 'order=created_at.desc');
    } catch (error) {
      return JSON.parse(localStorage.getItem('orders') || '[]');
    }
  },

  async updateOrderStatus(orderId: string, status: string, agentId?: string) {
    try {
      const updateData: any = { order_status: status };
      if (agentId) updateData.delivery_agent_id = agentId;
      
      return await api.patch('orders', updateData, `id=eq.${orderId}`);
    } catch (error) {
      console.error('Order update failed:', error);
      return false;
    }
  },

  async getProducts() {
    try {
      return await api.get('products', 'is_active=eq.true');
    } catch (error) {
      return [
        { id: 1, name: 'Fresh Tomatoes', price: 40, category: 'Vegetables' },
        { id: 2, name: 'Basmati Rice', price: 120, category: 'Grains' }
      ];
    }
  }
};

export const supabase = null; // Disable SDK completely