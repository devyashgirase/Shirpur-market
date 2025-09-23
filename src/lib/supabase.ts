import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : null;

// Supabase API functions
export const supabaseApi = {
  async getProducts() {
    if (!supabase) return [];
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .gt('stock_quantity', 0);
    return data?.map(p => ({
      id: p.id,
      name: p.name,
      description: p.description,
      price: parseFloat(p.price),
      imageUrl: p.image_url,
      category: p.category,
      stockQuantity: p.stock_quantity,
      isActive: p.is_active
    })) || [];
  },

  async createOrder(order: any) {
    if (!supabase) return null;
    const orderId = `ORD_${Date.now()}`;
    const { data } = await supabase
      .from('orders')
      .insert({
        order_id: orderId,
        customer_name: order.customerName,
        customer_phone: order.customerPhone,
        delivery_address: order.deliveryAddress,
        total: order.total,
        status: order.status,
        payment_status: order.paymentStatus
      })
      .select()
      .single();
    
    if (data && order.items) {
      await supabase.from('order_items').insert(
        order.items.map((item: any) => ({
          order_id: data.id,
          product_id: item.productId,
          product_name: item.productName,
          price: item.price,
          quantity: item.quantity,
          total: item.price * item.quantity
        }))
      );
    }
    return data;
  },

  async getOrders() {
    if (!supabase) return [];
    const { data } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false });
    return data?.map(o => ({
      id: o.id,
      orderId: o.order_id,
      customerName: o.customer_name,
      customerPhone: o.customer_phone,
      deliveryAddress: o.delivery_address,
      total: o.total,
      status: o.status,
      paymentStatus: o.payment_status,
      items: o.order_items,
      createdAt: o.created_at
    })) || [];
  },

  async updateOrderStatus(id: number, status: string) {
    if (!supabase) return false;
    const { error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);
    return !error;
  },

  async getCategories() {
    if (!supabase) return [];
    const { data } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true);
    return data || [];
  },

  async createCustomer(customer: any) {
    if (!supabase) return null;
    const { data } = await supabase
      .from('customers')
      .insert(customer)
      .select()
      .single();
    return data;
  }
};