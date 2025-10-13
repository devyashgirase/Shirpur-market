import { SupabaseService, isSupabaseEnabled } from './supabaseService';
import { apiService } from './apiService';

// Unified database service that switches between Supabase and MySQL
export class DatabaseService {
  static async getProducts() {
    try {
      if (isSupabaseEnabled()) {
        return SupabaseService.getProducts();
      }
      return apiService.getProducts();
    } catch (error) {
      console.warn('Database connection failed, using fallback data:', error);
      return this.getFallbackProducts();
    }
  }

  static getFallbackProducts() {
    return [
      {
        id: 1,
        name: 'Demo Product 1',
        price: 100,
        category: 'Demo Category',
        stockQuantity: 50,
        isActive: true
      },
      {
        id: 2,
        name: 'Demo Product 2',
        price: 75,
        category: 'Demo Category',
        stockQuantity: 5,
        isActive: true
      }
    ];
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
    try {
      if (isSupabaseEnabled()) {
        return SupabaseService.getOrders();
      }
      return apiService.getOrders();
    } catch (error) {
      console.warn('Database connection failed, using fallback data:', error);
      return this.getFallbackOrders();
    }
  }

  static getFallbackOrders() {
    return [
      {
        id: 1,
        orderId: 'ORD-001',
        customerName: 'Demo Customer',
        customerPhone: '+91 9876543210',
        total: 250,
        status: 'delivered',
        paymentStatus: 'paid',
        createdAt: new Date().toISOString(),
        deliveryAddress: 'Demo Address, Shirpur',
        items: [
          { name: 'Demo Product 1', quantity: 2, price: 100 },
          { name: 'Demo Product 2', quantity: 1, price: 50 }
        ]
      },
      {
        id: 2,
        orderId: 'ORD-002',
        customerName: 'Test User',
        customerPhone: '+91 8765432109',
        total: 180,
        status: 'out_for_delivery',
        paymentStatus: 'paid',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        deliveryAddress: 'Test Address, Shirpur',
        items: [
          { name: 'Test Product', quantity: 3, price: 60 }
        ]
      }
    ];
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

  static async getCart(userPhone: string) {
    try {
      if (isSupabaseEnabled()) {
        const { supabaseApi } = await import('./supabase');
        return await supabaseApi.getCart(userPhone);
      }
      return [];
    } catch (error) {
      console.error('Failed to get cart:', error);
      return [];
    }
  }

  static async addToCart(userPhone: string, productId: string, quantity: number) {
    try {
      if (isSupabaseEnabled()) {
        const { supabaseApi } = await import('./supabase');
        return await supabaseApi.addToCart(userPhone, productId, quantity);
      }
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  }

  static async updateCartQuantity(userPhone: string, productId: string, quantity: number) {
    try {
      if (isSupabaseEnabled()) {
        const { supabaseApi } = await import('./supabase');
        return await supabaseApi.updateCartQuantity(userPhone, productId, quantity);
      }
    } catch (error) {
      console.error('Failed to update cart quantity:', error);
    }
  }

  static async removeFromCart(userPhone: string, productId: string) {
    try {
      if (isSupabaseEnabled()) {
        const { supabaseApi } = await import('./supabase');
        return await supabaseApi.removeFromCart(userPhone, productId);
      }
    } catch (error) {
      console.error('Failed to remove from cart:', error);
    }
  }

  static async clearCart(userPhone: string) {
    try {
      if (isSupabaseEnabled()) {
        const { supabaseApi } = await import('./supabase');
        return await supabaseApi.clearCart(userPhone);
      }
    } catch (error) {
      console.error('Failed to clear cart:', error);
    }
  }

  static getConnectionType() {
    return isSupabaseEnabled() ? 'Supabase' : 'MySQL';
  }
}

export { isSupabaseEnabled };