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
      return agents.map((agent: any) => ({
        id: agent.id,
        userId: agent.userid,
        name: agent.name,
        phone: agent.phone,
        email: agent.email,
        vehicleType: agent.vehicletype,
        licenseNumber: agent.licensenumber,
        isActive: agent.isactive
      }));
    } catch (error) {
      console.warn('Using localStorage agents:', error);
      return JSON.parse(localStorage.getItem('delivery_agents_backup') || '[]');
    }
  },
  
  async createDeliveryAgent(agent: any) {
    try {
      const result = await supabaseRest.post('delivery_agents', {
        userid: agent.userId,
        password: agent.password,
        name: agent.name,
        phone: agent.phone,
        email: agent.email,
        vehicletype: agent.vehicleType,
        licensenumber: agent.licenseNumber,
        isactive: true,
        isapproved: true
      });
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