import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Initialize Supabase client
export const supabase = supabaseUrl && supabaseKey && supabaseKey !== 'YOUR_NEW_API_KEY_HERE'
  ? createClient(supabaseUrl, supabaseKey)
  : null;

// Log connection status and setup instructions
if (supabase) {
  console.log('✅ Supabase client initialized successfully');
} else {
  console.warn('⚠️ Supabase client not initialized. Setup required:');
  console.log('📋 Setup Instructions:');
  console.log('1. Go to https://supabase.com and create a project');
  console.log('2. Copy your project URL and anon key from Settings > API');
  console.log('3. Update .env file with real values');
  console.log('4. Run the supabase-schema.sql in your Supabase SQL editor');
  console.log('VITE_SUPABASE_URL:', supabaseUrl ? '✅ Present' : '❌ Missing');
  console.log('VITE_SUPABASE_ANON_KEY:', supabaseKey && supabaseKey !== 'GET_FROM_SUPABASE_DASHBOARD_SETTINGS_API' ? '✅ Present' : '❌ Missing/Placeholder');
}

// Database verification and setup
export const verifyDatabaseTables = async () => {
  if (!supabase) {
    console.error('❌ Supabase not initialized - check environment variables');
    return false;
  }
  
  try {
    // Test products table
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('count')
      .limit(1);
    
    if (productsError) {
      console.error('❌ Products table error:', productsError);
      return false;
    }
    
    // Test orders table
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('count')
      .limit(1);
    
    if (ordersError) {
      console.error('❌ Orders table error:', ordersError);
      return false;
    }
    
    console.log('✅ All database tables verified successfully');
    return true;
  } catch (error) {
    console.error('❌ Database verification failed:', error);
    return false;
  }
};

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
    
    // Check orders table
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .limit(5);
    
    console.log('Orders table check:', { orders, ordersError });
    
  } catch (err) {
    console.error('Database inspection failed:', err);
  }
};

// Test connection and verify database setup
export const testConnection = async () => {
  if (!supabase) {
    console.error('❌ Supabase not initialized. Check environment variables:');
    console.error('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL ? '✅ Present' : '❌ Missing');
    console.error('VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY && import.meta.env.VITE_SUPABASE_ANON_KEY !== 'GET_FROM_SUPABASE_DASHBOARD_SETTINGS_API' ? '✅ Present' : '❌ Missing/Placeholder');
    return false;
  }
  
  try {
    console.log('🔍 Testing database connection...');
    const { data, error } = await supabase.from('products').select('count').limit(1);
    if (error) {
      console.error('❌ Database connection error:', error);
      return false;
    }
    
    console.log('✅ Database connected successfully');
    
    // Verify all required tables exist
    const isValid = await verifyDatabaseTables();
    if (!isValid) {
      console.error('❌ Database tables verification failed');
      return false;
    }
    
    console.log('✅ All database tables verified and ready');
    return true;
  } catch (err) {
    console.error('❌ Connection test failed:', err);
    return false;
  }
};

// Supabase API functions with real database operations
export const supabaseApi = {
  async getProducts() {
    if (!supabase) {
      console.error('❌ Supabase not initialized');
      return [];
    }
    try {
      console.log('📊 Fetching products from Supabase database...');
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('❌ Database error fetching products:', error);
        return [];
      }
      
      console.log(`✅ Retrieved ${data?.length || 0} products from database`);
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
    } catch (err) {
      console.error('❌ Exception fetching products:', err);
      return [];
    }
  },

  async createProduct(product: any) {
    if (!supabase) {
      console.error('❌ Supabase not initialized');
      return null;
    }
    try {
      console.log('💾 Inserting product into database:', product.name);
      const { data, error } = await supabase
        .from('products')
        .insert({
          name: product.name,
          description: product.description,
          price: product.price,
          category: product.category,
          image_url: product.imageUrl,
          stock_quantity: product.stockQuantity,
          is_active: product.isActive,
          sku: `SKU_${Date.now()}`,
          unit: 'kg'
        })
        .select()
        .single();
        
      if (error) {
        console.error('❌ Database error creating product:', error);
        return null;
      }
      
      console.log('✅ Product created in database with ID:', data.id);
      return {
        id: data.id,
        name: data.name,
        description: data.description,
        price: parseFloat(data.price),
        imageUrl: data.image_url,
        category: data.category,
        stockQuantity: data.stock_quantity,
        isActive: data.is_active
      };
    } catch (err) {
      console.error('❌ Exception creating product:', err);
      return null;
    }
  },

  async updateProduct(id: number, product: any) {
    if (!supabase) return null;
    try {
      console.log('🔄 Updating product in database:', id);
      const updateData: any = { updated_at: new Date().toISOString() };
      if (product.name) updateData.name = product.name;
      if (product.description) updateData.description = product.description;
      if (product.price) updateData.price = product.price;
      if (product.category) updateData.category = product.category;
      if (product.imageUrl) updateData.image_url = product.imageUrl;
      if (product.stockQuantity !== undefined) updateData.stock_quantity = product.stockQuantity;
      if (product.isActive !== undefined) updateData.is_active = product.isActive;
      
      const { data, error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
        
      if (error) {
        console.error('❌ Database error updating product:', error);
        return null;
      }
      
      console.log('✅ Product updated in database');
      return {
        id: data.id,
        name: data.name,
        description: data.description,
        price: parseFloat(data.price),
        imageUrl: data.image_url,
        category: data.category,
        stockQuantity: data.stock_quantity,
        isActive: data.is_active
      };
    } catch (err) {
      console.error('❌ Exception updating product:', err);
      return null;
    }
  },

  async createOrder(order: any) {
    if (!supabase) return null;
    try {
      const orderId = `ORD_${Date.now()}`;
      console.log('💾 Creating order in database:', orderId);
      
      // Insert order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_id: orderId,
          customer_name: order.customerName,
          customer_phone: order.customerPhone,
          delivery_address: order.deliveryAddress,
          total: order.total,
          status: order.status || 'confirmed',
          payment_status: order.paymentStatus || 'paid'
        })
        .select()
        .single();
      
      if (orderError) {
        console.error('❌ Database error creating order:', orderError);
        return null;
      }
      
      // Insert order items
      if (order.items && order.items.length > 0) {
        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(
            order.items.map((item: any) => ({
              order_id: orderData.id,
              product_id: parseInt(item.productId) || 0,
              product_name: item.productName,
              price: item.price,
              quantity: item.quantity,
              total: item.price * item.quantity
            }))
          );
          
        if (itemsError) {
          console.error('❌ Database error creating order items:', itemsError);
        } else {
          console.log('✅ Order items created in database');
        }
      }
      
      // Create customer record if not exists
      await supabase
        .from('customers')
        .upsert({
          name: order.customerName,
          phone: order.customerPhone,
          address: order.deliveryAddress
        }, { onConflict: 'phone' });
      
      console.log('✅ Order created in database with ID:', orderData.id);
      return {
        id: orderData.id,
        orderId: orderData.order_id,
        customerName: orderData.customer_name,
        customerPhone: orderData.customer_phone,
        deliveryAddress: orderData.delivery_address,
        total: orderData.total,
        status: orderData.status,
        paymentStatus: orderData.payment_status,
        items: order.items,
        createdAt: orderData.created_at
      };
    } catch (err) {
      console.error('❌ Exception creating order:', err);
      return null;
    }
  },

  async getOrders() {
    if (!supabase) return [];
    try {
      console.log('📊 Fetching orders from database...');
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            product_id,
            product_name,
            price,
            quantity,
            total
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('❌ Database error fetching orders:', error);
        return [];
      }
      
      console.log(`✅ Retrieved ${data?.length || 0} orders from database`);
      return data?.map(o => ({
        id: o.id,
        orderId: o.order_id,
        customerName: o.customer_name,
        customerPhone: o.customer_phone,
        deliveryAddress: o.delivery_address,
        total: parseFloat(o.total),
        status: o.status,
        paymentStatus: o.payment_status,
        items: o.order_items || [],
        createdAt: o.created_at
      })) || [];
    } catch (err) {
      console.error('❌ Exception fetching orders:', err);
      return [];
    }
  },

  async updateOrderStatus(id: number, status: string) {
    if (!supabase) return false;
    try {
      console.log('🔄 Updating order status in database:', id, '→', status);
      const { error } = await supabase
        .from('orders')
        .update({ 
          status, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', id);
      
      if (error) {
        console.error('❌ Database error updating order status:', error);
        return false;
      }
      
      console.log('✅ Order status updated in database');
      return true;
    } catch (err) {
      console.error('❌ Exception updating order status:', err);
      return false;
    }
  },

  async getCategories() {
    if (!supabase) return [];
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true);
      
      if (error) {
        // Fallback to hardcoded categories
        return [
          { id: 1, name: 'Grains', slug: 'grains', isActive: true },
          { id: 2, name: 'Pulses', slug: 'pulses', isActive: true },
          { id: 3, name: 'Oil', slug: 'oil', isActive: true },
          { id: 4, name: 'Dairy', slug: 'dairy', isActive: true },
          { id: 5, name: 'Vegetables', slug: 'vegetables', isActive: true },
          { id: 6, name: 'Fruits', slug: 'fruits', isActive: true }
        ];
      }
      
      return data?.map(c => ({
        id: c.id,
        name: c.name,
        slug: c.name.toLowerCase(),
        isActive: c.is_active
      })) || [];
    } catch (err) {
      console.error('❌ Exception fetching categories:', err);
      return [];
    }
  },

  async createCustomer(customer: any) {
    if (!supabase) return null;
    try {
      console.log('💾 Creating customer in database:', customer.name);
      const { data, error } = await supabase
        .from('customers')
        .upsert(customer, { onConflict: 'phone' })
        .select()
        .single();
      
      if (error) {
        console.error('❌ Database error creating customer:', error);
        return null;
      }
      
      console.log('✅ Customer created in database');
      return data;
    } catch (err) {
      console.error('❌ Exception creating customer:', err);
      return null;
    }
  }
};