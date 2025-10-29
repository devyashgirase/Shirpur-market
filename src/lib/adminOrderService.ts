import { supabase } from './supabase';

export interface AdminOrder {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  items: any[];
  total_amount: number;
  status: 'placed' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'failed';
  payment_id?: string;
  created_at: string;
  updated_at: string;
}

export class AdminOrderService {
  // Get all orders for admin
  static async getAllOrders(): Promise<AdminOrder[]> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching admin orders:', error);
      return [];
    }
  }

  // Update order status
  static async updateOrderStatus(orderId: string, status: AdminOrder['status']): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating order status:', error);
      return false;
    }
  }

  // Subscribe to real-time order updates
  static subscribeToOrderUpdates(callback: (orders: AdminOrder[]) => void) {
    const subscription = supabase
      .channel('admin-orders')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          // Refetch all orders when any change occurs
          this.getAllOrders().then(callback);
        }
      )
      .subscribe();

    return subscription;
  }

  // Update order status and notify customer tracking
  static async updateOrderStatusWithNotification(orderId: string, status: AdminOrder['status']): Promise<boolean> {
    const success = await this.updateOrderStatus(orderId, status);
    if (success) {
      // Trigger real-time update for customer tracking
      window.dispatchEvent(new CustomEvent('orderStatusUpdated', {
        detail: { orderId, status }
      }));
    }
    return success;
  }

  // Get order statistics
  static async getOrderStats() {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('status, total_amount');

      if (error) throw error;

      const stats = {
        total: data.length,
        placed: data.filter(o => o.status === 'placed').length,
        confirmed: data.filter(o => o.status === 'confirmed').length,
        preparing: data.filter(o => o.status === 'preparing').length,
        out_for_delivery: data.filter(o => o.status === 'out_for_delivery').length,
        delivered: data.filter(o => o.status === 'delivered').length,
        cancelled: data.filter(o => o.status === 'cancelled').length,
        totalRevenue: data.reduce((sum, o) => sum + (o.total_amount || 0), 0)
      };

      return stats;
    } catch (error) {
      console.error('Error fetching order stats:', error);
      return null;
    }
  }
}