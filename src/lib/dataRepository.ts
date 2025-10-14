// Clean data repository abstraction for easy backend switching
import { supabaseApi } from './supabase';

export interface Order {
  id?: number;
  order_id: string;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  items: string;
  total_amount: number;
  status: string;
  payment_status: string;
  created_at: string;
}

export interface CartItem {
  id: number;
  user_phone: string;
  product_id: number;
  quantity: number;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  stockQuantity: number;
  imageUrl: string;
  description: string;
}

class DataRepository {
  // Orders
  async createOrder(order: Omit<Order, 'id'>): Promise<Order> {
    return await supabaseApi.createOrder(order);
  }

  async getOrders(): Promise<Order[]> {
    return await supabaseApi.getOrders();
  }

  async getOrdersByCustomer(customerPhone: string): Promise<Order[]> {
    const allOrders = await this.getOrders();
    return allOrders.filter(order => order.customer_phone === customerPhone);
  }

  async updateOrderStatus(orderId: number, status: string): Promise<Order> {
    return await supabaseApi.updateOrderStatus(orderId, status);
  }

  // Cart
  async getCart(userPhone: string): Promise<any[]> {
    return await supabaseApi.getCart(userPhone);
  }

  async addToCart(userPhone: string, productId: number, quantity: number): Promise<void> {
    return await supabaseApi.addToCart(userPhone, productId, quantity);
  }

  async updateCartQuantity(userPhone: string, productId: number, quantity: number): Promise<void> {
    return await supabaseApi.updateCartQuantity(userPhone, productId, quantity);
  }

  async removeFromCart(userPhone: string, productId: number): Promise<void> {
    return await supabaseApi.removeFromCart(userPhone, productId);
  }

  async clearCart(userPhone: string): Promise<void> {
    return await supabaseApi.clearCart(userPhone);
  }

  // Products
  async getProducts(): Promise<Product[]> {
    return await supabaseApi.getProducts();
  }

  async updateProduct(id: number, updates: Partial<Product>): Promise<Product> {
    return await supabaseApi.updateProduct(id, updates);
  }
}

export const dataRepository = new DataRepository();