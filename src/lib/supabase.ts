// Real Supabase integration - all data from database
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
    const response = await fetch(`${this.baseUrl}/${endpoint}`, {
      ...options,
      headers: { ...this.headers, ...options.headers }
    });

    if (!response.ok) {
      throw new Error(`Supabase error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Query builder methods
  from(table: string) {
    return {
      select: (columns = '*') => ({
        eq: (column: string, value: any) => 
          this.request(`${table}?select=${columns}&${column}=eq.${value}`),
        order: (column: string, options: any = {}) => {
          const direction = options.ascending === false ? 'desc' : 'asc';
          return this.request(`${table}?select=${columns}&order=${column}.${direction}`);
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

export const supabase = supabaseClient;

export const supabaseApi = {
  async getProducts() {
    if (!supabaseClient) throw new Error('Supabase not initialized');
    
    try {
      const data = await supabaseClient.request('products?isActive=eq.true&order=created_at.desc');
      console.log('📊 Fetched products from Supabase:', data.length);
      return data;
    } catch (error) {
      console.error('❌ Failed to fetch products:', error);
      throw error;
    }
  },

  async getOrders() {
    if (!supabaseClient) throw new Error('Supabase not initialized');
    
    try {
      const data = await supabaseClient.request('orders?order=created_at.desc');
      console.log('📊 Fetched orders from Supabase:', data.length);
      return data;
    } catch (error) {
      console.error('❌ Failed to fetch orders:', error);
      throw error;
    }
  },

  async getCategories() {
    if (!supabaseClient) throw new Error('Supabase not initialized');
    
    try {
      const data = await supabaseClient.request('categories?isActive=eq.true&order=name.asc');
      console.log('📊 Fetched categories from Supabase:', data.length);
      return data;
    } catch (error) {
      console.error('❌ Failed to fetch categories:', error);
      throw error;
    }
  },

  async createProduct(product: any) {
    if (!supabaseClient) throw new Error('Supabase not initialized');
    
    try {
      const result = await supabaseClient.request('products', {
        method: 'POST',
        body: JSON.stringify({
          ...product,
          created_at: new Date().toISOString()
        })
      });
      console.log('✅ Product created in Supabase');
      return result[0];
    } catch (error) {
      console.error('❌ Failed to create product:', error);
      throw error;
    }
  },

  async updateProduct(id: number, product: any) {
    if (!supabaseClient) throw new Error('Supabase not initialized');
    
    try {
      const result = await supabaseClient.request(`products?id=eq.${id}`, {
        method: 'PATCH',
        body: JSON.stringify(product)
      });
      console.log('✅ Product updated in Supabase');
      return result[0];
    } catch (error) {
      console.error('❌ Failed to update product:', error);
      throw error;
    }
  },

  async createOrder(order: any) {
    if (!supabaseClient) throw new Error('Supabase not initialized');
    
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
      throw error;
    }
  },

  async updateOrderStatus(id: number, status: string) {
    if (!supabaseClient) throw new Error('Supabase not initialized');
    
    try {
      const result = await supabaseClient.request(`orders?id=eq.${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
      console.log('✅ Order status updated in Supabase');
      return result[0];
    } catch (error) {
      console.error('❌ Failed to update order status:', error);
      throw error;
    }
  },

  async createCustomer(customer: any) {
    if (!supabaseClient) throw new Error('Supabase not initialized');
    
    try {
      const result = await supabaseClient.request('customers', {
        method: 'POST',
        body: JSON.stringify({
          ...customer,
          created_at: new Date().toISOString()
        })
      });
      console.log('✅ Customer created in Supabase');
      return result[0];
    } catch (error) {
      console.error('❌ Failed to create customer:', error);
      throw error;
    }
  }
};

export const isSupabaseConfigured = !!supabaseClient;

// Log connection status
if (supabaseClient) {
  console.log('🔗 Supabase Database Connected - All data from database');
  console.log(`📊 Database URL: ${supabaseUrl}`);
} else {
  console.error('❌ Supabase not configured - check environment variables');
}