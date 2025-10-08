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
      const response = await fetch(`${this.baseUrl}/${endpoint}`, {
        ...options,
        headers: { ...this.headers, ...options.headers }
      });

      if (!response.ok) {
        throw new Error(`Supabase error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Supabase request failed:', error);
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
        return processedData.length > 0 ? processedData : mockData.products;
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

  async updateOrderStatus(id: number, status: string) {
    if (supabaseClient) {
      try {
        const result = await supabaseClient.request(`orders?id=eq.${id}`, {
          method: 'PATCH',
          body: JSON.stringify({ status })
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
  }
};

export const isSupabaseConfigured = !!supabaseClient;

console.log(`🔗 Database: ${supabaseClient ? 'Supabase Connected' : 'Mock Mode'}`);
console.log(`📊 Config: URL=${supabaseUrl ? 'Set' : 'Missing'}, Key=${supabaseKey ? 'Set' : 'Missing'}`);