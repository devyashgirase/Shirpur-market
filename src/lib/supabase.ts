// Simple Supabase implementation without SDK to avoid headers error
// FORCE CORRECT URL - Hardcoded due to Vercel env var issues
const SUPABASE_URL = 'https://ftexuxkdfahbqjddidaf.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0ZXh1eGtkZmFoYnFqZGRpZGFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4OTg0MjMsImV4cCI6MjA3NTQ3NDQyM30.j_HfG_5FLay9EymJkJAkWRx0P0yScHXPZckIQ3apbEY';

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_KEY);

// FORCE CLEAR ALL CACHE ON EVERY REQUEST
const clearAllCache = () => {
  localStorage.clear();
  sessionStorage.clear();
  if ('caches' in window) {
    caches.keys().then(names => {
      names.forEach(name => caches.delete(name));
    });
  }
};

// Direct Supabase REST API - NO CACHE
const api = {
  async request(endpoint: string, options: RequestInit = {}) {
    clearAllCache(); // Clear all cache before every request
    
    if (!SUPABASE_URL || !SUPABASE_KEY) {
      console.error('❌ Supabase not configured');
      return [];
    }

    console.log(`🔥 DIRECT Supabase request: ${endpoint}`);
    
    console.log('🔑 Using API Key:', SUPABASE_KEY.substring(0, 20) + '...');
    
    const response = await fetch(`${SUPABASE_URL}/rest/v1/${endpoint}`, {
      ...options,
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        ...options.headers
      }
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`❌ Supabase API Error: ${response.status} - ${error}`);
      return [];
    }

    const data = await response.json();
    console.log(`🔥 DIRECT Supabase response:`, data);
    return data;
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
      console.error('❌ Supabase order creation failed:', error);
      return null; // Return null instead of throwing
    }
  },

  async getOrders() {
    console.log('🔥 FORCE: Getting orders ONLY from Supabase database...');
    const orders = await api.get('orders', 'order=created_at.desc');
    console.log('🔥 DIRECT Supabase orders count:', orders.length);
    console.log('🔥 DIRECT Supabase orders data:', orders);
    return orders || [];
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
    console.log('🔥 FORCE: Getting products ONLY from Supabase database...');
    const products = await api.get('products');
    console.log('🔥 DIRECT Supabase products count:', products.length);
    console.log('🔥 DIRECT Supabase products data:', products);
    return products || [];
  },

  async createProduct(productData: any) {
    try {
      const result = await api.post('products', {
        name: productData.name,
        description: productData.description || '',
        price: Number(productData.price),
        category: productData.category,
        image_url: productData.imageUrl || productData.image_url || '/placeholder.svg',
        stock_quantity: Number(productData.stockQuantity || productData.stock_quantity || 0),
        is_available: Boolean(productData.isActive !== false)
      });
      
      console.log('✅ Product created in Supabase:', result);
      return result[0] || result;
    } catch (error) {
      console.error('❌ Supabase product creation failed:', error);
      return null;
    }
  },

  async updateProduct(id: number, updates: any) {
    try {
      const updateData: any = {};
      if (updates.name) updateData.name = updates.name;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.price !== undefined) updateData.price = Number(updates.price);
      if (updates.category) updateData.category = updates.category;
      if (updates.imageUrl || updates.image_url) updateData.image_url = updates.imageUrl || updates.image_url;
      if (updates.stockQuantity !== undefined || updates.stock_quantity !== undefined) {
        updateData.stock_quantity = Number(updates.stockQuantity || updates.stock_quantity);
      }
      if (updates.isActive !== undefined) updateData.is_available = Boolean(updates.isActive);
      
      const result = await api.patch('products', updateData, `id=eq.${id}`);
      console.log('✅ Product updated in Supabase:', result);
      return result[0] || result;
    } catch (error) {
      console.error('❌ Supabase product update failed:', error);
      return null;
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
  },

  // Delivery agents functions
  async getDeliveryAgents() {
    try {
      const agents = await api.get('delivery_agents');
      console.log('✅ Delivery agents loaded from Supabase:', agents.length);
      return agents.filter(agent => agent.is_active !== false);
    } catch (error) {
      console.error('❌ Failed to load delivery agents from Supabase:', error);
      return []; // Return empty array instead of throwing
    }
  },

  async createDeliveryAgent(agentData: any) {
    try {
      return await api.post('delivery_agents', agentData);
    } catch (error) {
      console.error('Failed to create delivery agent:', error);
      return null;
    }
  },

  async createCustomer(customerData: any) {
    try {
      return await api.post('customers', customerData);
    } catch (error) {
      console.error('Failed to create customer:', error);
      return null;
    }
  },

  async getCustomers() {
    try {
      const customers = await api.get('customers');
      console.log('✅ Customers loaded from Supabase:', customers.length);
      return customers || [];
    } catch (error) {
      console.error('❌ Failed to load customers from Supabase:', error);
      return [];
    }
  }
};

export const supabase = null; // Disable SDK completely

// Legacy compatibility
export { supabaseApi as default };