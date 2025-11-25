import { supabaseApi } from './supabase';

export interface ApiProduct {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  stockQuantity: number;
  isActive: boolean;
}

export class CustomerDataService {
  // Get customer orders from Supabase or return empty
  static async getCustomerOrders() {
    try {
      // Get customer phone from current user session or localStorage
      const { authService } = await import('./authService');
      const currentUser = authService.getCurrentUser();
      const customerPhone = currentUser?.phone || localStorage.getItem('customerPhone');
      
      if (!customerPhone || customerPhone === 'guest') return [];
      
      const allOrders = await supabaseApi.getOrders();
      return allOrders
        .filter(order => order.customer_phone === customerPhone)
        .map(order => ({
          id: order.id,
          orderId: order.id,
          status: order.order_status || order.status || 'confirmed',
          total: order.total_amount,
          items: typeof order.items === 'string' ? JSON.parse(order.items || '[]') : (order.items || []),
          createdAt: order.created_at,
          deliveryAddress: order.delivery_address,
          customerName: order.customer_name,
          customerPhone: order.customer_phone,
          paymentStatus: order.payment_status || 'completed'
        }));
    } catch (error) {
      console.error('Supabase connection failed:', error);
      return []; // Return empty array if Supabase fails
    }
  }

  // Get products from Supabase database
  static async getAvailableProducts(): Promise<ApiProduct[]> {
    const products = await supabaseApi.getProducts();
    console.log('📦 CustomerDataService: Products loaded:', products?.length || 0);
    
    if (!products || products.length === 0) {
      return [];
    }
    
    return products.map(p => ({
      id: p.id,
      name: p.name,
      description: p.description || '',
      price: Number(p.price || 0),
      imageUrl: p.image_url || '/placeholder.svg',
      category: p.category,
      stockQuantity: Number(p.stock_quantity || 0),
      isActive: Boolean(p.is_available)
    }));
  }

  // Search products
  static async searchProducts(query: string): Promise<ApiProduct[]> {
    const products = await this.getAvailableProducts();
    return products.filter(product => 
      String(product.name || '').toLowerCase().includes(query.toLowerCase()) ||
      String(product.description || '').toLowerCase().includes(query.toLowerCase()) ||
      String(product.category || '').toLowerCase().includes(query.toLowerCase())
    );
  }

  // Get products by category
  static async getProductsByCategory(categoryId: string): Promise<ApiProduct[]> {
    const products = await this.getAvailableProducts();
    return products.filter(product => 
      String(product.category || '').toLowerCase().replace(/\s+/g, '-') === categoryId
    );
  }

  // Create order in Supabase
  static async createOrder(orderData: any) {
    try {
      const order = {
        customer_name: orderData.customerAddress.name,
        customer_phone: orderData.customerAddress.phone,
        customer_address: orderData.customerAddress.address,
        total_amount: orderData.total,
        order_status: orderData.status || 'confirmed',
        payment_status: orderData.paymentStatus || 'paid',
        items: JSON.stringify(orderData.items)
      };

      return await supabaseApi.createOrder(order);
    } catch (error) {
      console.error('Failed to create order:', error);
      return null;
    }
  }

  // Save customer profile
  static async saveCustomerProfile(customerData: any) {
    try {
      const customer = await supabaseApi.createCustomer(customerData);
      return customer;
    } catch (error) {
      console.error('Failed to save customer profile:', error);
      return null;
    }
  }

}