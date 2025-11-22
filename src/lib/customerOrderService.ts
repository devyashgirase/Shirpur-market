// Customer Order Service - Direct Supabase connection
import { supabaseApi } from './supabase';

export interface CustomerOrder {
  id: string;
  order_id: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  items: any[];
  total_amount: number;
  order_status: string;
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
    try {
      const { CustomerDataService } = await import('@/lib/customerDataService');
      const orders = await CustomerDataService.getCustomerOrders();
      console.log('📦 Found orders for user:', orders.length);
      return orders.map((order: any) => ({
        id: order.id,
        order_id: order.orderId || order.id,
        customer_name: order.customerName,
        customer_phone: order.customerPhone,
        customer_address: order.deliveryAddress,
        items: order.items,
        total_amount: order.total,
        order_status: order.status,
        payment_status: order.paymentStatus,
        created_at: order.createdAt
      }));
    } catch (error) {
      console.error('Failed to fetch customer orders:', error);
      return [];
    }
  }

  async getOrderById(orderId: string): Promise<CustomerOrder | null> {
    try {
      const allOrders = await supabaseApi.getOrders();
      const order = allOrders.find((o: any) => o.id === orderId || o.order_id === orderId);
      return order || null;
    } catch (error) {
      console.error('Failed to get order by ID:', error);
      return null;
    }
  }

  subscribeToOrderUpdates(callback: (orders: CustomerOrder[]) => void) {
    // Polling-based updates since we're using REST API
    const interval = setInterval(() => {
      this.getMyOrders().then(callback);
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }
}

export const customerOrderService = new CustomerOrderService();