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
      const orderPayload = {
        customer_name: orderData.customer_name,
        customer_phone: orderData.customer_phone,
        total_amount: Number(orderData.total_amount),
        delivery_address: orderData.customer_address || orderData.delivery_address || 'Address not provided',
        items: orderData.items || [],
        status: 'confirmed',
        order_status: 'confirmed',
        payment_status: 'completed',
        razorpay_payment_id: orderData.payment_id,
        delivery_fee: 4.99
      };
      
      console.log('📦 Creating order with payload:', orderPayload);
      const result = await api.post('orders', orderPayload);
      
      console.log('✅ Order saved to Supabase:', result);
      return result[0] || result;
    } catch (error) {
      console.error('❌ Supabase order creation failed:', error);
      console.error('Error details:', error);
      
      // Fallback: save to localStorage if Supabase fails
      const fallbackOrders = JSON.parse(localStorage.getItem('fallbackOrders') || '[]');
      fallbackOrders.push(orderData);
      localStorage.setItem('fallbackOrders', JSON.stringify(fallbackOrders));
      console.log('💾 Order saved to localStorage fallback');
      
      return orderData; // Return the order data even if Supabase fails
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
      console.log('📝 Updating order status:', { orderId, status, agentId });
      const updateData: any = { order_status: status };
      if (agentId) updateData.delivery_agent_id = parseInt(agentId);
      
      const result = await api.patch('orders', updateData, `id=eq.${orderId}`);
      console.log('✅ Order status updated:', result);
      return result;
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

  // Cart functions - localStorage with proper structure
  async getCart(userPhone: string) {
    try {
      const cart = localStorage.getItem(`cart_${userPhone}`);
      const cartData = cart ? JSON.parse(cart) : [];
      
      // Ensure proper cart item structure
      return Array.isArray(cartData) ? cartData.filter(item => 
        item && item.product && item.product.id && item.product.name && item.quantity
      ) : [];
    } catch (error) {
      console.error('Cart parsing error:', error);
      return [];
    }
  },

  async addToCart(userPhone: string, productId: string, quantity: number) {
    try {
      const products = await this.getProducts();
      const product = products.find((p: any) => p.id.toString() === productId.toString());
      
      if (!product) throw new Error('Product not found');
      
      // Get or create customer
      let customers = await api.get('customers', `phone=eq.${userPhone}`);
      let customerId = customers[0]?.id;
      
      if (!customerId) {
        const newCustomer = await api.post('customers', {
          phone: userPhone,
          name: 'Customer'
        });
        customerId = newCustomer[0]?.id;
      }
      
      // Create or update cart entry in user_carts
      if (customerId) {
        const existingCart = await api.get('user_carts', `customer_id=eq.${customerId}`);
        if (existingCart.length === 0) {
          await api.post('user_carts', {
            customer_id: customerId
          });
        }
      }
      
      // Maintain localStorage cart
      const cart = await this.getCart(userPhone);
      const existingItem = cart.find((item: any) => item.product?.id?.toString() === productId.toString());
      
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.push({
          id: Date.now(),
          product: {
            id: product.id.toString(),
            name: product.name,
            price: Number(product.price),
            image_url: product.image_url || '/placeholder.svg',
            imageUrl: product.image_url || '/placeholder.svg'
          },
          quantity: Number(quantity)
        });
      }
      
      localStorage.setItem(`cart_${userPhone}`, JSON.stringify(cart));
      return cart;
    } catch (error) {
      throw error;
    }
  },

  async updateCartQuantity(userPhone: string, productId: string, quantity: number) {
    try {
      const cart = await this.getCart(userPhone);
      const itemIndex = cart.findIndex((item: any) => item.product.id.toString() === productId.toString());
      
      if (itemIndex >= 0) {
        cart[itemIndex].quantity = quantity;
        localStorage.setItem(`cart_${userPhone}`, JSON.stringify(cart));
      }
      
      return cart;
    } catch (error) {
      throw error;
    }
  },

  async removeFromCart(userPhone: string, productId: string) {
    try {
      const cart = await this.getCart(userPhone);
      const filteredCart = cart.filter((item: any) => item.product.id.toString() !== productId.toString());
      localStorage.setItem(`cart_${userPhone}`, JSON.stringify(filteredCart));
      return filteredCart;
    } catch (error) {
      throw error;
    }
  },

  async clearCart(userPhone: string) {
    try {
      localStorage.removeItem(`cart_${userPhone}`);
      return [];
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
  },

  async saveCustomerAddress(customerPhone: string, addressData: any) {
    try {
      const result = await api.post('customer_addresses', {
        customer_phone: customerPhone,
        name: addressData.name,
        phone: addressData.phone || customerPhone,
        address: addressData.address,
        landmark: addressData.landmark,
        city: addressData.city,
        state: addressData.state,
        pincode: addressData.pincode,
        coordinates: addressData.coordinates ? JSON.stringify(addressData.coordinates) : null,
        address_type: addressData.type || 'other',
        is_default: addressData.isDefault || false
      });
      console.log('✅ Customer address saved:', result);
      return result;
    } catch (error) {
      console.error('❌ Failed to save customer address:', error);
      return null;
    }
  },

  async getCustomerAddresses(customerPhone: string) {
    try {
      const addresses = await api.get('customer_addresses', `customer_phone=eq.${customerPhone}&order=is_default.desc,created_at.desc`);
      return addresses?.map((addr: any) => ({
        id: addr.id,
        name: addr.name,
        phone: addr.phone,
        address: addr.address,
        landmark: addr.landmark,
        city: addr.city,
        state: addr.state,
        pincode: addr.pincode,
        coordinates: addr.coordinates ? JSON.parse(addr.coordinates) : null,
        type: addr.address_type,
        isDefault: addr.is_default
      })) || [];
    } catch (error) {
      console.error('❌ Failed to get customer addresses:', error);
      return [];
    }
  },

  async getOrdersByDeliveryAgent(agentId: string) {
    try {
      const orders = await api.get('orders', `delivery_agent_id=eq.${agentId}&order=created_at.desc`);
      return orders || [];
    } catch (error) {
      console.error('❌ Failed to get delivery agent orders:', error);
      return [];
    }
  },

  async createDeliverySession(sessionData: any) {
    try {
      return await api.post('delivery_sessions', sessionData);
    } catch (error) {
      console.error('Failed to create delivery session:', error);
      return null;
    }
  },

  async getActiveDeliverySession() {
    try {
      const sessions = await api.get('delivery_sessions', 'is_active=eq.true&order=login_time.desc&limit=1');
      return sessions?.[0] || null;
    } catch (error) {
      console.error('Failed to get active delivery session:', error);
      return null;
    }
  },

  async endDeliverySession() {
    try {
      return await api.patch('delivery_sessions', { is_active: false }, 'is_active=eq.true');
    } catch (error) {
      console.error('Failed to end delivery session:', error);
      return null;
    }
  },

  async updateDeliveryAgent(agentId: number, updates: any) {
    try {
      return await api.patch('delivery_agents', updates, `id=eq.${agentId}`);
    } catch (error) {
      console.error('Failed to update delivery agent:', error);
      return null;
    }
  },

  async updateAgentLocation(agentId: string, lat: number, lng: number, orderId?: string) {
    try {
      console.log('📍 Updating agent location in database:', { agentId, lat, lng, orderId });
      
      const updateData: any = {
        current_lat: lat,
        current_lng: lng,
        last_location_update: new Date().toISOString(),
        is_active: true
      };
      
      if (orderId) {
        updateData.current_order_id = orderId;
      }
      
      // Try updating by user_id first (for delivery agents logged in)
      let result = await api.patch('delivery_agents', updateData, `user_id=eq.${agentId}`);
      
      // If no rows updated, try by id
      if (!result || result.length === 0) {
        result = await api.patch('delivery_agents', updateData, `id=eq.${agentId}`);
      }
      
      // If still no agent found, create a new one
      if (!result || result.length === 0) {
        console.log('📍 Creating new delivery agent entry for:', agentId);
        const newAgent = {
          user_id: agentId,
          name: 'Delivery Agent',
          phone: '+91 98765 43210',
          current_lat: lat,
          current_lng: lng,
          last_location_update: new Date().toISOString(),
          is_active: true,
          current_order_id: orderId || null
        };
        
        result = await api.post('delivery_agents', newAgent);
      }
      
      console.log('✅ Agent location updated successfully:', result);
      return result;
    } catch (error) {
      console.error('❌ Failed to update agent location:', error);
      return null;
    }
  },

  // Carousel banner functions
  async getCarouselBanners() {
    try {
      const banners = await api.get('carousel_banners', 'is_active=eq.true&order=display_order.asc');
      return banners || [];
    } catch (error) {
      console.error('Failed to get carousel banners:', error);
      return [];
    }
  },

  async createCarouselBanner(bannerData: any) {
    try {
      const result = await api.post('carousel_banners', {
        title: bannerData.title,
        description: bannerData.description || null,
        image_url: bannerData.imageUrl || bannerData.image_url,
        link_url: bannerData.linkUrl || bannerData.link_url || null,
        is_active: bannerData.isActive !== false,
        display_order: Number(bannerData.displayOrder || bannerData.display_order || 0)
      });
      console.log('✅ Carousel banner created:', result);
      return result[0] || result;
    } catch (error) {
      console.error('❌ Failed to create carousel banner:', error);
      return null;
    }
  },

  async updateCarouselBanner(id: number, updates: any) {
    try {
      const updateData: any = {};
      if (updates.title) updateData.title = updates.title;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.imageUrl || updates.image_url) updateData.image_url = updates.imageUrl || updates.image_url;
      if (updates.linkUrl || updates.link_url) updateData.link_url = updates.linkUrl || updates.link_url;
      if (updates.isActive !== undefined) updateData.is_active = Boolean(updates.isActive);
      if (updates.displayOrder !== undefined || updates.display_order !== undefined) {
        updateData.display_order = Number(updates.displayOrder || updates.display_order);
      }
      
      const result = await api.patch('carousel_banners', updateData, `id=eq.${id}`);
      console.log('✅ Carousel banner updated:', result);
      return result[0] || result;
    } catch (error) {
      console.error('❌ Failed to update carousel banner:', error);
      return null;
    }
  },

  async deleteCarouselBanner(id: number) {
    try {
      const result = await api.patch('carousel_banners', { is_active: false }, `id=eq.${id}`);
      console.log('✅ Carousel banner deactivated:', result);
      return result;
    } catch (error) {
      console.error('❌ Failed to delete carousel banner:', error);
      return null;
    }
  },

  async deleteProduct(id: number) {
    try {
      const result = await api.request(`products?id=eq.${id}`, { method: 'DELETE' });
      console.log('✅ Product deleted from database:', result);
      return result;
    } catch (error) {
      console.error('❌ Failed to delete product:', error);
      return null;
    }
  }
};

export const supabase = null; // Disable SDK completely

// Legacy compatibility
export { supabaseApi as default };