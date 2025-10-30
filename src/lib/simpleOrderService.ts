import { orderService } from './supabaseRest';

export interface SimpleOrder {
  id: string;
  order_id: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  items: any[];
  total_amount: number;
  status: string;
  payment_status: string;
  created_at: string;
}

class SimpleOrderService {
  async createOrder(orderData: any): Promise<string> {
    try {
      console.log('📦 Creating order with Supabase REST:', orderData);
      
      const result = await orderService.createOrder(orderData);
      
      console.log('✅ Order saved successfully');
      
      // Trigger events for real-time updates
      window.dispatchEvent(new CustomEvent('orderCreated', { 
        detail: { orderId: orderData.order_id, status: 'confirmed' } 
      }));
      window.dispatchEvent(new CustomEvent('ordersUpdated'));
      
      return orderData.order_id;
    } catch (error) {
      console.error('❌ Order creation failed:', error);
      throw error;
    }
  }

  async getCustomerOrders(customerPhone: string): Promise<SimpleOrder[]> {
    try {
      const orders = await orderService.getOrders();
      return orders.filter((order: any) => order.customer_phone === customerPhone);
    } catch (error) {
      console.error('Error fetching orders:', error);
      return [];
    }
  }
}

export const simpleOrderService = new SimpleOrderService();