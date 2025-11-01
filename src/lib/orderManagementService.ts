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
      console.log('🔄 Marking order ready for delivery:', orderId);
      
      const { data, error } = await supabase
        .from('orders')
        .update({ 
          status: 'ready_for_delivery',
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .select();

      if (error) {
        console.error('❌ Supabase error:', error);
        throw error;
      }
      
      if (!data || data.length === 0) {
        console.error('❌ No order found with ID:', orderId);
        return { success: false, error: 'Order not found' };
      }

      console.log('✅ Order updated successfully:', data[0]);
      
      // Notify all active delivery agents
      await this.notifyDeliveryAgents(data[0]);
      
      return { success: true, order: data[0] };
    } catch (error) {
      console.error('❌ Error marking order ready:', error);
      return { success: false, error: error.message };
    }
  }

  // Admin marks order as out for delivery (directly assigns to delivery agents)
  async markOrderOutForDelivery(orderId: string) {
    try {
      console.log('🔄 Admin marking order out for delivery:', orderId);
      
      const { data, error } = await supabase
        .from('orders')
        .update({ 
          status: 'out_for_delivery',
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .select();

      if (error) {
        console.error('❌ Supabase error:', error);
        throw error;
      }
      
      if (!data || data.length === 0) {
        console.error('❌ No order found with ID:', orderId);
        return { success: false, error: 'Order not found' };
      }

      console.log('✅ Order marked out for delivery:', data[0]);
      
      // Notify delivery agents about new out for delivery order
      await this.notifyDeliveryAgentsOutForDelivery(data[0]);
      
      return { success: true, order: data[0] };
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

  // Get orders marked as "out for delivery" by admin (for delivery agents to see)
  async getOrdersOutForDelivery() {
    try {
      console.log('🔍 Fetching orders marked as out for delivery by admin...');
      
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('status', 'out_for_delivery')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('❌ Supabase error fetching out for delivery orders:', error);
        throw error;
      }
      
      console.log('📦 Found out for delivery orders:', data?.length || 0);
      console.log('📋 Orders data:', data);
      
      return { success: true, orders: data || [] };
    } catch (error) {
      console.error('❌ Error fetching out for delivery orders:', error);
      return { success: false, orders: [] };
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

  // Notify delivery agents about orders marked as out for delivery by admin
  private async notifyDeliveryAgentsOutForDelivery(order: Order) {
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
              title: 'Order Out for Delivery',
              message: `Admin marked Order #${order.id.slice(-6)} as out for delivery - ₹${order.total_amount}`,
              type: 'out_for_delivery',
              data: JSON.stringify({ orderId: order.id }),
              created_at: new Date().toISOString()
            }))
          );
      }
      
      // Also trigger custom event for immediate UI updates
      window.dispatchEvent(new CustomEvent('orderOutForDelivery', {
        detail: { order }
      }));
    } catch (error) {
      console.error('Error notifying agents about out for delivery:', error);
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