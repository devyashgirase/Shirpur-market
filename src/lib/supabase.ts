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
      .order('created_at', { ascending: false });
    return data?.map(p => ({
      id: p.id,
      name: p.name,
      description: p.description,
      price: parseFloat(p.price),
      imageUrl: p.image,
      category: p.category,
      stockQuantity: p.stock_quantity,
      isActive: p.is_active
    })) || [];
  },

  async createProduct(product: any) {
    if (!supabase) return null;
    const { data } = await supabase
      .from('products')
      .insert({
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        image: product.imageUrl,
        stock_quantity: product.stockQuantity,
        is_active: product.isActive
      })
      .select()
      .single();
    return data ? {
      id: data.id,
      name: data.name,
      description: data.description,
      price: parseFloat(data.price),
      imageUrl: data.image,
      category: data.category,
      stockQuantity: data.stock_quantity,
      isActive: data.is_active
    } : null;
  },

  async updateProduct(id: number, product: any) {
    if (!supabase) return null;
    const updateData: any = {};
    if (product.name) updateData.name = product.name;
    if (product.description) updateData.description = product.description;
    if (product.price) updateData.price = product.price;
    if (product.category) updateData.category = product.category;
    if (product.imageUrl) updateData.image = product.imageUrl;
    if (product.stockQuantity !== undefined) updateData.stock_quantity = product.stockQuantity;
    if (product.isActive !== undefined) updateData.is_active = product.isActive;
    
    const { data } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    return data ? {
      id: data.id,
      name: data.name,
      description: data.description,
      price: parseFloat(data.price),
      imageUrl: data.image,
      category: data.category,
      stockQuantity: data.stock_quantity,
      isActive: data.is_active
    } : null;
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
          quantity: item.quantity
        }))
      );
    }
    return data ? {
      id: data.id,
      orderId: data.order_id,
      customerName: data.customer_name,
      customerPhone: data.customer_phone,
      deliveryAddress: data.delivery_address,
      total: data.total,
      status: data.status,
      paymentStatus: data.payment_status,
      items: order.items,
      createdAt: data.created_at
    } : null;
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
    const categories = [
      { id: 1, name: 'Grains', slug: 'grains', isActive: true },
      { id: 2, name: 'Pulses', slug: 'pulses', isActive: true },
      { id: 3, name: 'Oil', slug: 'oil', isActive: true },
      { id: 4, name: 'Sweeteners', slug: 'sweeteners', isActive: true },
      { id: 5, name: 'Beverages', slug: 'beverages', isActive: true },
      { id: 6, name: 'Dairy', slug: 'dairy', isActive: true },
      { id: 7, name: 'Vegetables', slug: 'vegetables', isActive: true },
      { id: 8, name: 'Fruits', slug: 'fruits', isActive: true },
      { id: 9, name: 'Bakery', slug: 'bakery', isActive: true },
      { id: 10, name: 'Snacks', slug: 'snacks', isActive: true },
      { id: 11, name: 'Instant Food', slug: 'instant-food', isActive: true }
    ];
    return categories;
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