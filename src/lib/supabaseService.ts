import { supabase } from './supabase';

export const isSupabaseEnabled = () => true;

export class SupabaseService {
  static async getProducts() {
    const { data, error } = await supabase.from('products').select('*');
    if (error) throw error;
    return data || [];
  }

  static async addProduct(product) {
    const { data, error } = await supabase.from('products').insert(product).select().single();
    if (error) throw error;
    return data;
  }

  static async updateProduct(id, updates) {
    const { data, error } = await supabase.from('products').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }

  static async deleteProduct(id) {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
  }

  static async getOrders() {
    const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  static async createOrder(order) {
    const { data, error } = await supabase.from('orders').insert(order).select().single();
    if (error) throw error;
    return data;
  }

  static async updateOrderStatus(orderId, status) {
    const { data, error } = await supabase.from('orders').update({ status }).eq('order_id', orderId).select().single();
    if (error) throw error;
    return data;
  }

  static async getDeliveryAgents() {
    const { data, error } = await supabase.from('delivery_agents').select('*');
    if (error) throw error;
    return data || [];
  }

  static async updateAgentLocation(phone, latitude, longitude) {
    const { error } = await supabase.from('delivery_agents').update({
      current_lat: latitude,
      current_lng: longitude
    }).eq('phone', phone);
    if (error) throw error;
  }

  static subscribeToOrders(callback) {
    return supabase
      .channel('orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, callback)
      .subscribe();
  }

  static subscribeToProducts(callback) {
    return supabase
      .channel('products')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, callback)
      .subscribe();
  }
}