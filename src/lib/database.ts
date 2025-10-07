import { supabaseApi } from './supabase';

export const useSupabase = true;
export const currentDatabase = 'Supabase Production';
export const API_BASE_URL = 'https://rfzviddearsabuxyfslg.supabase.co';
export const DB_TYPE = 'supabase';
export const currentDb = { apiUrl: API_BASE_URL, type: DB_TYPE };

export const unifiedDB = {
  async getProducts() {
    return await supabaseApi.getProducts();
  },
  
  async createProduct(product) {
    return await supabaseApi.createProduct(product);
  },
  
  async updateProduct(id, product) {
    return await supabaseApi.updateProduct(id, product);
  },
  
  async getOrders() {
    return await supabaseApi.getOrders();
  },
  
  async createOrder(order) {
    return await supabaseApi.createOrder(order);
  },
  
  async updateOrderStatus(id, status) {
    return await supabaseApi.updateOrderStatus(id, status);
  },
  
  async createCustomer(customer) {
    return await supabaseApi.createCustomer(customer);
  },
  
  async getCategories() {
    return await supabaseApi.getCategories();
  },

  async getDeliveryAgents() {
    return await supabaseApi.getDeliveryAgents();
  },

  async updateDeliveryLocation(agentId, latitude, longitude) {
    return await supabaseApi.updateDeliveryLocation(agentId, latitude, longitude);
  }
};