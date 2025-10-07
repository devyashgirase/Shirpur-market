// Minimal mock - no Supabase
const mockQuery = {
  select: () => mockQuery,
  insert: () => mockQuery,
  update: () => mockQuery,
  eq: () => mockQuery,
  single: () => Promise.resolve({ data: null, error: null }),
  then: (callback) => callback({ data: [], error: null })
};

export const supabase = {
  from: () => mockQuery
};

export const supabaseApi = {
  async getProducts() { return []; },
  async createProduct() { return { id: 1 }; },
  async updateProduct() { return { id: 1 }; },
  async getOrders() { return []; },
  async createOrder() { return { id: 1 }; },
  async updateOrderStatus() { return true; },
  async createCustomer() { return { id: 1 }; },
  async getCategories() { return []; }
};

export const isSupabaseConfigured = false;