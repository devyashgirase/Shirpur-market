// Complete mock system - no real Supabase to prevent errors
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('🔗 Supabase Mock Mode - No external dependencies');
console.log(`📊 Environment: URL=${supabaseUrl ? 'Set' : 'Missing'}, Key=${supabaseKey ? 'Set' : 'Missing'}`);

// Mock data for all operations
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

// Complete mock query builder
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

// Safe supabase mock
export const supabase = {
  from: () => mockQuery
};

export const supabaseApi = {
  async getProducts() {
    console.log('📊 Returning mock products:', mockData.products.length);
    return mockData.products;
  },

  async getOrders() {
    console.log('📊 Returning mock orders:', mockData.orders.length);
    return mockData.orders;
  },

  async getCategories() {
    console.log('📊 Returning mock categories:', mockData.categories.length);
    return mockData.categories;
  },

  async createProduct(product) {
    const newProduct = { id: Date.now(), ...product };
    mockData.products.push(newProduct);
    console.log('✅ Mock product created:', newProduct.name);
    return newProduct;
  },

  async updateProduct(id, product) {
    const index = mockData.products.findIndex(p => p.id === id);
    if (index !== -1) {
      mockData.products[index] = { ...mockData.products[index], ...product };
      console.log('✅ Mock product updated:', id);
      return mockData.products[index];
    }
    return { id, ...product };
  },

  async createOrder(order) {
    const newOrder = { 
      id: Date.now(), 
      order_id: `ORD${Date.now()}`,
      created_at: new Date().toISOString(),
      ...order 
    };
    mockData.orders.unshift(newOrder);
    console.log('✅ Mock order created:', newOrder.order_id);
    return newOrder;
  },

  async updateOrderStatus(id, status) {
    const index = mockData.orders.findIndex(o => o.id === id);
    if (index !== -1) {
      mockData.orders[index].status = status;
      console.log('✅ Mock order status updated:', id, status);
      return mockData.orders[index];
    }
    return { id, status };
  },

  async createCustomer(customer) {
    const newCustomer = { id: Date.now(), ...customer };
    console.log('✅ Mock customer created:', newCustomer.name);
    return newCustomer;
  }
};

export const isSupabaseConfigured = false;

console.log('📋 Mock Database Ready - All operations will use sample data');