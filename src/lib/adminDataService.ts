// Admin data service using ONLY Supabase database
export class AdminDataService {
  // Orders Management - direct Supabase only
  static async getAdminOrders() {
    try {
      const { supabaseApi } = await import('./supabase');
      const orders = await supabaseApi.getOrders();
      return orders.map(order => ({
        id: order.id,
        orderId: order.id,
        customerName: order.customer_name,
        customerPhone: order.customer_phone,
        deliveryAddress: order.customer_address,
        total: order.total_amount,
        status: order.order_status,
        paymentStatus: order.payment_status,
        items: order.items || [],
        createdAt: order.created_at || new Date().toISOString(),
        updatedAt: order.updated_at
      })).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      console.error('Failed to load admin orders:', error);
      return [];
    }
  }

  // Products Management - direct Supabase only
  static async getAdminProducts() {
    try {
      const { supabaseApi } = await import('./supabase');
      return await supabaseApi.getProducts();
    } catch (error) {
      console.error('Failed to load admin products:', error);
      return [];
    }
  }

  // Create new product - direct Supabase only
  static async createProduct(productData: any) {
    try {
      const { supabaseApi } = await import('./supabase');
      return await supabaseApi.createProduct(productData);
    } catch (error) {
      console.error('Admin: Failed to create product', error);
      return null;
    }
  }

  // Update product - direct Supabase only
  static async updateProduct(id: number, updates: any) {
    try {
      const { supabaseApi } = await import('./supabase');
      return await supabaseApi.updateProduct(id, updates);
    } catch (error) {
      console.error('Admin: Failed to update product', error);
      return null;
    }
  }

  // Update order status - direct Supabase only
  static async updateOrderStatus(orderId: number, status: string): Promise<boolean> {
    try {
      const { supabaseApi } = await import('./supabase');
      return await supabaseApi.updateOrderStatus(orderId, status);
    } catch (error) {
      console.error('Admin: Failed to update order status', error);
      return false;
    }
  }

  // Get customers - direct Supabase only
  static async getCustomers() {
    try {
      const { supabaseApi } = await import('./supabase');
      return await supabaseApi.getCustomers();
    } catch (error) {
      console.error('Failed to load customers:', error);
      return [];
    }
  }

  // Get delivery agents - direct Supabase only
  static async getDeliveryAgents() {
    try {
      const { supabaseApi } = await import('./supabase');
      return await supabaseApi.getDeliveryAgents();
    } catch (error) {
      console.error('Failed to load delivery agents:', error);
      return [];
    }
  }


}