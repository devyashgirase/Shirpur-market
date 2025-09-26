import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const isSupabaseEnabled = () => Boolean(supabase);

// Database Tables Interface
export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  image: string;
  description?: string;
  stock: number;
  created_at?: string;
}

export interface Order {
  id: number;
  order_id: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  items: any[];
  total: number;
  status: string;
  payment_status: string;
  created_at: string;
  updated_at?: string;
}

export interface DeliveryAgent {
  id: number;
  name: string;
  phone: string;
  latitude?: number;
  longitude?: number;
  is_available: boolean;
  created_at?: string;
}

// Supabase Service Functions
export class SupabaseService {
  // Products
  static async getProducts(): Promise<Product[]> {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  static async addProduct(product: Omit<Product, 'id' | 'created_at'>): Promise<Product> {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase
      .from('products')
      .insert([product])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updateProduct(id: number, updates: Partial<Product>): Promise<Product> {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async deleteProduct(id: number): Promise<void> {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // Orders
  static async getOrders(): Promise<Order[]> {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  static async createOrder(order: Omit<Order, 'id' | 'created_at'>): Promise<Order> {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase
      .from('orders')
      .insert([order])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updateOrderStatus(orderId: string, status: string): Promise<Order> {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('order_id', orderId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updatePaymentStatus(orderId: string, paymentStatus: string): Promise<Order> {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase
      .from('orders')
      .update({ payment_status: paymentStatus, updated_at: new Date().toISOString() })
      .eq('order_id', orderId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Delivery Agents
  static async getDeliveryAgents(): Promise<DeliveryAgent[]> {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase
      .from('delivery_agents')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  static async updateAgentLocation(phone: string, latitude: number, longitude: number): Promise<void> {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { error } = await supabase
      .from('delivery_agents')
      .update({ latitude, longitude })
      .eq('phone', phone);
    
    if (error) throw error;
  }

  static async updateAgentAvailability(phone: string, isAvailable: boolean): Promise<void> {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { error } = await supabase
      .from('delivery_agents')
      .update({ is_available: isAvailable })
      .eq('phone', phone);
    
    if (error) throw error;
  }

  // Real-time subscriptions
  static subscribeToOrders(callback: (payload: any) => void) {
    if (!supabase) return null;
    
    return supabase
      .channel('orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, callback)
      .subscribe();
  }

  static subscribeToProducts(callback: (payload: any) => void) {
    if (!supabase) return null;
    
    return supabase
      .channel('products')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, callback)
      .subscribe();
  }
}