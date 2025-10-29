// Customer Order Service - Supabase only, no localStorage
import { supabaseApi } from './supabase';

export interface CustomerOrder {
  id: number;
  order_id: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  delivery_address: string;
  items: string;
  total: number;
  total_amount: number;
  status: string;
  payment_status: string;
  created_at: string;
  delivery_agent_id?: string;
  delivery_latitude?: number;
  delivery_longitude?: number;
}

class CustomerOrderService {
  private currentUserPhone: string | null = null;

  setCurrentUser(phone: string) {
    if (!phone) {
      throw new Error('Customer phone is required');
    }
    this.currentUserPhone = phone;
    console.log('📱 Customer phone set:', phone);
  }

  async getMyOrders(): Promise<CustomerOrder[]> {
    if (!this.currentUserPhone) return [];
    
    try {
      const orders = await supabaseApi.getOrders();
      return orders.filter(order => 
        order.customer_phone === this.currentUserPhone
      ).sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    } catch (error) {
      console.error('Failed to fetch customer orders:', error);
      return [];
    }
  }

  async createOrder(orderData: {
    customer_name: string;
    customer_phone: string;
    customer_address: string;
    items: any[];
    total_amount: number;
    payment_id?: string;
  }): Promise<string> {
    if (!orderData.customer_phone) {
      throw new Error('Customer phone is required for order');
    }
    if (!orderData.items || orderData.items.length === 0) {
      throw new Error('Order must have items');
    }
    const orderId = `ORD-${Date.now()}`;
    
    const order = {
      order_id: orderId,
      customer_name: orderData.customer_name,
      customer_phone: orderData.customer_phone,
      customer_address: orderData.customer_address,
      delivery_address: orderData.customer_address,
      items: JSON.stringify(orderData.items),
      total: orderData.total_amount,
      total_amount: orderData.total_amount,
      status: 'confirmed',
      payment_status: 'paid',
      payment_id: orderData.payment_id || `pay_${Date.now()}`,
      created_at: new Date().toISOString()
    };

    try {
      const result = await supabaseApi.createOrder(order);
      console.log('✅ Order saved to Supabase database:', orderId);
      console.log('📊 Order details:', {
        orderId,
        customer: orderData.customer_name,
        phone: orderData.customer_phone,
        items: orderData.items.length,
        total: orderData.total_amount
      });
      return orderId;
    } catch (error) {
      console.error('❌ CRITICAL: Failed to save order to Supabase:', error);
      throw new Error(`Database save failed: ${error.message}`);
    }
    
    return orderId;
  }

  async getOrderById(orderId: string): Promise<CustomerOrder | null> {
    try {
      const orders = await supabaseApi.getOrders();
      return orders.find(order => order.order_id === orderId) || null;
    } catch (error) {
      console.error('Failed to fetch order:', error);
      return null;
    }
  }

  subscribeToOrderUpdates(callback: (orders: CustomerOrder[]) => void) {
    // Simple polling for real-time updates
    const interval = setInterval(async () => {
      const orders = await this.getMyOrders();
      callback(orders);
    }, 5000);

    return () => clearInterval(interval);
  }
}

export const customerOrderService = new CustomerOrderService();