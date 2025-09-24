import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Initialize Supabase client
export const supabase = supabaseUrl && supabaseKey && supabaseKey !== 'YOUR_NEW_API_KEY_HERE'
  ? createClient(supabaseUrl, supabaseKey)
  : null;

// Log connection status
if (supabase) {
  console.log('✅ Supabase client initialized successfully');
} else {
  console.warn('⚠️ Supabase client not initialized. Check environment variables.');
  console.log('VITE_SUPABASE_URL:', supabaseUrl ? 'Present' : 'Missing');
  console.log('VITE_SUPABASE_ANON_KEY:', supabaseKey && supabaseKey !== 'YOUR_NEW_API_KEY_HERE' ? 'Present' : 'Missing/Placeholder');
}

// Check database tables and data
export const inspectDatabase = async () => {
  if (!supabase) {
    console.error('Supabase not initialized');
    return;
  }
  
  try {
    // Check if products table exists and has data
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .limit(5);
    
    console.log('Products table check:', { products, productsError });
    
    // Check table structure
    const { data: tableInfo, error: tableError } = await supabase
      .rpc('get_table_info', { table_name: 'products' })
      .single();
    
    console.log('Table info:', { tableInfo, tableError });
    
  } catch (err) {
    console.error('Database inspection failed:', err);
  }
};

// Test connection
export const testConnection = async () => {
  if (!supabase) {
    console.error('Supabase not initialized. Check environment variables:');
    console.error('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
    console.error('VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Present' : 'Missing');
    return false;
  }
  try {
    const { data, error } = await supabase.from('products').select('count').limit(1);
    if (error) {
      console.error('Supabase connection error:', error);
      return false;
    }
    console.log('Supabase connected successfully');
    return true;
  } catch (err) {
    console.error('Connection test failed:', err);
    return false;
  }
};

// Supabase API functions
export const supabaseApi = {
  async getProducts() {
    if (!supabase) {
      console.error('Supabase not initialized');
      return [];
    }
    try {
      console.log('Fetching products from Supabase...');
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      
      console.log('Supabase response:', { data, error });
      
      if (error) {
        console.error('Error fetching products:', error);
        return [];
      }
      
      if (!data || data.length === 0) {
        console.log('No products found in database');
        return [];
      }
      
      console.log(`Found ${data.length} products`);
      const mappedProducts = data.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        price: parseFloat(p.price),
        imageUrl: p.image_url,
        category: p.category,
        stockQuantity: p.stock_quantity,
        isActive: p.is_active
      }));
      
      console.log('Mapped products:', mappedProducts);
      return mappedProducts;
    } catch (err) {
      console.error('Exception in getProducts:', err);
      return [];
    }
  },

  async createProduct(product: any) {
    if (!supabase) {
      console.error('Supabase not initialized');
      return null;
    }
    try {
      const { data, error } = await supabase
        .from('products')
        .insert({
          name: product.name,
          description: product.description,
          price: product.price,
          category: product.category,
          image_url: product.imageUrl,
          stock_quantity: product.stockQuantity,
          is_active: product.isActive
        })
        .select()
        .single();
      if (error) {
        console.error('Error creating product:', error);
        return null;
      }
      return data ? {
        id: data.id,
        name: data.name,
        description: data.description,
        price: parseFloat(data.price),
        imageUrl: data.image_url,
        category: data.category,
        stockQuantity: data.stock_quantity,
        isActive: data.is_active
      } : null;
    } catch (err) {
      console.error('Exception in createProduct:', err);
      return null;
    }
  },

  async updateProduct(id: number, product: any) {
    if (!supabase) return null;
    const updateData: any = {};
    if (product.name) updateData.name = product.name;
    if (product.description) updateData.description = product.description;
    if (product.price) updateData.price = product.price;
    if (product.category) updateData.category = product.category;
    if (product.imageUrl) updateData.image_url = product.imageUrl;
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
      imageUrl: data.image_url,
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