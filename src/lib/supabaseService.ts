// Zero Supabase Service
export const supabase = null;
export const isSupabaseEnabled = () => false;

export class SupabaseService {
  static async getProducts() { return []; }
  static async addProduct() { return { id: 1 }; }
  static async updateProduct() { return { id: 1 }; }
  static async deleteProduct() { return; }
  static async getOrders() { return []; }
  static async createOrder() { return { id: 1 }; }
  static async updateOrderStatus() { return {}; }
  static async updatePaymentStatus() { return {}; }
  static async getDeliveryAgents() { return []; }
  static async updateAgentLocation() { return; }
  static async updateAgentAvailability() { return; }
  static subscribeToOrders() { return null; }
  static subscribeToProducts() { return null; }
}