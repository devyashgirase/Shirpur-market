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

  static async getCart(userPhone) {
    const { data, error } = await supabase.from('cart_items').select('*, products(*)').eq('user_phone', userPhone);
    if (error) throw error;
    return (data || []).map(item => ({
      id: item.id,
      product: {
        id: item.product_id.toString(),
        name: item.products.name,
        price: item.products.price,
        image_url: item.products.imageUrl || '/placeholder.svg',
        stock_qty: item.products.stockQuantity
      },
      quantity: item.quantity
    }));
  }

  static async addToCart(userPhone, productId, quantity) {
    const { data: existing } = await supabase.from('cart_items').select('*').eq('user_phone', userPhone).eq('product_id', productId).single();
    
    if (existing) {
      const { error } = await supabase.from('cart_items').update({ quantity: existing.quantity + quantity }).eq('id', existing.id);
      if (error) throw error;
    } else {
      const { error } = await supabase.from('cart_items').insert({ user_phone: userPhone, product_id: parseInt(productId), quantity });
      if (error) throw error;
    }
  }

  static async updateCartQuantity(userPhone, productId, quantity) {
    const { error } = await supabase.from('cart_items').update({ quantity }).eq('user_phone', userPhone).eq('product_id', productId);
    if (error) throw error;
  }

  static async removeFromCart(userPhone, productId) {
    const { error } = await supabase.from('cart_items').delete().eq('user_phone', userPhone).eq('product_id', productId);
    if (error) throw error;
  }

  static async clearCart(userPhone) {
    const { error } = await supabase.from('cart_items').delete().eq('user_phone', userPhone);
    if (error) throw error;
  }
}