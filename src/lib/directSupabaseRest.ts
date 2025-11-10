// Direct REST API calls without Supabase client
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

class DirectSupabaseRest {
  private baseUrl: string;
  private headers: Record<string, string>;

  constructor() {
    this.baseUrl = `${SUPABASE_URL}/rest/v1`;
    this.headers = {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    };
  }

  async createProduct(product: any) {
    try {
      console.log('📦 Creating product via REST API:', product);
      
      const productData = {
        name: product.name,
        description: product.description || '',
        price: Number(product.price),
        category: product.category,
        stock_quantity: Number(product.stockQuantity || product.stock_quantity || 0),
        image_url: product.imageUrl || product.image_url || '/placeholder.svg',
        is_active: product.isActive !== undefined ? product.isActive : true,
        sku: product.sku || `SKU${Date.now()}`,
        unit: product.unit || 'kg'
      };

      const response = await fetch(`${this.baseUrl}/products`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(productData)
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`HTTP ${response.status}: ${error}`);
      }

      const result = await response.json();
      console.log('✅ Product created successfully:', result[0]);
      return result[0];
    } catch (error) {
      console.error('❌ Product creation failed:', error);
      throw error;
    }
  }

  async createOrder(order: any) {
    try {
      console.log('📝 Creating order via REST API:', order);
      
      const orderData = {
        order_id: order.order_id || `ORD${Date.now()}`,
        customer_name: order.customer_name,
        customer_phone: order.customer_phone,
        customer_address: order.customer_address,
        items: typeof order.items === 'string' ? order.items : JSON.stringify(order.items),
        total_amount: Number(order.total_amount),
        order_status: order.order_status || 'confirmed',
        payment_status: order.payment_status || 'paid'
      };

      const response = await fetch(`${this.baseUrl}/orders`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`HTTP ${response.status}: ${error}`);
      }

      const result = await response.json();
      console.log('✅ Order created successfully:', result[0]);
      return result[0];
    } catch (error) {
      console.error('❌ Order creation failed:', error);
      throw error;
    }
  }

  async getProducts() {
    try {
      const response = await fetch(`${this.baseUrl}/products`, {
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Products fetch failed:', error);
      return [];
    }
  }

  async getOrders() {
    try {
      const response = await fetch(`${this.baseUrl}/orders?order=created_at.desc`, {
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Orders fetch failed:', error);
      return [];
    }
  }
}

export const directSupabaseRest = new DirectSupabaseRest();
export const isRestConfigured = Boolean(SUPABASE_URL && SUPABASE_KEY);