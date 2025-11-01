// Customer Order Service - Direct Supabase connection
import { supabase } from './directSupabase';

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
    if (!this.currentUserPhone) return [];
    
    try {
      const { supabaseApi } = await import('@/lib/supabase');
      const allOrders = await supabaseApi.getOrders();
      
      // Filter orders for current user
      const userOrders = allOrders.filter((order: any) => 
        order.customer_phone === this.currentUserPhone
      );
      
      console.log('📦 Found orders for user:', userOrders.length);
      return userOrders;
    } catch (error) {
      console.error('Failed to fetch customer orders:', error);
      return [];
    }
  }

  async getOrderById(orderId: string): Promise<CustomerOrder | null> {
    try {
      if (!supabase) return null;
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('order_id', orderId)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to get order by ID:', error);
      return null;
    }
  }

  subscribeToOrderUpdates(callback: (orders: CustomerOrder[]) => void) {
    if (!supabase) return () => {};
    
    const subscription = supabase
      .channel('customer-orders')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          this.getMyOrders().then(callback);
        }
      )
      .subscribe();

    return () => subscription.unsubscribe();
  }
}

export const customerOrderService = new CustomerOrderService();