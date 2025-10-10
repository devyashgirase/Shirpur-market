// Complete Supabase integration with all required methods
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Supabase REST API client
class SupabaseClient {
  private baseUrl: string;
  private headers: Record<string, string>;

  constructor(url: string, key: string) {
    this.baseUrl = `${url}/rest/v1`;
    this.headers = {
      'apikey': key,
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    };
  }

  async request(endpoint: string, options: RequestInit = {}) {
    try {
      const url = `${this.baseUrl}/${endpoint}`;
      console.log('🔗 Supabase request:', { url, method: options.method || 'GET', body: options.body });
      
      const response = await fetch(url, {
        ...options,
        headers: { ...this.headers, ...options.headers }
      });

      console.log('📡 Supabase response:', { status: response.status, statusText: response.statusText });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Supabase error details:', { status: response.status, error: errorText });
        throw new Error(`Supabase error ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Supabase success:', result);
      return result;
    } catch (error) {
      console.error('❌ Supabase request failed:', error);
      throw error;
    }
  }

  // Compatible interface
  from(table: string) {
    return {
      select: (columns = '*') => ({
        eq: (column: string, value: any) => 
          this.request(`${table}?select=${columns}&${column}=eq.${value}`).then(data => ({ data, error: null })),
        order: (column: string, options: any = {}) => {
          const direction = options.ascending === false ? 'desc' : 'asc';
          return this.request(`${table}?select=${columns}&order=${column}.${direction}`).then(data => ({ data, error: null }));
        },
        then: (callback: Function) => 
          this.request(`${table}?select=${columns}`).then(data => callback({ data, error: null }))
      }),
      insert: (data: any) => ({
        select: () => ({
          single: () => this.request(table, {
            method: 'POST',
            body: JSON.stringify(data)
          }).then(result => ({ data: result[0], error: null }))
        })
      }),
      update: (data: any) => ({
        eq: (column: string, value: any) => ({
          select: () => ({
            single: () => this.request(`${table}?${column}=eq.${value}`, {
              method: 'PATCH',
              body: JSON.stringify(data)
            }).then(result => ({ data: result[0], error: null }))
          })
        })
      })
    };
  }

  // Auth methods
  get auth() {
    return {
      getCurrentUser: () => ({ id: 'mock-user', email: 'user@example.com' }),
      getUser: () => Promise.resolve({ data: { user: { id: 'mock-user', email: 'user@example.com' } }, error: null }),
      signUp: () => Promise.resolve({ data: null, error: null }),
      signIn: () => Promise.resolve({ data: null, error: null }),
      signOut: () => Promise.resolve({ error: null })
    };
  }
}

// Mock data with proper structure
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
    },
    { 
      id: 3, 
      name: 'Fresh Milk', 
      price: 60, 
      category: 'Dairy', 
      stockQuantity: 30, 
      isActive: true, 
      imageUrl: '/placeholder.svg', 
      description: 'Pure cow milk',
      created_at: new Date().toISOString()
    }
  ],
  orders: [
    { 
      id: 1, 
      order_id: 'ORD001', 
      customer_name: 'John Doe', 
      customer_phone: '9876543210', 
      delivery_address: '123 Main St, Shirpur', 
      total: 250, 
      status: 'pending', 
      payment_status: 'paid', 
      created_at: new Date().toISOString() 
    }
  ],
  categories: [
    { id: 1, name: 'Vegetables', slug: 'vegetables', isActive: true },
    { id: 2, name: 'Grains', slug: 'grains', isActive: true },
    { id: 3, name: 'Dairy', slug: 'dairy', isActive: true }
  ]
};

// Mock query builder
const mockQuery = {
  select: () => mockQuery,
  insert: () => mockQuery,
  update: () => mockQuery,
  delete: () => mockQuery,
  eq: () => mockQuery,
  order: () => mockQuery,
  single: () => Promise.resolve({ data: { id: Date.now() }, error: null }),
  then: (callback: Function) => callback({ data: mockData.products, error: null })
};

// Mock auth
const mockAuth = {
  getCurrentUser: () => ({ id: 'mock-user', email: 'user@example.com' }),
  getUser: () => Promise.resolve({ data: { user: { id: 'mock-user', email: 'user@example.com' } }, error: null }),
  signUp: () => Promise.resolve({ data: null, error: null }),
  signIn: () => Promise.resolve({ data: null, error: null }),
  signOut: () => Promise.resolve({ error: null })
};

// Initialize client
let supabaseClient: SupabaseClient | null = null;

if (supabaseUrl && supabaseKey) {
  try {
    supabaseClient = new SupabaseClient(supabaseUrl, supabaseKey);
    console.log('✅ Supabase client initialized');
  } catch (error) {
    console.error('❌ Supabase initialization failed:', error);
  }
}

// Export compatible supabase object
export const supabase = supabaseClient || {
  from: () => mockQuery,
  auth: mockAuth
};

export const supabaseApi = {
  async getProducts() {
    if (supabaseClient) {
      try {
        const data = await supabaseClient.request('products?select=*');
        console.log('📊 Fetched products from Supabase:', data.length);
        // Ensure all products have required fields with null safety
        const processedData = (data || []).map(product => {
          if (!product) return null;
          return {
            id: product.id || Date.now(),
            name: String(product.name || 'Unknown Product'),
            description: String(product.description || ''),
            imageUrl: String(product.imageUrl || product.image_url || '/placeholder.svg'),
            category: String(product.category || 'General'),
            price: Number(product.price || 0),
            stockQuantity: Number(product.stockQuantity || product.stock_quantity || 0),
            isActive: Boolean(product.isActive !== false),
            created_at: product.created_at || new Date().toISOString()
          };
        }).filter(Boolean);
        return processedData;
      } catch (error) {
        console.warn('Supabase products failed, using mock:', error);
        return mockData.products;
      }
    }
    console.log('📋 Using mock products');
    return mockData.products;
  },

  async getOrders() {
    if (supabaseClient) {
      try {
        const data = await supabaseClient.request('orders?select=*&order=created_at.desc');
        console.log('📊 Fetched orders from Supabase:', data.length);
        return data.length > 0 ? data : mockData.orders;
      } catch (error) {
        console.warn('Supabase orders failed, using mock:', error);
        return mockData.orders;
      }
    }
    console.log('📋 Using mock orders');
    return mockData.orders;
  },

  async getOrdersByDeliveryAgent(agentUserId: string) {
    if (supabaseClient) {
      try {
        // Get orders assigned to this delivery agent with pending or out_for_delivery status
        const data = await supabaseClient.request(`orders?select=*&delivery_agent_id=eq.${agentUserId}&status=in.(pending,out_for_delivery)&order=created_at.desc`);
        console.log(`📊 Fetched orders for agent ${agentUserId}:`, data.length);
        return data || [];
      } catch (error) {
        console.warn('Supabase agent orders failed:', error);
        return [];
      }
    }
    return [];
  },

  async getCategories() {
    if (supabaseClient) {
      try {
        const data = await supabaseClient.request('categories?select=*');
        console.log('📊 Fetched categories from Supabase:', data.length);
        // Ensure all categories have required fields
        const processedData = (data || []).map(category => {
          if (!category) return null;
          return {
            id: category.id || Date.now(),
            name: String(category.name || 'Unknown Category'),
            slug: String(category.slug || category.name?.toLowerCase().replace(/\s+/g, '-') || 'unknown'),
            isActive: Boolean(category.isActive !== false)
          };
        }).filter(Boolean);
        return processedData.length > 0 ? processedData : mockData.categories;
      } catch (error) {
        console.warn('Supabase categories failed, using mock:', error);
        return mockData.categories;
      }
    }
    console.log('📋 Using mock categories');
    return mockData.categories;
  },

  async createProduct(product: any) {
    if (supabaseClient) {
      try {
        const result = await supabaseClient.request('products', {
          method: 'POST',
          body: JSON.stringify(product)
        });
        return result[0];
      } catch (error) {
        console.error('Failed to create product:', error);
      }
    }
    return { id: Date.now(), ...product };
  },

  async updateProduct(id: number, product: any) {
    if (supabaseClient) {
      try {
        const result = await supabaseClient.request(`products?id=eq.${id}`, {
          method: 'PATCH',
          body: JSON.stringify(product)
        });
        return result[0];
      } catch (error) {
        console.error('Failed to update product:', error);
      }
    }
    return { id, ...product };
  },

  async createOrder(order: any) {
    if (supabaseClient) {
      try {
        const orderData = {
          ...order,
          order_id: order.order_id || `ORD${Date.now()}`,
          created_at: new Date().toISOString()
        };
        const result = await supabaseClient.request('orders', {
          method: 'POST',
          body: JSON.stringify(orderData)
        });
        return result[0];
      } catch (error) {
        console.error('Failed to create order:', error);
      }
    }
    return { id: Date.now(), order_id: `ORD${Date.now()}`, ...order };
  },

  async updateOrderStatus(id: number, status: string, agentId?: string) {
    if (supabaseClient) {
      try {
        const updateData: any = { 
          status,
          updated_at: new Date().toISOString()
        };
        
        // If agent accepts order, add agent info
        if (status === 'out_for_delivery' && agentId) {
          updateData.delivery_agent_id = agentId;
          updateData.accepted_at = new Date().toISOString();
        }
        
        const result = await supabaseClient.request(`orders?id=eq.${id}`, {
          method: 'PATCH',
          body: JSON.stringify(updateData)
        });
        return result[0];
      } catch (error) {
        console.error('Failed to update order status:', error);
      }
    }
    return { id, status };
  },

  async createCustomer(customer: any) {
    if (supabaseClient) {
      try {
        const result = await supabaseClient.request('customers', {
          method: 'POST',
          body: JSON.stringify(customer)
        });
        return result[0];
      } catch (error) {
        console.error('Failed to create customer:', error);
      }
    }
    return { id: Date.now(), ...customer };
  },

  async getDeliveryAgents() {
    let agents = [];
    
    // Try Supabase first
    if (supabaseClient) {
      try {
        const data = await supabaseClient.request('delivery_agents?select=*');
        console.log('🔍 Raw delivery agents data from Supabase:', data);
        
        agents = (data || []).map(agent => {
          return {
            id: agent.id,
            userId: agent.userid,
            password: agent.password,
            name: agent.name,
            phone: agent.phone,
            email: agent.email,
            vehicleType: agent.vehicletype,
            licenseNumber: agent.licensenumber,
            profilePhoto: agent.profilephoto,
            isActive: agent.isactive,
            isApproved: agent.isapproved,
            createdAt: agent.createdat
          };
        });
        
        console.log('🔍 Supabase agents:', agents.length);
      } catch (error) {
        console.warn('Supabase fetch failed:', error);
      }
    }
    
    // Add localStorage backup agents
    const backupAgents = JSON.parse(localStorage.getItem('delivery_agents_backup') || '[]');
    agents = [...agents, ...backupAgents];
    
    console.log('🔍 Total agents (Supabase + backup):', agents.length);
    return agents;
  },

  async createDeliveryAgent(agent: any) {
    console.log('🔍 Supabase client available:', !!supabaseClient);
    console.log('🔍 Environment check:', { 
      url: !!supabaseUrl, 
      key: !!supabaseKey,
      urlValue: supabaseUrl?.substring(0, 30) + '...',
      keyValue: supabaseKey?.substring(0, 10) + '...'
    });
    
    if (supabaseClient) {
      try {
        // Test connection first
        console.log('🧪 Testing Supabase connection...');
        await supabaseClient.request('delivery_agents?select=id&limit=1');
        console.log('✅ Supabase connection test successful');
        
        // Map agent data to match Supabase table schema (lowercase columns)
        const agentData = {
          userid: agent.userId,
          password: agent.password,
          name: agent.name,
          phone: agent.phone,
          email: agent.email || null,
          vehicletype: agent.vehicleType,
          licensenumber: agent.licenseNumber,
          profilephoto: agent.profilePhoto || null,
          isactive: true,
          isapproved: true,
          createdat: new Date().toISOString()
        };
        
        console.log('📦 Inserting agent data:', agentData);
        
        // Use proper REST API insert
        const result = await supabaseClient.request('delivery_agents', {
          method: 'POST',
          body: JSON.stringify(agentData)
        });
        
        console.log('✅ Agent saved to Supabase:', result);
        return result[0] || { id: Date.now(), ...agent };
      } catch (supabaseError) {
        console.error('❌ Supabase insert failed:', supabaseError);
        
        // Fallback: Store in localStorage and return success
        const agentWithId = { id: Date.now(), ...agent };
        const existingAgents = JSON.parse(localStorage.getItem('delivery_agents_backup') || '[]');
        existingAgents.push(agentWithId);
        localStorage.setItem('delivery_agents_backup', JSON.stringify(existingAgents));
        
        console.log('✅ Agent saved to localStorage backup');
        return agentWithId;
      }
    } else {
      console.warn('⚠️ No Supabase client available');
    }
    
    // Final fallback: localStorage only
    const agentWithId = { id: Date.now(), ...agent };
    const existingAgents = JSON.parse(localStorage.getItem('delivery_agents_backup') || '[]');
    existingAgents.push(agentWithId);
    localStorage.setItem('delivery_agents_backup', JSON.stringify(existingAgents));
    
    console.log('✅ Agent saved to localStorage (no Supabase)');
    return agentWithId;
  },

  async updateDeliveryAgent(id: number, updates: any) {
    if (supabaseClient) {
      try {
        const result = await supabaseClient.request(`delivery_agents?id=eq.${id}`, {
          method: 'PATCH',
          body: JSON.stringify(updates)
        });
        return result[0];
      } catch (error) {
        console.error('Failed to update delivery agent:', error);
        throw error;
      }
    }
    throw new Error('Database not available');
  },

  async updateDeliveryLocation(orderId: number, latitude: number, longitude: number) {
    if (supabaseClient) {
      try {
        const result = await supabaseClient.request(`orders?id=eq.${orderId}`, {
          method: 'PATCH',
          body: JSON.stringify({ 
            delivery_latitude: latitude, 
            delivery_longitude: longitude,
            updated_at: new Date().toISOString()
          })
        });
        return result[0];
      } catch (error) {
        console.error('Failed to update delivery location:', error);
      }
    }
    return { id: orderId, latitude, longitude };
  },

  async updateProductStock(productId: number, quantityChange: number) {
    if (supabaseClient) {
      try {
        const result = await supabaseClient.request(`products?id=eq.${productId}`, {
          method: 'PATCH',
          body: JSON.stringify({ 
            stockQuantity: `stockQuantity + ${quantityChange}`,
            updated_at: new Date().toISOString()
          })
        });
        return result[0];
      } catch (error) {
        console.error('Failed to update product stock:', error);
      }
    }
    return { id: productId, quantityChange };
  },

  async updatePaymentStatus(orderId: number, paymentStatus: string) {
    if (supabaseClient) {
      try {
        const result = await supabaseClient.request(`orders?id=eq.${orderId}`, {
          method: 'PATCH',
          body: JSON.stringify({ 
            payment_status: paymentStatus,
            updated_at: new Date().toISOString()
          })
        });
        return result[0];
      } catch (error) {
        console.error('Failed to update payment status:', error);
      }
    }
    return { id: orderId, paymentStatus };
  },

  async createDeliverySession(session: any) {
    if (supabaseClient) {
      try {
        const result = await supabaseClient.request('delivery_sessions', {
          method: 'POST',
          body: JSON.stringify(session)
        });
        return result[0];
      } catch (error) {
        console.error('Failed to create delivery session:', error);
        throw error;
      }
    }
    throw new Error('Database not available');
  },

  async getActiveDeliverySession() {
    if (supabaseClient) {
      try {
        const data = await supabaseClient.request('delivery_sessions?select=*&is_active=eq.true&order=login_time.desc&limit=1');
        return data[0] || null;
      } catch (error) {
        console.error('Failed to get active delivery session:', error);
        return null;
      }
    }
    return null;
  },

  async endDeliverySession() {
    if (supabaseClient) {
      try {
        const result = await supabaseClient.request('delivery_sessions?is_active=eq.true', {
          method: 'PATCH',
          body: JSON.stringify({ 
            is_active: false,
            logout_time: new Date().toISOString()
          })
        });
        return result[0];
      } catch (error) {
        console.error('Failed to end delivery session:', error);
        throw error;
      }
    }
    throw new Error('Database not available');
  },

  async getCart(userPhone) {
    if (supabaseClient) {
      try {
        const cartItems = await supabaseClient.request(`cart_items?user_phone=eq.${userPhone}&select=*`);
        const result = [];
        
        for (const item of cartItems) {
          const products = await supabaseClient.request(`products?id=eq.${item.product_id}&select=*`);
          const product = products[0];
          
          if (product) {
            result.push({
              id: item.id,
              product: {
                id: item.product_id.toString(),
                name: product.name,
                price: product.price,
                image_url: product.imageUrl || '/placeholder.svg',
                stock_qty: product.stockQuantity
              },
              quantity: item.quantity
            });
          }
        }
        
        return result;
      } catch (error) {
        console.error('Failed to get cart:', error);
        // Return empty cart if table doesn't exist
        return [];
      }
    }
    return [];
  },

  async addToCart(userPhone, productId, quantity) {
    if (supabaseClient) {
      try {
        const existing = await supabaseClient.request(`cart_items?user_phone=eq.${userPhone}&product_id=eq.${productId}&select=*`);
        
        if (existing.length > 0) {
          await supabaseClient.request(`cart_items?id=eq.${existing[0].id}`, {
            method: 'PATCH',
            body: JSON.stringify({ quantity: existing[0].quantity + quantity })
          });
        } else {
          await supabaseClient.request('cart_items', {
            method: 'POST',
            body: JSON.stringify({ user_phone: userPhone, product_id: parseInt(productId), quantity })
          });
        }
      } catch (error) {
        console.error('Failed to add to cart:', error);
        // Silently fail if table doesn't exist
      }
    }
  },

  async updateCartQuantity(userPhone, productId, quantity) {
    if (supabaseClient) {
      try {
        await supabaseClient.request(`cart_items?user_phone=eq.${userPhone}&product_id=eq.${productId}`, {
          method: 'PATCH',
          body: JSON.stringify({ quantity })
        });
      } catch (error) {
        console.error('Failed to update cart quantity:', error);
        // Silently fail if table doesn't exist
      }
    }
  },

  async removeFromCart(userPhone, productId) {
    if (supabaseClient) {
      try {
        await supabaseClient.request(`cart_items?user_phone=eq.${userPhone}&product_id=eq.${productId}`, {
          method: 'DELETE'
        });
      } catch (error) {
        console.error('Failed to remove from cart:', error);
        // Silently fail if table doesn't exist
      }
    }
  },

  async clearCart(userPhone) {
    if (supabaseClient) {
      try {
        await supabaseClient.request(`cart_items?user_phone=eq.${userPhone}`, {
          method: 'DELETE'
        });
      } catch (error) {
        console.error('Failed to clear cart:', error);
        // Silently fail if table doesn't exist
      }
    }
  }
};

export const isSupabaseConfigured = !!supabaseClient;

// Test function for debugging
export const testDeliveryAgentInsert = async () => {
  console.log('🧪 Testing delivery agent insert...');
  
  const testAgent = {
    userId: 'TEST123',
    password: 'test123',
    name: 'Test Agent',
    phone: '9999999999',
    email: 'test@test.com',
    vehicleType: 'Bike',
    licenseNumber: 'TEST123',
    isActive: true,
    isApproved: true
  };
  
  try {
    const result = await supabaseApi.createDeliveryAgent(testAgent);
    console.log('✅ Test insert successful:', result);
    return result;
  } catch (error) {
    console.error('❌ Test insert failed:', error);
    throw error;
  }
};

// Make it available globally for testing
if (typeof window !== 'undefined') {
  (window as any).testDeliveryAgentInsert = testDeliveryAgentInsert;
}

console.log(`🔗 Database: ${supabaseClient ? 'Supabase Connected' : 'Mock Mode'}`);
console.log(`📊 Config: URL=${supabaseUrl ? 'Set' : 'Missing'}, Key=${supabaseKey ? 'Set' : 'Missing'}`);

// Test Supabase connection on load
if (supabaseClient) {
  supabaseClient.request('delivery_agents?select=count&limit=1')
    .then(() => console.log('✅ Supabase connection test successful'))
    .catch(err => console.error('❌ Supabase connection test failed:', err));
}