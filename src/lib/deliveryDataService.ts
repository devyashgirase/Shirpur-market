import { supabase } from './supabase';

export class DeliveryDataService {
  // Get assigned orders for delivery agent
  static async getAssignedOrders(agentPhone) {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .in('status', ['processing', 'out_for_delivery'])
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Update delivery status
  static async updateDeliveryStatus(orderId, status) {
    const { data, error } = await supabase
      .from('orders')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Update agent location
  static async updateAgentLocation(agentPhone, latitude, longitude) {
    const { data, error } = await supabase
      .from('delivery_agents')
      .update({
        current_lat: latitude,
        current_lng: longitude,
        updated_at: new Date().toISOString()
      })
      .eq('phone', agentPhone)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Get agent profile
  static async getAgentProfile(agentPhone) {
    const { data, error } = await supabase
      .from('delivery_agents')
      .select('*')
      .eq('phone', agentPhone)
      .single();

    if (error) throw error;
    return data;
  }

  // Update agent availability
  static async updateAgentAvailability(agentPhone, isAvailable) {
    const { data, error } = await supabase
      .from('delivery_agents')
      .update({
        is_available: isAvailable,
        updated_at: new Date().toISOString()
      })
      .eq('phone', agentPhone)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Get delivery statistics
  static async getDeliveryStats(agentPhone) {
    const agent = await this.getAgentProfile(agentPhone);
    
    const { data: completedOrders, error } = await supabase
      .from('orders')
      .select('*')
      .eq('status', 'delivered');

    if (error) throw error;

    const today = new Date().toDateString();
    const todayDeliveries = completedOrders.filter(order =>
      new Date(order.updated_at).toDateString() === today
    );

    return {
      totalDeliveries: agent?.total_deliveries || 0,
      todayDeliveries: todayDeliveries.length,
      rating: agent?.rating || 5.0,
      isAvailable: agent?.is_available || false
    };
  }

  // Complete delivery
  static async completeDelivery(orderId, agentPhone) {
    // Update order status
    await this.updateDeliveryStatus(orderId, 'delivered');

    // Increment agent's total deliveries
    const { error } = await supabase.rpc('increment_agent_deliveries', {
      agent_phone: agentPhone
    });

    if (error) console.warn('Failed to update agent delivery count:', error);

    return true;
  }

  // Get nearby orders (mock implementation)
  static async getNearbyOrders(latitude, longitude, radiusKm = 10) {
    // For now, return all pending orders
    // In production, you'd use PostGIS for geospatial queries
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }
}