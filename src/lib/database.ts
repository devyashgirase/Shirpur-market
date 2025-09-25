// Unified Database Service - Auto-switches between MySQL (local) and Supabase (production)
import { supabaseApi } from './supabase';
import { apiService } from './apiService';

// Environment detection
const isProduction = import.meta.env.PROD || import.meta.env.VITE_NODE_ENV === 'production';
const hasSupabaseConfig = import.meta.env.VITE_SUPABASE_URL && 
  import.meta.env.VITE_SUPABASE_ANON_KEY && 
  import.meta.env.VITE_SUPABASE_ANON_KEY !== 'GET_FROM_SUPABASE_DASHBOARD_SETTINGS_API';

// Auto-select database based on environment
export const useSupabase = isProduction || hasSupabaseConfig;
export const currentDatabase = useSupabase ? 'Supabase' : 'MySQL';
export const API_BASE_URL = useSupabase ? '/api/supabase' : 'http://localhost:5000/api';
export const DB_TYPE = useSupabase ? 'supabase' : 'mysql';

console.log(`🗄️ Database Mode: ${currentDatabase} ${isProduction ? '(Production)' : '(Local)'}`);

// Unified Database API - Same interface, different backends
export const unifiedDB = {
  async getProducts() {
    return useSupabase ? await supabaseApi.getProducts() : await apiService.getProducts();
  },

  async createProduct(product: any) {
    return useSupabase ? await supabaseApi.createProduct(product) : await apiService.createProduct(product);
  },

  async updateProduct(id: number, product: any) {
    return useSupabase ? await supabaseApi.updateProduct(id, product) : await apiService.updateProduct(id, product);
  },

  async getOrders() {
    return useSupabase ? await supabaseApi.getOrders() : await apiService.getOrders();
  },

  async createOrder(order: any) {
    return useSupabase ? await supabaseApi.createOrder(order) : await apiService.createOrder(order);
  },

  async updateOrderStatus(id: number, status: string) {
    return useSupabase ? await supabaseApi.updateOrderStatus(id, status) : await apiService.updateOrderStatus(id, status);
  },

  async createCustomer(customer: any) {
    return useSupabase ? await supabaseApi.createCustomer(customer) : await apiService.createCustomer(customer);
  },

  async getCategories() {
    return useSupabase ? await supabaseApi.getCategories() : await apiService.getCategories();
  }
};

export const currentDb = { apiUrl: API_BASE_URL, type: DB_TYPE };