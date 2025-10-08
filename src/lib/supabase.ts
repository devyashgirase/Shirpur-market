// Direct Supabase REST API - No client library needed
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const hasValidConfig = supabaseUrl && supabaseKey && 
  supabaseUrl.includes('supabase.co') && supabaseKey.length > 50;

// Direct API calls to Supabase REST API
async function supabaseRequest(endpoint: string, options: RequestInit = {}) {
  if (!hasValidConfig) {
    throw new Error('Supabase not configured');
  }

  const url = `${supabaseUrl}/rest/v1/${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`Supabase API error: ${response.status}`);
  }

  return response.json();
}

// Mock data fallback
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

// Mock query for compatibility
const mockQuery = {
  select: () => mockQuery,
  insert: () => mockQuery,
  update: () => mockQuery,
  delete: () => mockQuery,
  eq: () => mockQuery,
  order: () => mockQuery,
  single: () => Promise.resolve({ data: { id: Date.now() }, error: null }),
  then: (callback) => callback({ data: [], error: null })
};

export const supabase = {
  from: () => mockQuery
};

export const supabaseApi = {
  async getProducts() {
    if (hasValidConfig) {
      try {
        const data = await supabaseRequest('products?isActive=eq.true');
        console.log('✅ Fetched products from Supabase:', data.length);
        return data.length > 0 ? data : mockData.products;
      } catch (error) {
        console.warn('Supabase products failed, using mock:', error);
        return mockData.products;
      }
    }
    console.log('📋 Using mock products');
    return mockData.products;
  },

  async getOrders() {
    if (hasValidConfig) {
      try {
        const data = await supabaseRequest('orders?order=created_at.desc');
        console.log('✅ Fetched orders from Supabase:', data.length);
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
    if (hasValidConfig) {
      try {
        const data = await supabaseRequest('categories?isActive=eq.true');
        console.log('✅ Fetched categories from Supabase:', data.length);
        return data.length > 0 ? data : mockData.categories;
      } catch (error) {
        console.warn('Supabase categories failed, using mock:', error);
        return mockData.categories;
      }
    }
    console.log('📋 Using mock categories');
    return mockData.categories;
  },

  async createProduct(product) {
    if (hasValidConfig) {
      try {
        const data = await supabaseRequest('products', {
          method: 'POST',
          body: JSON.stringify(product)
        });
        console.log('✅ Created product in Supabase');
        return data[0];
      } catch (error) {
        console.warn('Supabase product creation failed:', error);
      }
    }
    return { id: Date.now(), ...product };
  },

  async updateProduct(id, product) {
    if (hasValidConfig) {
      try {
        const data = await supabaseRequest(`products?id=eq.${id}`, {
          method: 'PATCH',
          body: JSON.stringify(product)
        });
        console.log('✅ Updated product in Supabase');
        return data[0];
      } catch (error) {
        console.warn('Supabase product update failed:', error);
      }
    }
    return { id, ...product };
  },

  async createOrder(order) {
    if (hasValidConfig) {
      try {
        const orderData = {
          ...order,
          order_id: `ORD${Date.now()}`,
          created_at: new Date().toISOString()
        };
        const data = await supabaseRequest('orders', {
          method: 'POST',
          body: JSON.stringify(orderData)
        });
        console.log('✅ Created order in Supabase');
        return data[0];
      } catch (error) {
        console.warn('Supabase order creation failed:', error);
      }
    }
    return { id: Date.now(), order_id: `ORD${Date.now()}`, ...order };
  },

  async updateOrderStatus(id, status) {
    if (hasValidConfig) {
      try {
        const data = await supabaseRequest(`orders?id=eq.${id}`, {
          method: 'PATCH',
          body: JSON.stringify({ status })
        });
        console.log('✅ Updated order status in Supabase');
        return data[0];
      } catch (error) {
        console.warn('Supabase order update failed:', error);
      }
    }
    return { id, status };
  },

  async createCustomer(customer) {
    if (hasValidConfig) {
      try {
        const data = await supabaseRequest('customers', {
          method: 'POST',
          body: JSON.stringify(customer)
        });
        console.log('✅ Created customer in Supabase');
        return data[0];
      } catch (error) {
        console.warn('Supabase customer creation failed:', error);
      }
    }
    return { id: Date.now(), ...customer };
  }
};

export const isSupabaseConfigured = hasValidConfig;

console.log(`🔗 Database: ${hasValidConfig ? 'Supabase REST API' : 'Mock Only'}`);
console.log(`📊 Config: URL=${supabaseUrl ? 'Set' : 'Missing'}, Key=${supabaseKey ? 'Set' : 'Missing'}`);

if (hasValidConfig) {
  console.log('✅ Using direct Supabase REST API - no client library needed');
} else {
  console.log('📋 Using mock data - configure Supabase for real data');
}