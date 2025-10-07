// Complete mock Supabase replacement - NO REAL SUPABASE
const mockQuery = {
  select: () => mockQuery,
  insert: () => mockQuery,
  update: () => mockQuery,
  upsert: () => mockQuery,
  eq: () => mockQuery,
  single: () => Promise.resolve({ data: null, error: null }),
  order: () => mockQuery,
  limit: () => mockQuery,
  then: (callback) => callback({ data: [], error: null })
};

export const supabase = {
  from: () => mockQuery
};

// Mock API functions
export const supabaseApi = {
  async getProducts() {
    return [
      { id: 1, name: 'Rice', price: 50, category: 'Grains', stockQuantity: 100, isActive: true, imageUrl: '/placeholder.svg', description: 'Premium Basmati Rice' },
      { id: 2, name: 'Wheat', price: 40, category: 'Grains', stockQuantity: 80, isActive: true, imageUrl: '/placeholder.svg', description: 'Fresh Wheat' },
      { id: 3, name: 'Dal', price: 120, category: 'Pulses', stockQuantity: 50, isActive: true, imageUrl: '/placeholder.svg', description: 'Toor Dal' }
    ];
  },
  
  async createProduct(product) {
    return { id: Date.now(), ...product };
  },
  
  async updateProduct(id, product) {
    return { id, ...product };
  },
  
  async getOrders() {
    return [
      { id: 1, orderId: 'ORD-001', customerName: 'John Doe', total: 150, status: 'pending', createdAt: new Date().toISOString() }
    ];
  },
  
  async createOrder(order) {
    return { id: Date.now(), orderId: `ORD-${Date.now()}`, ...order, status: 'pending', createdAt: new Date().toISOString() };
  },
  
  async updateOrderStatus() { return true; },
  async createCustomer() { return { id: 1 }; },
  async updateProductStock() { return true; },
  async updatePaymentStatus() { return true; },
  async updateDeliveryLocation() { return true; },
  async getCategories() {
    return [
      { id: 1, name: 'Grains', slug: 'grains', isActive: true },
      { id: 2, name: 'Pulses', slug: 'pulses', isActive: true },
      { id: 3, name: 'Oil', slug: 'oil', isActive: true }
    ];
  }
};

export const verifyDatabaseTables = () => Promise.resolve(true);
export const inspectDatabase = () => Promise.resolve();
export const testConnection = () => Promise.resolve(true);

console.log('📋 Using complete mock database - no external dependencies');