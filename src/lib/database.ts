// Unified Database Service - Auto-switches between MySQL (local) and Supabase (production)
import { supabaseApi } from './supabase';
import { apiService } from './apiService';

// Production Environment Detection
const isProduction = import.meta.env.PROD || window.location.hostname !== 'localhost';
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Debug environment variables
console.log('🔍 Environment Debug:');
console.log('- VITE_SUPABASE_URL:', supabaseUrl ? '✅ Present' : '❌ Missing');
console.log('- VITE_SUPABASE_ANON_KEY:', supabaseKey ? '✅ Present' : '❌ Missing');
console.log('- Is Production:', isProduction);
console.log('- Hostname:', window.location.hostname);

const hasSupabaseConfig = supabaseUrl && supabaseKey && 
  supabaseUrl.includes('supabase.co') && supabaseKey.length > 50;

// Force Supabase for production deployment
export const useSupabase = hasSupabaseConfig;
export const currentDatabase = useSupabase ? 'Supabase (Production)' : 'Local Development';
export const API_BASE_URL = useSupabase ? '/api/supabase' : 'http://localhost:5000/api';
export const DB_TYPE = useSupabase ? 'supabase' : 'mysql';

console.log(`🚀 Database: ${currentDatabase} | Host: ${window.location.hostname}`);
console.log('🔧 Supabase Config Check:', hasSupabaseConfig ? '✅ Valid' : '❌ Invalid');

if (!useSupabase && isProduction) {
  console.warn('⚠️ Production detected but Supabase not configured!');
  console.warn('📋 Check environment variables in build process');
}

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