// Mock database - no external dependencies
import { supabaseApi } from './supabase';
import { apiService } from './apiService';

export const useSupabase = false;
export const currentDatabase = 'Mock Development';

export const unifiedDB = {
  async getProducts() { return []; },
  async createProduct() { return { id: 1 }; },
  async updateProduct() { return { id: 1 }; },
  async getOrders() { return []; },
  async createOrder() { return { id: 1 }; },
  async updateOrderStatus() { return true; },
  async createCustomer() { return { id: 1 }; },
  async getCategories() { return []; }
};