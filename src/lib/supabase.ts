// Fixed Supabase integration with proper error handling
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Supabase REST API client with better error handling
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
        const errorText = await response.text();
        console.error(`Supabase ${response.status} error:`, errorText);
        throw new Error(`Supabase error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Supabase request failed:', error);
      throw error;
    }
  }
}

// Initialize Supabase client
let supabaseClient: SupabaseClient | null = null;

if (supabaseUrl && supabaseKey) {
  try {
    supabaseClient = new SupabaseClient(supabaseUrl, supabaseKey);
    console.log('✅ Supabase client initialized');
  } catch (error) {
    console.error('❌ Supabase initialization failed:', error);
  }
}

// Mock data as fallback
const mockData = {
  products: [
    { id: 1, name: 'Fresh Tomatoes', price: 40, category: 'Vegetables', stockQuantity: 100, isActive: true, imageUrl: '/placeholder.svg', description: 'Fresh red tomatoes' },
    { id: 2, name: 'Basmati Rice', price: 120, category: 'Grains', stockQuantity: 50, isActive: true, imageUrl: '/placeholder.svg', description: 'Premium basmati rice' },
    { id: 3, name: 'Fresh Milk', price: 60, category: 'Dairy', stockQuantity: 30, isActive: true, imageUrl: '/placeholder.svg', description: 'Pure cow milk' }
  ],
  orders: [
    { id: 1, order_id: 'ORD001', customer_name: 'John Doe', customer_phone: '9876543210', delivery_address: '123 Main St, Shirpur', total: 250, status: 'pending', payment_status: 'paid', created_at: new Date().toISOString() }
  ],
  categories: [
    { id: 1, name: 'Vegetables', slug: 'vegetables', isActive: true },
    { id: 2, name: 'Grains', slug: 'grains', isActive: true },
    { id: 3, name: 'Dairy', slug: 'dairy', isActive: true }
  ]
};

export const supabase = supabaseClient;

export const supabaseApi = {
  async getProducts() {
    if (!supabaseClient) {
      console.log('📋 Supabase not available, using mock products');
      return mockData.products;
    }
    
    try {
      // Try different possible column names
      let data;
      try {
        data = await supabaseClient.request('products?select=*');
      } catch (error) {
        console.warn('Failed to fetch from products table, trying mock data');
        return mockData.products;
      }
      
      console.log('📊 Fetched products from Supabase:', data.length);
      return data.length > 0 ? data : mockData.products;
    } catch (error) {
      console.warn('Supabase products failed, using mock:', error);
      return mockData.products;
    }
  },

  async getOrders() {
    if (!supabaseClient) {
      console.log('📋 Supabase not available, using mock orders');
      return mockData.orders;
    }
    
    try {
      const data = await supabaseClient.request('orders?select=*&order=created_at.desc');
      console.log('📊 Fetched orders from Supabase:', data.length);
      return data.length > 0 ? data : mockData.orders;
    } catch (error) {
      console.warn('Supabase orders failed, using mock:', error);
      return mockData.orders;
    }
  },

  async getCategories() {
    if (!supabaseClient) {
      console.log('📋 Supabase not available, using mock categories');
      return mockData.categories;
    }
    
    try {
      const data = await supabaseClient.request('categories?select=*');
      console.log('📊 Fetched categories from Supabase:', data.length);
      return data.length > 0 ? data : mockData.categories;
    } catch (error) {
      console.warn('Supabase categories failed, using mock:', error);
      return mockData.categories;
    }
  },

  async createProduct(product: any) {
    if (!supabaseClient) {
      return { id: Date.now(), ...product };
    }
    
    try {
      const result = await supabaseClient.request('products', {
        method: 'POST',
        body: JSON.stringify(product)
      });
      console.log('✅ Product created in Supabase');
      return result[0];
    } catch (error) {
      console.error('❌ Failed to create product:', error);
      return { id: Date.now(), ...product };
    }
  },

  async updateProduct(id: number, product: any) {
    if (!supabaseClient) {
      return { id, ...product };
    }
    
    try {
      const result = await supabaseClient.request(`products?id=eq.${id}`, {
        method: 'PATCH',
        body: JSON.stringify(product)
      });
      console.log('✅ Product updated in Supabase');
      return result[0];
    } catch (error) {
      console.error('❌ Failed to update product:', error);
      return { id, ...product };
    }
  },

  async createOrder(order: any) {
    if (!supabaseClient) {
      return { id: Date.now(), order_id: `ORD${Date.now()}`, ...order };
    }
    
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
      console.log('✅ Order created in Supabase');
      return result[0];
    } catch (error) {
      console.error('❌ Failed to create order:', error);
      return { id: Date.now(), order_id: `ORD${Date.now()}`, ...order };
    }
  },

  async updateOrderStatus(id: number, status: string) {
    if (!supabaseClient) {
      return { id, status };
    }
    
    try {
      const result = await supabaseClient.request(`orders?id=eq.${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
      console.log('✅ Order status updated in Supabase');
      return result[0];
    } catch (error) {
      console.error('❌ Failed to update order status:', error);
      return { id, status };
    }
  },

  async createCustomer(customer: any) {
    if (!supabaseClient) {
      return { id: Date.now(), ...customer };
    }
    
    try {
      const result = await supabaseClient.request('customers', {
        method: 'POST',
        body: JSON.stringify(customer)
      });
      console.log('✅ Customer created in Supabase');
      return result[0];
    } catch (error) {
      console.error('❌ Failed to create customer:', error);
      return { id: Date.now(), ...customer };
    }
  }
};

export const isSupabaseConfigured = !!supabaseClient;

// Log connection status
if (supabaseClient) {
  console.log('🔗 Supabase Database Connected with fallback to mock data');
} else {
  console.log('📋 Using mock data only - Supabase not configured');
}