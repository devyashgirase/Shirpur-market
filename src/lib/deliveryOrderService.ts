import { supabase } from './supabase';

export interface DeliveryOrder {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  items: any[];
  total_amount: number;
  status: string;
  created_at: string;
}

export class DeliveryOrderService {
  // Get orders assigned for delivery (status = 'out_for_delivery')
  static async getDeliveryOrders(): Promise<DeliveryOrder[]> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('status', 'out_for_delivery')
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
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: 'delivered',
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