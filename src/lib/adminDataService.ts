import { supabase } from './supabase';

export class AdminDataService {
  // Product Management
  static async getAllProducts() {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  static async createProduct(productData) {
    const { data, error } = await supabase
      .from('products')
      .insert(productData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateProduct(id, updates) {
    const { data, error } = await supabase
      .from('products')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteProduct(id) {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Order Management
  static async getAllOrders() {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async updateOrderStatus(orderId, status) {
    const { data, error } = await supabase
      .from('orders')
      .update({ 
        status, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Delivery Agent Management
  static async getAllDeliveryAgents() {
    const { data, error } = await supabase
      .from('delivery_agents')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async createDeliveryAgent(agentData) {
    const { data, error } = await supabase
      .from('delivery_agents')
      .insert(agentData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateDeliveryAgent(id, updates) {
    const { data, error } = await supabase
      .from('delivery_agents')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Analytics
  static async getDashboardStats() {
    const [products, orders, agents] = await Promise.all([
      this.getAllProducts(),
      this.getAllOrders(),
      this.getAllDeliveryAgents()
    ]);

    const today = new Date().toDateString();
    const todayOrders = orders.filter(order => 
      new Date(order.created_at).toDateString() === today
    );

    return {
      totalProducts: products.length,
      activeProducts: products.filter(p => p.isActive).length,
      lowStockProducts: products.filter(p => p.stockQuantity < 10).length,
      
      totalOrders: orders.length,
      todayOrders: todayOrders.length,
      pendingOrders: orders.filter(o => o.status === 'pending').length,
      deliveredOrders: orders.filter(o => o.status === 'delivered').length,
      
      totalRevenue: orders
        .filter(o => o.payment_status === 'paid')
        .reduce((sum, o) => sum + parseFloat(o.total), 0),
      
      totalAgents: agents.length,
      activeAgents: agents.filter(a => a.is_available).length
    };
  }

  // Category Management
  static async getAllCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  }

  static async createCategory(categoryData) {
    const { data, error } = await supabase
      .from('categories')
      .insert(categoryData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Feedback Management
  static async getAllFeedback() {
    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }
}