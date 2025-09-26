import { SupabaseService, isSupabaseEnabled } from './supabaseService';
import { apiService } from './apiService';

// Unified database service that switches between Supabase and MySQL
export class DatabaseService {
  static async getProducts() {
    if (isSupabaseEnabled()) {
      return SupabaseService.getProducts();
    }
    return apiService.getProducts();
  }

  static async addProduct(product: any) {
    if (isSupabaseEnabled()) {
      return SupabaseService.addProduct(product);
    }
    return apiService.addProduct(product);
  }

  static async updateProduct(id: number, updates: any) {
    if (isSupabaseEnabled()) {
      return SupabaseService.updateProduct(id, updates);
    }
    return apiService.updateProduct(id, updates);
  }

  static async deleteProduct(id: number) {
    if (isSupabaseEnabled()) {
      return SupabaseService.deleteProduct(id);
    }
    return apiService.deleteProduct(id);
  }

  static async getOrders() {
    if (isSupabaseEnabled()) {
      return SupabaseService.getOrders();
    }
    return apiService.getOrders();
  }

  static async createOrder(order: any) {
    if (isSupabaseEnabled()) {
      return SupabaseService.createOrder(order);
    }
    return apiService.createOrder(order);
  }

  static async updateOrderStatus(orderId: string, status: string) {
    if (isSupabaseEnabled()) {
      return SupabaseService.updateOrderStatus(orderId, status);
    }
    return apiService.updateOrderStatus(orderId, status);
  }

  static async updatePaymentStatus(orderId: string, paymentStatus: string) {
    if (isSupabaseEnabled()) {
      return SupabaseService.updatePaymentStatus(orderId, paymentStatus);
    }
    return apiService.updatePaymentStatus(orderId, paymentStatus);
  }

  static async getDeliveryAgents() {
    if (isSupabaseEnabled()) {
      return SupabaseService.getDeliveryAgents();
    }
    return apiService.getDeliveryAgents();
  }

  static async updateAgentLocation(phone: string, latitude: number, longitude: number) {
    if (isSupabaseEnabled()) {
      return SupabaseService.updateAgentLocation(phone, latitude, longitude);
    }
    return apiService.updateAgentLocation(phone, latitude, longitude);
  }

  static async updateAgentAvailability(phone: string, isAvailable: boolean) {
    if (isSupabaseEnabled()) {
      return SupabaseService.updateAgentAvailability(phone, isAvailable);
    }
    return apiService.updateAgentAvailability(phone, isAvailable);
  }

  static getConnectionType() {
    return isSupabaseEnabled() ? 'Supabase' : 'MySQL';
  }
}

export { isSupabaseEnabled };