// Direct Supabase Database Service
import { supabaseApi } from './supabase';

export const useSupabase = true;
export const currentDatabase = 'Supabase Direct';
export const API_BASE_URL = 'https://ftexuxkdfahbqjddidaf.supabase.co';
export const DB_TYPE = 'supabase';
export const currentDb = { apiUrl: API_BASE_URL, type: DB_TYPE };

// Direct Supabase database operations
export const unifiedDB = {
  async getProducts() {
    return await supabaseApi.getProducts();
  },
  
  async createProduct(product: any) {
    console.log('🔍 UnifiedDB creating product:', product);
    try {
      const result = await supabaseApi.createProduct(product);
      console.log('✅ UnifiedDB product created:', result);
      return result;
    } catch (error) {
      console.error('❌ UnifiedDB product creation failed:', error);
      throw error;
    }
  },
  
  async updateProduct(id: number, product: any) {
    return await supabaseApi.updateProduct(id, product);
  },
  
  async getOrders() {
    return await supabaseApi.getOrders();
  },
  
  async createOrder(order: any) {
    return await supabaseApi.createOrder(order);
  },
  
  async updateOrderStatus(orderId: number, status: string) {
    return await supabaseApi.updateOrderStatus(orderId, status);
  },
  
  async createCustomer(customer: any) {
    return await supabaseApi.createCustomer(customer);
  },
  
  async getCategories() {
    return await supabaseApi.getCategories();
  },
  
  async getDashboardStats() {
    const [products, orders] = await Promise.all([
      supabaseApi.getProducts(),
      supabaseApi.getOrders()
    ]);
    
    return {
      totalProducts: products.length,
      activeProducts: products.filter(p => p.isActive).length,
      totalOrders: orders.length,
      pendingOrders: orders.filter(o => o.status === 'pending').length,
      deliveredOrders: orders.filter(o => o.status === 'delivered').length,
      totalRevenue: orders.reduce((sum, o) => sum + parseFloat(o.total || 0), 0)
    };
  }
};

console.log('🔗 Direct Supabase Database Active');