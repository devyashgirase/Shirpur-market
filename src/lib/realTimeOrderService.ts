// Real-time Order Tracking Service
import { supabase } from './supabase';

class RealTimeOrderService {
  private static instance: RealTimeOrderService;
  private subscribers: Map<string, Function[]> = new Map();
  private orderSubscription: any = null;

  static getInstance(): RealTimeOrderService {
    if (!RealTimeOrderService.instance) {
      RealTimeOrderService.instance = new RealTimeOrderService();
    }
    return RealTimeOrderService.instance;
  }

  // Subscribe to real-time order updates
  subscribeToOrders() {
    if (!supabase) {
      console.warn('⚠️ Supabase not available for real-time subscriptions');
      return;
    }

    console.log('🔔 Setting up real-time order subscriptions...');

    // Subscribe to order table changes
    this.orderSubscription = supabase
      .channel('orders')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'orders' 
        }, 
        (payload) => {
          console.log('🆕 New order created:', payload.new);
          this.notifySubscribers('newOrder', payload.new);
          
          // Broadcast to admin dashboard
          window.dispatchEvent(new CustomEvent('realTimeNewOrder', {
            detail: payload.new
          }));
        }
      )
      .on('postgres_changes', 
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'orders' 
        }, 
        (payload) => {
          console.log('🔄 Order updated:', payload.new);
          this.notifySubscribers('orderUpdate', payload.new);
          
          // Broadcast to tracking system
          window.dispatchEvent(new CustomEvent('realTimeOrderUpdate', {
            detail: payload.new
          }));
        }
      )
      .subscribe();

    console.log('✅ Real-time order subscriptions active');
  }

  // Unsubscribe from real-time updates
  unsubscribeFromOrders() {
    if (this.orderSubscription) {
      supabase?.removeChannel(this.orderSubscription);
      this.orderSubscription = null;
      console.log('🔕 Real-time order subscriptions stopped');
    }
  }

  // Subscribe to specific events
  subscribe(event: string, callback: Function) {
    if (!this.subscribers.has(event)) {
      this.subscribers.set(event, []);
    }
    this.subscribers.get(event)!.push(callback);
  }

  // Unsubscribe from events
  unsubscribe(event: string, callback: Function) {
    const callbacks = this.subscribers.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  // Notify all subscribers
  private notifySubscribers(event: string, data: any) {
    const callbacks = this.subscribers.get(event) || [];
    callbacks.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Error in subscriber callback:', error);
      }
    });
  }

  // Manual order status update with real-time broadcast
  async updateOrderStatus(orderId: string, newStatus: string) {
    if (!supabase) return false;

    try {
      const { data, error } = await supabase
        .from('orders')
        .update({ 
          order_status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('order_id', orderId)
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating order status:', error);
        return false;
      }

      console.log('✅ Order status updated:', orderId, '→', newStatus);
      
      // Broadcast immediate update
      window.dispatchEvent(new CustomEvent('orderStatusChanged', {
        detail: {
          orderId,
          newStatus,
          orderData: data
        }
      }));

      return true;
    } catch (error) {
      console.error('❌ Exception updating order status:', error);
      return false;
    }
  }

  // Get live order count for admin dashboard
  async getLiveOrderStats() {
    if (!supabase) return null;

    try {
      const { data, error } = await supabase
        .from('orders')
        .select('order_status, payment_status, created_at')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if (error) {
        console.error('❌ Error fetching live stats:', error);
        return null;
      }

      const stats = {
        total: data.length,
        pending: data.filter(o => o.order_status === 'pending').length,
        confirmed: data.filter(o => o.order_status === 'confirmed').length,
        outForDelivery: data.filter(o => o.order_status === 'out_for_delivery').length,
        delivered: data.filter(o => o.order_status === 'delivered').length,
        paidOrders: data.filter(o => o.payment_status === 'paid').length
      };

      return stats;
    } catch (error) {
      console.error('❌ Exception fetching live stats:', error);
      return null;
    }
  }
}

export const realTimeOrderService = RealTimeOrderService.getInstance();

// Auto-start real-time subscriptions
if (typeof window !== 'undefined') {
  // Start subscriptions when service is imported
  setTimeout(() => {
    realTimeOrderService.subscribeToOrders();
  }, 1000);
}