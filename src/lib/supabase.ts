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
  },

  // Cart functions
  async getCart(userPhone: string) {
    try {
      const cart = localStorage.getItem(`cart_${userPhone}`);
      const cartData = cart ? JSON.parse(cart) : [];
      
      // Ensure cart has items array structure
      if (Array.isArray(cartData)) {
        return { items: cartData };
      }
      
      return { items: cartData.items || [] };
    } catch (error) {
      return { items: [] };
    }
  },

  async addToCart(userPhone: string, productId: string, quantity: number) {
    try {
      const products = await this.getProducts();
      const product = products.find((p: any) => p.id.toString() === productId.toString());
      
      if (!product) throw new Error('Product not found');
      
      const cartData = await this.getCart(userPhone);
      const cart = cartData.items || [];
      const existingItem = cart.find((item: any) => item.product.id.toString() === productId.toString());
      
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.push({
          id: Date.now(),
          product: {
            id: product.id.toString(),
            name: product.name,
            price: product.price,
            image_url: product.image_url || '/placeholder.svg'
          },
          quantity,
          added_at: new Date().toISOString()
        });
      }
      
      localStorage.setItem(`cart_${userPhone}`, JSON.stringify(cart));
      return { items: cart };
    } catch (error) {
      throw error;
    }
  },

  async updateCartQuantity(userPhone: string, productId: string, quantity: number) {
    try {
      const cartData = await this.getCart(userPhone);
      const cart = cartData.items || [];
      const itemIndex = cart.findIndex((item: any) => item.product.id.toString() === productId.toString());
      
      if (itemIndex >= 0) {
        cart[itemIndex].quantity = quantity;
        localStorage.setItem(`cart_${userPhone}`, JSON.stringify(cart));
      }
      
      return { items: cart };
    } catch (error) {
      throw error;
    }
  },

  async removeFromCart(userPhone: string, productId: string) {
    try {
      const cartData = await this.getCart(userPhone);
      const cart = cartData.items || [];
      const filteredCart = cart.filter((item: any) => item.product.id.toString() !== productId.toString());
      localStorage.setItem(`cart_${userPhone}`, JSON.stringify(filteredCart));
      return { items: filteredCart };
    } catch (error) {
      throw error;
    }
  },

  async clearCart(userPhone: string) {
    try {
      localStorage.removeItem(`cart_${userPhone}`);
      return { items: [] };
    } catch (error) {
      throw error;
    }
  }
};

export const supabase = null; // Disable SDK completely

// Legacy compatibility
export { supabaseApi as default };