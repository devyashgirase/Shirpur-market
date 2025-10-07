import { supabase } from './supabase';

export class CustomerDataService {
  // Get products for customer catalog
  static async getProducts() {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('isActive', true)
      .gt('stockQuantity', 0);
    
    if (error) throw error;
    return data || [];
  }

  // Get categories for filtering
  static async getCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('isActive', true);
    
    if (error) throw error;
    return data || [];
  }

  // Create customer order
  static async createOrder(orderData) {
    const orderId = `ORD-${Date.now()}`;
    
    // Insert order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_id: orderId,
        customer_name: orderData.customerName,
        customer_phone: orderData.customerPhone,
        delivery_address: orderData.deliveryAddress,
        total: orderData.total,
        status: 'pending',
        payment_status: 'pending'
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Insert order items
    const orderItems = orderData.items.map(item => ({
      order_id: order.id,
      product_id: item.productId,
      product_name: item.productName,
      price: item.price,
      quantity: item.quantity
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;

    // Update product stock
    for (const item of orderData.items) {
      await supabase.rpc('update_product_stock', {
        product_id: item.productId,
        quantity_used: item.quantity
      });
    }

    return order;
  }

  // Get customer orders
  static async getCustomerOrders(customerPhone) {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .eq('customer_phone', customerPhone)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Track order status
  static async trackOrder(orderId) {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .eq('order_id', orderId)
      .single();

    if (error) throw error;
    return data;
  }

  // Submit feedback
  static async submitFeedback(feedbackData) {
    const { data, error } = await supabase
      .from('feedback')
      .insert(feedbackData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}