// Safe Supabase - No initialization errors
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Mock supabase client to prevent errors
export const supabase = {
  from: () => ({
    select: () => ({ eq: () => Promise.resolve({ data: [], error: null }) }),
    insert: () => ({ select: () => ({ single: () => Promise.resolve({ data: { id: 1 }, error: null }) }) }),
    update: () => ({ eq: () => ({ select: () => ({ single: () => Promise.resolve({ data: { id: 1 }, error: null }) }) }) }),
    delete: () => ({ eq: () => Promise.resolve({ error: null }) })
  })
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