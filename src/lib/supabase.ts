// Completely disable Supabase to prevent Node.js warnings and headers errors
export const supabase = null;
export const isSupabaseConfigured = false;

// Import REST client
import { supabaseRest } from './supabaseRest';

// Mock data for development
const mockData = {
  products: [
    { 
      id: 1, 
      name: 'Fresh Tomatoes', 
      price: 40, 
      category: 'Vegetables', 
      stockQuantity: 100, 
      isActive: true, 
      imageUrl: '/placeholder.svg', 
      description: 'Fresh red tomatoes',
      created_at: new Date().toISOString()
    },
    { 
      id: 2, 
      name: 'Basmati Rice', 
      price: 120, 
      category: 'Grains', 
      stockQuantity: 50, 
      isActive: true, 
      imageUrl: '/placeholder.svg', 
      description: 'Premium basmati rice',
      created_at: new Date().toISOString()
    }
  ],
  orders: [],
  categories: [
    { id: 1, name: 'Vegetables', slug: 'vegetables', isActive: true },
    { id: 2, name: 'Grains', slug: 'grains', isActive: true }
  ]
};

export const supabaseApi = {
  async getProducts() {
    try {
      return await supabaseRest.get('products');
    } catch (error) {
      console.warn('Using mock products:', error);
      return mockData.products;
    }
  },
  
  async createProduct(product: any) {
    try {
      const result = await supabaseRest.post('products', {
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        stock_quantity: product.stockQuantity || product.stock_quantity,
        image_url: product.imageUrl || product.image_url,
        is_active: product.isActive !== undefined ? product.isActive : true,
        sku: product.sku || `SKU${Date.now()}`,
        unit: product.unit || 'kg'
      });
      return result[0];
    } catch (error) {
      console.warn('Supabase failed, using localStorage:', error);
      const productWithId = { id: Date.now(), ...product, isActive: true };
      const existingProducts = JSON.parse(localStorage.getItem('products') || '[]');
      existingProducts.push(productWithId);
      localStorage.setItem('products', JSON.stringify(existingProducts));
      return productWithId;
    }
  },
  
  async updateProduct(id: number, product: any) {
    try {
      const result = await supabaseRest.patch(`products?id=eq.${id}`, {
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        stock_quantity: product.stockQuantity || product.stock_quantity,
        image_url: product.imageUrl || product.image_url,
        is_active: product.isActive,
        updated_at: new Date().toISOString()
      });
      return result[0];
    } catch (error) {
      console.warn('Supabase failed, using localStorage:', error);
      const products = JSON.parse(localStorage.getItem('products') || '[]');
      const index = products.findIndex((p: any) => p.id === id);
      if (index >= 0) {
        products[index] = { ...products[index], ...product };
        localStorage.setItem('products', JSON.stringify(products));
        return products[index];
      }
      return null;
    }
  },
  
  async getCategories() {
    try {
      return await supabaseRest.get('categories');
    } catch (error) {
      console.warn('Using mock categories:', error);
      return mockData.categories;
    }
  },
  
  async getOrders() {
    try {
      const orders = await supabaseRest.get('orders', 'order=created_at.desc');
      console.log('📦 Fetched orders from database:', orders.length, 'orders');
      console.log('📊 Order statuses:', orders.map(o => ({ id: o.id, status: o.order_status })));
      return orders;
    } catch (error) {
      console.warn('Using mock orders:', error);
      return JSON.parse(localStorage.getItem('orders') || '[]');
    }
  },
  
  async createOrder(order: any) {
    try {
      return await supabaseRest.post('orders', {
        order_id: order.order_id || `ORD${Date.now()}`,
        customer_name: order.customer_name,
        customer_phone: order.customer_phone,
        customer_address: order.customer_address,
        items: order.items,
        total_amount: order.total_amount,
        order_status: 'confirmed',
        payment_status: 'paid'
      });
    } catch (error) {
      console.warn('Supabase failed, using localStorage:', error);
      const newOrder = { id: Date.now(), order_id: `ORD${Date.now()}`, ...order };
      const orders = JSON.parse(localStorage.getItem('orders') || '[]');
      orders.push(newOrder);
      localStorage.setItem('orders', JSON.stringify(orders));
      return newOrder;
    }
  },
  
  async updateOrderStatus(orderId: string, status: string, deliveryAgentId?: string) {
    try {
      const updateData: any = {
        order_status: status,
        updated_at: new Date().toISOString()
      };
      
      if (deliveryAgentId) {
        updateData.delivery_agent_id = deliveryAgentId;
      }
      
      console.log('🔄 Updating order status in database:', { orderId, status, updateData });
      const result = await supabaseRest.patch(`orders?id=eq.${orderId}`, updateData);
      console.log('✅ Order status updated successfully:', result);
      
      // If status is out_for_delivery, send OTP to customer
      if (status === 'out_for_delivery') {
        const orders = await this.getOrders();
        const order = orders.find((o: any) => o.id === orderId);
        if (order) {
          const { OTPService } = await import('./otpService');
          await OTPService.sendDeliveryOTP(orderId, order.customer_phone, order.customer_name);
        }
      }
      
      return result;
    } catch (error) {
      console.error('❌ Supabase update failed:', error);
      return false;
    }
  },
  
  async getDeliveryAgents() {
    try {
      const agents = await supabaseRest.get('delivery_agents');
      console.log('🔍 Raw agents from database:', agents);
      console.log('🔍 Raw database agents:', agents);
      return agents.map((agent: any) => {
        console.log('🔍 Processing agent:', agent);
        return {
          id: agent.id,
          userid: agent.userid,
          user_id: agent.userid,
          userId: agent.userid,
          password: agent.password,
          name: agent.name,
          phone: agent.phone,
          email: agent.email,
          vehicletype: agent.vehicletype,
          vehicle_type: agent.vehicletype,
          vehicleType: agent.vehicletype,
          licensenumber: agent.licensenumber,
          license_number: agent.licensenumber,
          licenseNumber: agent.licensenumber,
          isactive: agent.isactive,
          active: agent.isactive,
          isActive: agent.isactive,
          isapproved: agent.isapproved,
          approved: agent.isapproved,
          isApproved: agent.isapproved,
          createdat: agent.createdat,
          created_at: agent.createdat,
          createdAt: agent.createdat
        };
      });
    } catch (error) {
      console.warn('Using localStorage agents:', error);
      return JSON.parse(localStorage.getItem('delivery_agents_backup') || '[]');
    }
  },
  
  async createDeliveryAgent(agent: any) {
    try {
      console.log('📝 Creating delivery agent with data:', agent);
      const result = await supabaseRest.post('delivery_agents', {
        userid: agent.user_id || agent.userId,
        password: agent.password,
        name: agent.name,
        phone: agent.phone,
        email: agent.email,
        vehicletype: agent.vehicle_type || agent.vehicleType,
        licensenumber: agent.license_number || agent.licenseNumber,
        isactive: agent.active !== undefined ? agent.active : true,
        isapproved: agent.approved !== undefined ? agent.approved : true
      });
      console.log('✅ Agent created successfully:', result[0]);
      return result[0];
    } catch (error) {
      console.warn('Supabase failed, using localStorage:', error);
      const agentWithId = { id: Date.now(), ...agent };
      const existingAgents = JSON.parse(localStorage.getItem('delivery_agents_backup') || '[]');
      existingAgents.push(agentWithId);
      localStorage.setItem('delivery_agents_backup', JSON.stringify(existingAgents));
      return agentWithId;
    }
  },
  
  async getCart(userPhone: string) {
    try {
      return JSON.parse(localStorage.getItem(`cart_${userPhone}`) || '[]');
    } catch (error) {
      return [];
    }
  },
  
  async addToCart(userPhone: string, productId: string, quantity: number) {
    try {
      const cart = JSON.parse(localStorage.getItem(`cart_${userPhone}`) || '[]');
      const products = await this.getProducts();
      const product = products.find((p: any) => p.id.toString() === productId.toString());
      
      if (!product) throw new Error('Product not found');
      
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
            image_url: product.imageUrl || product.image_url || '/placeholder.svg',
            stock_qty: product.stockQuantity || product.stock_quantity || 0
          },
          quantity
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
      const cart = JSON.parse(localStorage.getItem(`cart_${userPhone}`) || '[]');
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
      const cart = JSON.parse(localStorage.getItem(`cart_${userPhone}`) || '[]');
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
  
  async createDeliverySession(sessionData: any) {
    try {
      return await supabaseRest.post('delivery_sessions', sessionData);
    } catch (error) {
      console.warn('Session creation failed:', error);
      // Store in localStorage as fallback
      localStorage.setItem('delivery_session', JSON.stringify(sessionData));
      return sessionData;
    }
  },
  
  async getActiveDeliverySession() {
    try {
      const sessions = await supabaseRest.get('delivery_sessions', 'is_active=eq.true&order=login_time.desc&limit=1');
      return sessions[0] || null;
    } catch (error) {
      console.warn('Session fetch failed:', error);
      // Try localStorage fallback
      const stored = localStorage.getItem('delivery_session');
      return stored ? JSON.parse(stored) : null;
    }
  },
  
  async endDeliverySession() {
    try {
      await supabaseRest.patch('delivery_sessions?is_active=eq.true', {
        is_active: false,
        logout_time: new Date().toISOString()
      });
    } catch (error) {
      console.warn('Session end failed:', error);
    }
    // Always clear localStorage
    localStorage.removeItem('delivery_session');
  },
  
  async updateDeliveryAgent(agentId: number, updateData: any) {
    try {
      return await supabaseRest.patch(`delivery_agents?id=eq.${agentId}`, updateData);
    } catch (error) {
      console.warn('Agent update failed:', error);
      return null;
    }
  },
  
  async getOrdersByDeliveryAgent(agentId: string) {
    try {
      const orders = await this.getOrders();
      return orders.filter((order: any) => order.delivery_agent_id === agentId);
    } catch (error) {
      console.error('Error getting orders by delivery agent:', error);
      return [];
    }
  },
  
  async createDeliveryOTP(otpData: any) {
    try {
      return await supabaseRest.post('delivery_otps', otpData);
    } catch (error) {
      console.warn('Supabase OTP creation failed, using localStorage:', error);
      const otps = JSON.parse(localStorage.getItem('delivery_otps') || '[]');
      const newOTP = { id: Date.now(), ...otpData };
      otps.push(newOTP);
      localStorage.setItem('delivery_otps', JSON.stringify(otps));
      return newOTP;
    }
  },
  
  async getDeliveryOTP(orderId: string) {
    try {
      const otps = await supabaseRest.get('delivery_otps', `order_id=eq.${orderId}&order=created_at.desc&limit=1`);
      return otps[0] || null;
    } catch (error) {
      console.warn('Supabase OTP fetch failed, using localStorage:', error);
      const otps = JSON.parse(localStorage.getItem('delivery_otps') || '[]');
      return otps.find((otp: any) => otp.order_id === orderId) || null;
    }
  },
  
  async updateDeliveryOTP(orderId: string, updateData: any) {
    try {
      return await supabaseRest.patch(`delivery_otps?order_id=eq.${orderId}`, updateData);
    } catch (error) {
      console.warn('Supabase OTP update failed, using localStorage:', error);
      const otps = JSON.parse(localStorage.getItem('delivery_otps') || '[]');
      const otpIndex = otps.findIndex((otp: any) => otp.order_id === orderId);
      if (otpIndex >= 0) {
        otps[otpIndex] = { ...otps[otpIndex], ...updateData };
        localStorage.setItem('delivery_otps', JSON.stringify(otps));
        return otps[otpIndex];
      }
      return null;
    }
  }
};