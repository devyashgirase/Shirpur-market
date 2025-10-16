import { supabase } from './supabase';

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
      const { data, error } = await supabase
        .from('orders')
        .update({ 
          status: 'ready_for_delivery',
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .select();

      if (error) throw error;

      // Notify all active delivery agents
      await this.notifyDeliveryAgents(data[0]);
      
      return { success: true, order: data[0] };
    } catch (error) {
      console.error('Error marking order ready:', error);
      return { success: false, error };
    }
  }

  // Get orders ready for delivery (for delivery agents)
  async getOrdersReadyForDelivery() {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('status', 'ready_for_delivery')
        .is('delivery_agent_id', null)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return { success: true, orders: data || [] };
    } catch (error) {
      console.error('Error fetching ready orders:', error);
      return { success: false, orders: [] };
    }
  }

  // Delivery agent accepts order
  async acceptOrder(orderId: string, agentId: string, agentName: string) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({
          status: 'out_for_delivery',
          delivery_agent_id: agentId,
          delivery_agent_name: agentName,
          accepted_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .eq('status', 'ready_for_delivery') // Ensure order is still available
        .select();

      if (error) throw error;
      
      if (!data || data.length === 0) {
        return { success: false, error: 'Order no longer available' };
      }

      // Update tracking system
      await this.updateOrderTracking(orderId, agentId, 'accepted');
      
      return { success: true, order: data[0] };
    } catch (error) {
      console.error('Error accepting order:', error);
      return { success: false, error };
    }
  }

  // Delivery agent rejects order
  async rejectOrder(orderId: string, agentId: string, reason?: string) {
    try {
      // Log rejection for analytics
      await supabase
        .from('order_rejections')
        .insert({
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

  // Get delivery agent's active orders
  async getAgentOrders(agentId: string) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('delivery_agent_id', agentId)
        .in('status', ['out_for_delivery'])
        .order('accepted_at', { ascending: true });

      if (error) throw error;
      return { success: true, orders: data || [] };
    } catch (error) {
      console.error('Error fetching agent orders:', error);
      return { success: false, orders: [] };
    }
  }

  // Update order status (for delivery progress)
  async updateOrderStatus(orderId: string, status: string, agentId: string, location?: { lat: number; lng: number }) {
    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString()
      };

      if (status === 'delivered') {
        updateData.delivered_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId)
        .eq('delivery_agent_id', agentId)
        .select();

      if (error) throw error;

      // Update tracking
      await this.updateOrderTracking(orderId, agentId, status, location);
      
      return { success: true, order: data[0] };
    } catch (error) {
      console.error('Error updating order status:', error);
      return { success: false, error };
    }
  }

  // Update order tracking for real-time monitoring
  private async updateOrderTracking(orderId: string, agentId: string, status: string, location?: { lat: number; lng: number }) {
    try {
      await supabase
        .from('delivery_tracking')
        .insert({
          order_id: orderId,
          agent_id: agentId,
          status,
          location: location ? JSON.stringify(location) : null,
          timestamp: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error updating tracking:', error);
    }
  }

  // Notify delivery agents about new orders
  private async notifyDeliveryAgents(order: Order) {
    try {
      // Get all active delivery agents
      const { data: agents } = await supabase
        .from('delivery_agents')
        .select('id, name, fcm_token')
        .eq('is_active', true);

      if (agents) {
        // Send real-time notification via Supabase
        await supabase
          .from('notifications')
          .insert(
            agents.map(agent => ({
              user_id: agent.id,
              user_type: 'delivery',
              title: 'New Order Available',
              message: `Order #${order.id.slice(-6)} ready for delivery - ₹${order.total_amount}`,
              type: 'new_order',
              data: JSON.stringify({ orderId: order.id }),
              created_at: new Date().toISOString()
            }))
          );
      }
      
      // Also trigger custom event for immediate UI updates
      window.dispatchEvent(new CustomEvent('newOrderReady', {
        detail: { order }
      }));
    } catch (error) {
      console.error('Error notifying agents:', error);
    }
  }

  // Get order tracking for admin/customer
  async getOrderTracking(orderId: string) {
    try {
      const { data, error } = await supabase
        .from('delivery_tracking')
        .select(`
          *,
          delivery_agents(name, phone)
        `)
        .eq('order_id', orderId)
        .order('timestamp', { ascending: true });

      if (error) throw error;
      return { success: true, tracking: data || [] };
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