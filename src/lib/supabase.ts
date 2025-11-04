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
    const productData = {
      name: product.name,
      description: product.description || '',
      price: Number(product.price),
      category: product.category,
      stock_quantity: Number(product.stockQuantity || product.stock_quantity || 0),
      image_url: product.imageUrl || product.image_url || '/placeholder.svg',
      is_active: product.isActive !== undefined ? product.isActive : true,
      sku: product.sku || `SKU${Date.now()}`,
      unit: product.unit || 'kg'
    };
    
    try {
      console.log('📦 Creating product in Supabase:', productData);
      const result = await supabaseRest.post('products', productData);
      console.log('✅ Product saved to Supabase successfully:', result);
      return result[0] || result;
    } catch (error) {
      console.warn('⚠️ Supabase failed, using localStorage:', error);
      
      const productWithId = { 
        id: Date.now(), 
        ...productData,
        created_at: new Date().toISOString()
      };
      
      const existingProducts = JSON.parse(localStorage.getItem('products') || '[]');
      existingProducts.push(productWithId);
      localStorage.setItem('products', JSON.stringify(existingProducts));
      
      console.log('💾 Product saved to localStorage:', productWithId);
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
      
      // Ensure proper data parsing and mapping
      return orders.map((order: any) => {
        let parsedItems = [];
        try {
          parsedItems = typeof order.items === 'string' ? JSON.parse(order.items) : order.items || [];
        } catch (e) {
          console.warn('Failed to parse order items:', order.items);
          parsedItems = [];
        }
        
        return {
          ...order,
          items: parsedItems,
          customer_address: order.customer_address || order.delivery_address,
          delivery_address: order.delivery_address || order.customer_address
        };
      });
    } catch (error) {
      console.warn('Using mock orders:', error);
      return JSON.parse(localStorage.getItem('orders') || '[]');
    }
  },
  
  async createOrder(order: any) {
    const orderData = {
      order_id: order.order_id || `ORD${Date.now()}`,
      customer_name: order.customer_name,
      customer_phone: order.customer_phone,
      customer_address: order.customer_address,
      items: typeof order.items === 'string' ? order.items : JSON.stringify(order.items),
      total_amount: Number(order.total_amount),
      order_status: order.order_status || 'confirmed',
      payment_status: order.payment_status || 'paid'
    };
    
    try {
      console.log('📦 Creating order in Supabase:', orderData);
      const result = await supabaseRest.post('orders', orderData);
      console.log('✅ Order saved to Supabase successfully:', result);
      return result[0] || result;
    } catch (error) {
      console.warn('⚠️ Supabase failed, using localStorage:', error);
      
      // Always save to localStorage as backup
      const newOrder = { 
        id: Date.now(), 
        ...orderData,
        created_at: new Date().toISOString()
      };
      
      const orders = JSON.parse(localStorage.getItem('orders') || '[]');
      orders.push(newOrder);
      localStorage.setItem('orders', JSON.stringify(orders));
      
      console.log('💾 Order saved to localStorage:', newOrder);
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
      console.log('🔍 Fetching delivery agents from database...');
      const agents = await supabaseRest.get('delivery_agents');
      console.log('📦 Raw database response:', agents);
      console.log('📊 Total agents found:', agents.length);
      
      if (agents.length === 0) {
        console.log('⚠️ No agents found in database');
        return [];
      }
      
      // Log each raw agent
      agents.forEach((agent: any, index: number) => {
        console.log(`🔍 Raw Agent ${index + 1}:`, agent);
      });
      
      const normalizedAgents = agents.map((agent: any, index: number) => {
        console.log(`🔄 Processing agent ${index + 1}:`, agent);
        
        const normalized = {
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
          createdAt: agent.createdat || new Date().toISOString()
        };
        
        console.log(`✅ Normalized Agent ${index + 1}:`, {
          id: normalized.id,
          userId: normalized.userId,
          name: normalized.name,
          phone: normalized.phone,
          vehicleType: normalized.vehicleType
        });
        
        return normalized;
      });
      
      console.log('✅ Final normalized agents:', normalizedAgents.length);
      console.log('📋 All normalized agents:', normalizedAgents.map(a => ({ id: a.id, name: a.name, userId: a.userId })));
      
      return normalizedAgents;
      
    } catch (error) {
      console.error('❌ Database fetch failed:', error);
      console.log('📦 Using localStorage backup...');
      const backupAgents = JSON.parse(localStorage.getItem('delivery_agents_backup') || '[]');
      console.log('📦 Found', backupAgents.length, 'backup agents');
      return backupAgents;
    }
  },
  
  async createDeliveryAgent(agent: any) {
    try {
      console.log('📝 Creating delivery agent with data:', agent);
      
      const agentData = {
        userid: agent.user_id || agent.userId,
        password: agent.password,
        name: agent.name,
        phone: agent.phone,
        email: agent.email || null,
        vehicletype: agent.vehicle_type || agent.vehicleType,
        licensenumber: agent.license_number || agent.licenseNumber,
        isactive: agent.active !== undefined ? agent.active : true,
        isapproved: agent.approved !== undefined ? agent.approved : true,
        createdat: new Date().toISOString()
      };
      
      console.log('📤 Sending agent data to database:', agentData);
      
      const result = await supabaseRest.post('delivery_agents', agentData);
      console.log('✅ Agent created successfully in database:', result);
      console.log('📊 Created agent details:', result[0] || result);
      
      // Return normalized agent data
      const createdAgent = result[0] || result;
      const normalizedAgent = {
        id: createdAgent.id,
        userId: createdAgent.userid,
        user_id: createdAgent.userid,
        password: createdAgent.password,
        name: createdAgent.name,
        phone: createdAgent.phone,
        email: createdAgent.email,
        vehicleType: createdAgent.vehicletype,
        licenseNumber: createdAgent.licensenumber,
        isActive: createdAgent.isactive,
        isApproved: createdAgent.isapproved,
        createdAt: createdAgent.createdat
      };
      
      console.log('✅ Returning normalized agent:', normalizedAgent);
      return normalizedAgent;
      
    } catch (error) {
      console.error('❌ Database creation failed:', error);
      console.warn('📦 Falling back to localStorage storage');
      
      // Fallback to localStorage with proper structure
      const agentWithId = {
        id: Date.now(),
        userId: agent.user_id || agent.userId,
        user_id: agent.user_id || agent.userId,
        password: agent.password,
        name: agent.name,
        phone: agent.phone,
        email: agent.email,
        vehicleType: agent.vehicle_type || agent.vehicleType,
        licenseNumber: agent.license_number || agent.licenseNumber,
        isActive: agent.active !== undefined ? agent.active : true,
        isApproved: agent.approved !== undefined ? agent.approved : true,
        createdAt: new Date().toISOString()
      };
      
      const existingAgents = JSON.parse(localStorage.getItem('delivery_agents_backup') || '[]');
      existingAgents.push(agentWithId);
      localStorage.setItem('delivery_agents_backup', JSON.stringify(existingAgents));
      
      console.log('📦 Agent saved to localStorage:', agentWithId);
      return agentWithId;
    }
  },
  
  async getCart(userPhone: string) {
    try {
      // Try to get from user_carts table first
      try {
        const dbCart = await supabaseRest.get('user_carts', `user_phone=eq.${userPhone}`);
        if (dbCart.length > 0) {
          const cartData = JSON.parse(dbCart[0].cart_data || '[]');
          // Sync to localStorage
          localStorage.setItem(`cart_${userPhone}`, JSON.stringify(cartData));
          return cartData;
        }
      } catch (dbError) {
        console.warn('Database cart fetch failed, using localStorage:', dbError);
      }
      
      // Try customers table as fallback
      try {
        const customer = await this.getCustomerByPhone(userPhone);
        if (customer && customer.cart_data) {
          const cartData = JSON.parse(customer.cart_data || '[]');
          localStorage.setItem(`cart_${userPhone}`, JSON.stringify(cartData));
          return cartData;
        }
      } catch (customerError) {
        console.warn('Customer cart fetch failed:', customerError);
      }
      
      // Final fallback to localStorage
      return JSON.parse(localStorage.getItem(`cart_${userPhone}`) || '[]');
    } catch (error) {
      return [];
    }
  },
  
  async addToCart(userPhone: string, productId: string, quantity: number) {
    try {
      const products = await this.getProducts();
      const product = products.find((p: any) => p.id.toString() === productId.toString());
      
      if (!product) throw new Error('Product not found');
      
      // Get current cart from localStorage
      const cart = JSON.parse(localStorage.getItem(`cart_${userPhone}`) || '[]');
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
          quantity,
          added_at: new Date().toISOString()
        });
      }
      
      // Save to localStorage
      localStorage.setItem(`cart_${userPhone}`, JSON.stringify(cart));
      
      // Try to sync with Supabase user_carts table
      try {
        await this.syncCartToDatabase(userPhone, cart);
      } catch (dbError) {
        console.warn('Cart sync to database failed, using localStorage only:', dbError);
      }
      
      console.log('🛒 Cart updated for user:', userPhone, 'Items:', cart.length);
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
  },

  async saveDeliveryCompletion(completion: any) {
    try {
      return await supabaseRest.post('delivery_completions', completion);
    } catch (error) {
      console.warn('Supabase completion save failed:', error);
      return false;
    }
  },

  async getDeliveryCompletions(agentId: string) {
    try {
      return await supabaseRest.get('delivery_completions', `agent_id=eq.${agentId}&order=completed_at.desc`);
    } catch (error) {
      console.warn('Supabase completions fetch failed:', error);
      return [];
    }
  },

  async updateAgentLocation(agentId: string, lat: number, lng: number) {
    try {
      // Store location in localStorage as primary method
      const locationData = {
        agentId,
        lat,
        lng,
        timestamp: new Date().toISOString()
      };
      
      localStorage.setItem(`agent_location_${agentId}`, JSON.stringify(locationData));
      localStorage.setItem('current_agent_location', JSON.stringify(locationData));
      
      console.log('📍 Agent location stored locally:', locationData);
      return true;
    } catch (error) {
      console.warn('Agent location update failed:', error);
      return false;
    }
  },

  async syncCartToDatabase(userPhone: string, cartData: any[]) {
    try {
      const cartJson = JSON.stringify(cartData);
      
      // Check if user cart exists
      const existing = await supabaseRest.get('user_carts', `user_phone=eq.${userPhone}`);
      
      if (existing.length > 0) {
        // Update existing cart
        return await supabaseRest.patch(`user_carts?user_phone=eq.${userPhone}`, {
          cart_data: cartJson,
          updated_at: new Date().toISOString()
        });
      } else {
        // Create new cart record
        return await supabaseRest.post('user_carts', {
          user_phone: userPhone,
          cart_data: cartJson
        });
      }
    } catch (error) {
      console.error('Cart sync failed:', error);
      throw error;
    }
  },

  async getCarouselItems() {
    try {
      return await supabaseRest.get('carousel_items', 'is_active=eq.true&order=display_order.asc');
    } catch (error) {
      console.warn('Carousel fetch failed, using fallback:', error);
      return [
        { id: 1, product_id: 1, banner_image: '/placeholder.svg', is_active: true, display_order: 1 },
        { id: 2, product_id: 2, banner_image: '/placeholder.svg', is_active: true, display_order: 2 }
      ];
    }
  },

  async createCarouselItem(carouselData: any) {
    try {
      return await supabaseRest.post('carousel_items', {
        product_id: carouselData.product_id,
        banner_image: carouselData.banner_image,
        is_active: carouselData.is_active !== undefined ? carouselData.is_active : true,
        display_order: carouselData.display_order || 0
      });
    } catch (error) {
      console.error('Carousel creation failed:', error);
      throw error;
    }
  },

  async getCustomers() {
    try {
      return await supabaseRest.get('customers', 'order=created_at.desc');
    } catch (error) {
      console.warn('Customers fetch failed:', error);
      return [];
    }
  },

  async createCustomer(customerData: any) {
    try {
      return await supabaseRest.post('customers', {
        phone: customerData.phone,
        name: customerData.name,
        email: customerData.email || null,
        cart_data: customerData.cart_data || '[]'
      });
    } catch (error) {
      console.error('Customer creation failed:', error);
      throw error;
    }
  },

  async getCustomerByPhone(phone: string) {
    try {
      const customers = await supabaseRest.get('customers', `phone=eq.${phone}`);
      return customers[0] || null;
    } catch (error) {
      console.warn('Customer fetch failed:', error);
      return null;
    }
  },

  async updateCustomer(phone: string, updateData: any) {
    try {
      return await supabaseRest.patch(`customers?phone=eq.${phone}`, updateData);
    } catch (error) {
      console.error('Customer update failed:', error);
      throw error;
    }
  }
};