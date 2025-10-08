import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if we have valid Supabase configuration
const hasValidConfig = supabaseUrl && 
  supabaseKey && 
  supabaseUrl !== 'undefined' && 
  supabaseKey !== 'undefined' &&
  supabaseUrl.includes('supabase.co') &&
  supabaseKey.length > 50;

let supabaseClient = null;

// Initialize Supabase client
if (hasValidConfig) {
  try {
    supabaseClient = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Supabase connected successfully');
  } catch (error) {
    console.warn('⚠️ Supabase initialization failed:', error);
  }
} else {
  console.warn('⚠️ Supabase config invalid:', { 
    hasUrl: !!supabaseUrl, 
    hasKey: !!supabaseKey,
    urlValid: supabaseUrl?.includes('supabase.co'),
    keyLength: supabaseKey?.length 
  });
}

// Mock data for fallback
const mockData = {
  products: [
    { id: 1, name: 'Fresh Tomatoes', price: 40, category: 'Vegetables', stockQuantity: 100, isActive: true, imageUrl: '/placeholder.svg', description: 'Fresh red tomatoes' },
    { id: 2, name: 'Basmati Rice', price: 120, category: 'Grains', stockQuantity: 50, isActive: true, imageUrl: '/placeholder.svg', description: 'Premium basmati rice' },
    { id: 3, name: 'Fresh Milk', price: 60, category: 'Dairy', stockQuantity: 30, isActive: true, imageUrl: '/placeholder.svg', description: 'Pure cow milk' },
    { id: 4, name: 'Onions', price: 35, category: 'Vegetables', stockQuantity: 80, isActive: true, imageUrl: '/placeholder.svg', description: 'Fresh red onions' },
    { id: 5, name: 'Bananas', price: 50, category: 'Fruits', stockQuantity: 60, isActive: true, imageUrl: '/placeholder.svg', description: 'Ripe yellow bananas' }
  ],
  orders: [
    { id: 1, order_id: 'ORD001', customer_name: 'John Doe', customer_phone: '9876543210', delivery_address: '123 Main St, Shirpur', total: 250, status: 'pending', payment_status: 'paid', created_at: new Date().toISOString() },
    { id: 2, order_id: 'ORD002', customer_name: 'Jane Smith', customer_phone: '9876543211', delivery_address: '456 Oak Ave, Shirpur', total: 180, status: 'out_for_delivery', payment_status: 'paid', created_at: new Date(Date.now() - 3600000).toISOString() },
    { id: 3, order_id: 'ORD003', customer_name: 'Mike Johnson', customer_phone: '9876543212', delivery_address: '789 Pine Rd, Shirpur', total: 320, status: 'delivered', payment_status: 'paid', created_at: new Date(Date.now() - 7200000).toISOString() }
  ],
  categories: [
    { id: 1, name: 'Vegetables', slug: 'vegetables', isActive: true },
    { id: 2, name: 'Grains', slug: 'grains', isActive: true },
    { id: 3, name: 'Dairy', slug: 'dairy', isActive: true },
    { id: 4, name: 'Fruits', slug: 'fruits', isActive: true }
  ]
};

export const supabase = supabaseClient;

export const supabaseApi = {
  async getProducts() {
    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient.from('products').select('*').eq('isActive', true);
        if (error) throw error;
        console.log('📊 Fetched products from Supabase:', data?.length || 0);
        return data || mockData.products;
      } catch (error) {
        console.warn('Supabase products fetch failed, using mock:', error);
        return mockData.products;
      }
    }
    console.log('📋 Using mock products data');
    return mockData.products;
  },

  async getOrders() {
    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient.from('orders').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        console.log('📊 Fetched orders from Supabase:', data?.length || 0);
        return data || mockData.orders;
      } catch (error) {
        console.warn('Supabase orders fetch failed, using mock:', error);
        return mockData.orders;
      }
    }
    console.log('📋 Using mock orders data');
    return mockData.orders;
  },

  async getCategories() {
    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient.from('categories').select('*').eq('isActive', true);
        if (error) throw error;
        console.log('📊 Fetched categories from Supabase:', data?.length || 0);
        return data || mockData.categories;
      } catch (error) {
        console.warn('Supabase categories fetch failed, using mock:', error);
        return mockData.categories;
      }
    }
    console.log('📋 Using mock categories data');
    return mockData.categories;
  },

  async createProduct(product) {
    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient.from('products').insert(product).select().single();
        if (error) throw error;
        return data;
      } catch (error) {
        console.warn('Supabase product creation failed:', error);
      }
    }
    return { id: Date.now(), ...product };
  },

  async updateProduct(id, product) {
    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient.from('products').update(product).eq('id', id).select().single();
        if (error) throw error;
        return data;
      } catch (error) {
        console.warn('Supabase product update failed:', error);
      }
    }
    return { id, ...product };
  },

  async createOrder(order) {
    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient.from('orders').insert(order).select().single();
        if (error) throw error;
        return data;
      } catch (error) {
        console.warn('Supabase order creation failed:', error);
      }
    }
    return { id: Date.now(), ...order };
  },

  async updateOrderStatus(id, status) {
    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient.from('orders').update({ status }).eq('id', id).select().single();
        if (error) throw error;
        return data;
      } catch (error) {
        console.warn('Supabase order status update failed:', error);
      }
    }
    return { id, status };
  },

  async createCustomer(customer) {
    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient.from('customers').insert(customer).select().single();
        if (error) throw error;
        return data;
      } catch (error) {
        console.warn('Supabase customer creation failed:', error);
      }
    }
    return { id: Date.now(), ...customer };
  }
};

export const isSupabaseConfigured = !!supabaseClient;

// Log connection status
console.log(`🔗 Database: ${supabaseClient ? 'Supabase Connected' : 'Mock Data Only'}`);
console.log(`📊 Environment: URL=${supabaseUrl ? 'Set' : 'Missing'}, Key=${supabaseKey ? 'Set' : 'Missing'}`);

if (hasValidConfig && !supabaseClient) {
  console.log('📋 Supabase config found but connection failed - using mock data');
}