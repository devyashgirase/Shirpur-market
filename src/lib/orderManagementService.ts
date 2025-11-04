import { supabaseRest } from './supabaseRest';

export interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  items: any[];
  total_amount: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready_for_delivery' | 'out_for_delivery' | 'delivered' | 'cancelled';
  created_at: string;
  delivery_agent_id?: string;
  delivery_agent_name?: string;
  estimated_delivery_time?: string;
  location?: { lat: number; lng: number };
}

class OrderManagementService {
  // Admin marks order as ready for delivery
  async markOrderReadyForDelivery(orderId: string) {
    try {
      console.log('🔄 Marking order ready for delivery:', orderId);
      
      const result = await supabaseRest.patch(`orders?id=eq.${orderId}`, {
        order_status: 'ready_for_delivery',
        updated_at: new Date().toISOString()
      });

      console.log('✅ Order updated successfully');
      
      return { success: true, order: { id: orderId, status: 'ready_for_delivery' } };
    } catch (error) {
      console.error('❌ Error marking order ready:', error);
      return { success: false, error: error.message };
    }
  }

  // Admin marks order as out for delivery (directly assigns to delivery agents)
  async markOrderOutForDelivery(orderId: string) {
    try {
      console.log('🔄 Admin marking order out for delivery:', orderId);
      
      const result = await supabaseRest.patch(`orders?id=eq.${orderId}`, {
        order_status: 'out_for_delivery',
        updated_at: new Date().toISOString()
      });

      console.log('✅ Order marked out for delivery');
      
      return { success: true, order: { id: orderId, status: 'out_for_delivery' } };
    } catch (error) {
      console.error('❌ Error marking order out for delivery:', error);
      return { success: false, error: error.message };
    }
  }

  // Get orders ready for delivery (for delivery agents)
  async getOrdersReadyForDelivery() {
    try {
      console.log('🔍 Fetching orders ready for delivery...');
      
      const { supabaseApi } = await import('./supabase');
      const allOrders = await supabaseApi.getOrders();
      
      // Filter orders that are ready for delivery
      const readyOrders = allOrders.filter((order: any) => 
        (order.status === 'ready_for_delivery' || order.order_status === 'ready_for_delivery') &&
        !order.delivery_agent_id
      );
      
      console.log('📦 Found ready orders:', readyOrders.length);
      console.log('📋 Orders data:', readyOrders);
      
      return { success: true, orders: readyOrders };
    } catch (error) {
      console.error('❌ Error fetching ready orders:', error);
      return { success: false, orders: [] };
    }
  }

  // Delivery agent accepts order
  async acceptOrder(orderId: string, agentId: string, agentName: string) {
    try {
      const { supabaseApi } = await import('./supabase');
      const success = await supabaseApi.updateOrderStatus(orderId, 'out_for_delivery', agentId);
      
      if (success) {
        console.log('✅ Order accepted and status updated to out_for_delivery');
        return { success: true, order: { id: orderId, status: 'out_for_delivery' } };
      } else {
        return { success: false, error: 'Failed to update order status' };
      }
    } catch (error) {
      console.error('Error accepting order:', error);
      return { success: false, error: error.message };
    }
  }

  // Delivery agent rejects order
  async rejectOrder(orderId: string, agentId: string, reason?: string) {
    try {
      // Log rejection for analytics
      await supabaseRest.post('order_rejections', {
        order_id: orderId,
        agent_id: agentId,
        reason: reason || 'No reason provided',
        rejected_at: new Date().toISOString()
      });

      return { success: true };
    } catch (error) {
      console.error('Error rejecting order:', error);
      return { success: false, error };
    }
  }

  // Get orders marked as "out for delivery" by admin (for delivery agents to see)
  async getOrdersOutForDelivery() {
    try {
      console.log('🔍 Fetching orders marked as out for delivery by admin...');
      
      const { supabaseApi } = await import('./supabase');
      const allOrders = await supabaseApi.getOrders();
      
      // Filter orders that are out for delivery
      const outForDeliveryOrders = allOrders.filter((order: any) => 
        order.order_status === 'out_for_delivery'
      );
      
      console.log('📦 Found out for delivery orders:', outForDeliveryOrders.length);
      console.log('📋 Orders data:', outForDeliveryOrders);
      
      return { success: true, orders: outForDeliveryOrders };
    } catch (error) {
      console.error('❌ Error fetching out for delivery orders:', error);
      return { success: false, orders: [] };
    }
  }

  // Get delivery agent's active orders
  async getAgentOrders(agentId: string) {
    try {
      const orders = await supabaseRest.get('orders', `delivery_agent_id=eq.${agentId}&order_status=eq.out_for_delivery&order=created_at.desc`);
      return { success: true, orders: orders || [] };
    } catch (error) {
      console.error('Error fetching agent orders:', error);
      return { success: false, orders: [] };
    }
  }

  // Update order status (for delivery progress)
  async updateOrderStatus(orderId: string, status: string, agentId: string, location?: { lat: number; lng: number }) {
    try {
      const updateData: any = {
        order_status: status,
        updated_at: new Date().toISOString()
      };

      if (status === 'delivered') {
        updateData.delivered_at = new Date().toISOString();
      }

      await supabaseRest.patch(`orders?id=eq.${orderId}&delivery_agent_id=eq.${agentId}`, updateData);
      
      return { success: true, order: { id: orderId, status } };
    } catch (error) {
      console.error('Error updating order status:', error);
      return { success: false, error };
    }
  }

  // Update order tracking for real-time monitoring (using localStorage)
  private async updateOrderTracking(orderId: string, agentId: string, status: string, location?: { lat: number; lng: number }) {
    try {
      const trackingData = {
        order_id: orderId,
        agent_id: agentId,
        status,
        location: location ? JSON.stringify(location) : null,
        timestamp: new Date().toISOString()
      };
      
      // Store in localStorage for immediate access
      const trackingHistory = JSON.parse(localStorage.getItem(`order_tracking_${orderId}`) || '[]');
      trackingHistory.push(trackingData);
      localStorage.setItem(`order_tracking_${orderId}`, JSON.stringify(trackingHistory));
    } catch (error) {
      console.error('Error updating tracking:', error);
    }
  }

  // Notify delivery agents about new orders (simplified)
  private async notifyDeliveryAgents(order: Order) {
    try {
      // Trigger custom event for immediate UI updates
      window.dispatchEvent(new CustomEvent('newOrderReady', {
        detail: { order }
      }));
    } catch (error) {
      console.error('Error notifying agents:', error);
    }
  }

  // Notify delivery agents about orders marked as out for delivery by admin (simplified)
  private async notifyDeliveryAgentsOutForDelivery(order: Order) {
    try {
      // Trigger custom event for immediate UI updates
      window.dispatchEvent(new CustomEvent('orderOutForDelivery', {
        detail: { order }
      }));
    } catch (error) {
      console.error('Error notifying agents about out for delivery:', error);
    }
  }

  // Get order tracking for admin/customer (using localStorage)
  async getOrderTracking(orderId: string) {
    try {
      const trackingHistory = JSON.parse(localStorage.getItem(`order_tracking_${orderId}`) || '[]');
      return { success: true, tracking: trackingHistory };
    } catch (error) {
      console.error('Error fetching tracking:', error);
      return { success: false, tracking: [] };
    }
  }

  // Polling-based order updates (no subscriptions)
  subscribeToOrderUpdates(callback: (payload: any) => void) {
    // Return empty subscription to avoid errors
    return {
      unsubscribe: () => {}
    };
  }

  // Real-time subscription for delivery tracking (simplified)
  subscribeToDeliveryTracking(orderId: string, callback: (payload: any) => void) {
    const handleTrackingUpdate = (event: any) => {
      if (event.detail.orderId === orderId) {
        callback({ new: event.detail.tracking });
      }
    };
    
    window.addEventListener('trackingUpdate', handleTrackingUpdate);
    
    return {
      unsubscribe: () => {
        window.removeEventListener('trackingUpdate', handleTrackingUpdate);
      }
    };
  }
}

export const orderManagementService = new OrderManagementService();