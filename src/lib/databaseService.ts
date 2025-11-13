import { supabaseApi } from './supabase';

// Unified database service using Supabase exclusively
export class DatabaseService {
  static async getProducts() {
    try {
      return await supabaseApi.getProducts();
    } catch (error) {
      console.error('Database connection failed:', error);
      return [];
    }
  }

  static async addProduct(product: any) {
    return await supabaseApi.createProduct(product);
  }

  static async updateProduct(id: number, updates: any) {
    return await supabaseApi.updateProduct(id, updates);
  }

  static async deleteProduct(id: number) {
    // Add delete method to supabaseApi if needed
    throw new Error('Delete product not implemented');
  }

  static async getOrders() {
    try {
      return await supabaseApi.getOrders();
    } catch (error) {
      console.error('Database connection failed:', error);
      return [];
    }
  }

  static async createOrder(order: any) {
    try {
      console.log('📦 DatabaseService: Creating order:', order);
      const result = await supabaseApi.createOrder(order);
      console.log('✅ DatabaseService: Order created successfully:', result);
      return result;
    } catch (error) {
      console.error('❌ DatabaseService: Order creation failed:', error);
      throw error;
    }
  }

  static async updateOrderStatus(orderId: string, status: string) {
    // Convert orderId to number if needed
    const id = typeof orderId === 'string' ? parseInt(orderId) : orderId;
    return await supabaseApi.updateOrderStatus(id, status);
  }

  static async updatePaymentStatus(orderId: string, paymentStatus: string) {
    const id = typeof orderId === 'string' ? parseInt(orderId) : orderId;
    return await supabaseApi.updatePaymentStatus(id, paymentStatus);
  }

  static async getDeliveryAgents() {
    return await supabaseApi.getDeliveryAgents();
  }

  static async updateAgentLocation(phone: string, latitude: number, longitude: number) {
    return await supabaseApi.updateDeliveryLocation(parseInt(phone), latitude, longitude);
  }

  static async updateAgentAvailability(phone: string, isAvailable: boolean) {
    // Add this method to supabaseApi if needed
    console.log('Update agent availability:', { phone, isAvailable });
  }

  static async getCart(userPhone: string) {
    try {
      return await supabaseApi.getCart(userPhone);
    } catch (error) {
      console.error('Failed to get cart:', error);
      return [];
    }
  }

  static async addToCart(userPhone: string, productId: string, quantity: number) {
    try {
      return await supabaseApi.addToCart(userPhone, productId, quantity);
    } catch (error) {
      console.error('Failed to add to cart:', error);
      throw error;
    }
  }

  static async updateCartQuantity(userPhone: string, productId: string, quantity: number) {
    try {
      return await supabaseApi.updateCartQuantity(userPhone, productId, quantity);
    } catch (error) {
      console.error('Failed to update cart quantity:', error);
      throw error;
    }
  }

  static async removeFromCart(userPhone: string, productId: string) {
    try {
      return await supabaseApi.removeFromCart(userPhone, productId);
    } catch (error) {
      console.error('Failed to remove from cart:', error);
      throw error;
    }
  }

  static async clearCart(userPhone: string) {
    try {
      return await supabaseApi.clearCart(userPhone);
    } catch (error) {
      console.error('Failed to clear cart:', error);
      throw error;
    }
  }

  static getConnectionType() {
    return 'Supabase';
  }
}

export const isSupabaseEnabled = () => true;