import { supabase } from './directSupabase';

export interface DeliveryOrder {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  items: any[];
  total_amount: number;
  order_status: string;
  created_at: string;
}

export class DeliveryOrderService {
  // Get orders assigned for delivery (status = 'out_for_delivery')
  static async getDeliveryOrders(): Promise<DeliveryOrder[]> {
    try {
      if (!supabase) return [];
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('order_status', 'out_for_delivery')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching delivery orders:', error);
      return [];
    }
  }

  // Mark order as delivered
  static async markAsDelivered(orderId: string): Promise<boolean> {
    try {
      if (!supabase) return false;
      const { error } = await supabase
        .from('orders')
        .update({ 
          order_status: 'delivered',
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) throw error;
      
      // Trigger real-time update
      window.dispatchEvent(new CustomEvent('orderStatusUpdated', {
        detail: { orderId, status: 'delivered' }
      }));
      
      return true;
    } catch (error) {
      console.error('Error marking order as delivered:', error);
      return false;
    }
  }

  // Subscribe to delivery order updates
  static subscribeToDeliveryOrders(callback: (orders: DeliveryOrder[]) => void) {
    if (!supabase) return { unsubscribe: () => {} };
    const subscription = supabase
      .channel('delivery-orders')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          this.getDeliveryOrders().then(callback);
        }
      )
      .subscribe();

    return subscription;
  }
}