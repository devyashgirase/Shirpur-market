import { supabase } from './directSupabase';

export interface AdminOrder {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  items: any[];
  total_amount: number;
  order_status: 'placed' | 'confirmed' | 'preparing' | 'ready_for_delivery' | 'out_for_delivery' | 'delivered' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'failed';
  payment_id?: string;
  created_at: string;
  updated_at: string;
}

export class AdminOrderService {
  // Get all orders for admin
  static async getAllOrders(): Promise<AdminOrder[]> {
    try {
      const { supabaseApi } = await import('@/lib/supabase');
      const orders = await supabaseApi.getOrders();
      
      console.log('📦 Loading orders from database:', orders.length);
      return orders.map((order: any) => ({
        id: order.id || order.order_id,
        customer_name: order.customer_name,
        customer_phone: order.customer_phone,
        customer_address: order.customer_address,
        items: typeof order.items === 'string' ? JSON.parse(order.items) : order.items,
        total_amount: Number(order.total_amount),
        order_status: order.order_status || 'confirmed',
        payment_status: order.payment_status || 'paid',
        payment_id: order.payment_id,
        created_at: order.created_at,
        updated_at: order.updated_at || order.created_at
      }));
    } catch (error) {
      console.error('Error fetching admin orders:', error);
      return [];
    }
  }

  // Update order status using supabaseApi
  static async updateOrderStatus(orderId: string, status: AdminOrder['order_status']): Promise<boolean> {
    try {
      console.log('🔄 Updating order:', orderId, 'to status:', status);
      
      const { supabaseApi } = await import('@/lib/supabase');
      const success = await supabaseApi.updateOrderStatus(orderId, status);
      
      if (success) {
        console.log('✅ Order status updated in database:', orderId, status);
        return true;
      } else {
        console.warn('⚠️ Failed to update order in database');
        return false;
      }
    } catch (error) {
      console.error('❌ Error updating order status:', error);
      return false;
    }
  }

  // Subscribe to real-time order updates
  static subscribeToOrderUpdates(callback: (orders: AdminOrder[]) => void) {
    // Listen for custom events
    const handleOrderUpdate = () => {
      this.getAllOrders().then(callback);
    };
    
    window.addEventListener('orderStatusUpdated', handleOrderUpdate);
    
    return {
      unsubscribe: () => {
        window.removeEventListener('orderStatusUpdated', handleOrderUpdate);
      }
    };
  }

  // Update order status and notify customer tracking
  static async updateOrderStatusWithNotification(orderId: string, status: AdminOrder['order_status']): Promise<boolean> {
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
      if (!supabase) return null;
      const { data, error } = await supabase
        .from('orders')
        .select('order_status, total_amount');

      if (error) throw error;

      const stats = {
        total: data.length,
        placed: data.filter(o => o.order_status === 'placed').length,
        confirmed: data.filter(o => o.order_status === 'confirmed').length,
        preparing: data.filter(o => o.order_status === 'preparing').length,
        out_for_delivery: data.filter(o => o.order_status === 'out_for_delivery').length,
        delivered: data.filter(o => o.order_status === 'delivered').length,
        cancelled: data.filter(o => o.order_status === 'cancelled').length,
        totalRevenue: data.reduce((sum, o) => sum + (o.total_amount || 0), 0)
      };

      return stats;
    } catch (error) {
      console.error('Error fetching order stats:', error);
      return null;
    }
  }
}