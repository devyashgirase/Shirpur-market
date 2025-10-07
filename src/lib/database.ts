// Dynamic Database Service
import { supabaseApi } from './supabase';
import { apiService } from './apiService';
import { dynamicDataService } from './dynamicDataService';

export const useSupabase = false;
export const currentDatabase = 'Dynamic Mock System';
export const API_BASE_URL = '/api/mock';
export const DB_TYPE = 'dynamic';
export const currentDb = { apiUrl: API_BASE_URL, type: DB_TYPE };

// Enhanced unified database with dynamic data
export const unifiedDB = {
  // Products with dynamic features
  async getProducts() {
    return await dynamicDataService.getProducts();
  },
  
  async createProduct(product: any) {
    const result = await apiService.createProduct(product);
    await dynamicDataService.getProducts(true); // Refresh cache
    return result;
  },
  
  async updateProduct(id: number, product: any) {
    const result = await apiService.updateProduct(id, product);
    await dynamicDataService.getProducts(true); // Refresh cache
    return result;
  },
  
  async updateProductStock(productId: number, quantityChange: number) {
    return await dynamicDataService.updateProductStock(productId, quantityChange);
  },

  // Orders with real-time tracking
  async getOrders() {
    return await dynamicDataService.getOrders();
  },
  
  async createOrder(order: any) {
    const result = await apiService.createOrder(order);
    await dynamicDataService.getOrders(true); // Refresh cache
    return result;
  },
  
  async updateOrderStatus(orderId: number, status: string) {
    return await dynamicDataService.updateOrderStatus(orderId, status);
  },
  
  // Analytics with real-time calculations
  async getDashboardStats() {
    return await dynamicDataService.getDashboardStats();
  },
  
  // Other services
  async createCustomer(customer: any) {
    return await apiService.createCustomer(customer);
  },
  
  async getCategories() {
    return await apiService.getCategories();
  },
  
  // Real-time subscriptions
  subscribe(event: string, callback: Function) {
    dynamicDataService.subscribe(event, callback);
  },
  
  unsubscribe(event: string, callback: Function) {
    dynamicDataService.unsubscribe(event, callback);
  },
  
  // Cache management
  async refreshAllData() {
    return await dynamicDataService.refreshAllData();
  },
  
  clearCache() {
    dynamicDataService.clearCache();
  }
};

console.log('🚀 Dynamic Database System Active - Real-time data with smart caching');