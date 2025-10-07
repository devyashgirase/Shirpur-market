// Complete mock Supabase implementation - prevents all external dependencies
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if we have Supabase configuration (for logging purposes only)
const hasValidConfig = supabaseUrl && supabaseKey && 
  supabaseUrl.includes('supabase.co') && supabaseKey.length > 50;

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

// Always use mock client to prevent any Supabase initialization errors
export const supabase = {
  from: () => mockQuery,
  auth: {
    signUp: () => Promise.resolve({ data: null, error: null }),
    signIn: () => Promise.resolve({ data: null, error: null }),
    signOut: () => Promise.resolve({ error: null }),
    getUser: () => Promise.resolve({ data: { user: null }, error: null })
  },
  channel: () => ({
    on: () => ({ subscribe: () => ({}) }),
    subscribe: () => ({}),
    unsubscribe: () => ({})
  })
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

console.log(`📋 Mock Database Active | Config detected: ${hasValidConfig ? 'Yes' : 'No'}`);
if (hasValidConfig) {
  console.log('ℹ️ Supabase config found but using mock for development');
}

// Export configuration status
export const isSupabaseConfigured = false; // Always false to use mock
export const getSupabaseStatus = () => ({
  configured: false,
  url: supabaseUrl ? 'Present' : 'Missing',
  key: supabaseKey ? 'Present' : 'Missing',
  client: 'Mock (Safe Mode)'
});