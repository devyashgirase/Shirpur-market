import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export const createOrderDirect = async (orderData: any) => {
  if (!supabase) {
    console.warn('Supabase not configured, using localStorage');
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const newOrder = { id: Date.now(), ...orderData };
    orders.push(newOrder);
    localStorage.setItem('orders', JSON.stringify(orders));
    return newOrder;
  }

  try {
    const { data, error } = await supabase
      .from('orders')
      .insert([orderData])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Supabase order creation failed:', error);
    // Fallback to localStorage
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const newOrder = { id: Date.now(), ...orderData };
    orders.push(newOrder);
    localStorage.setItem('orders', JSON.stringify(orders));
    return newOrder;
  }
};

export const getOrdersDirect = async () => {
  if (!supabase) {
    return JSON.parse(localStorage.getItem('orders') || '[]');
  }

  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Supabase orders fetch failed:', error);
    return JSON.parse(localStorage.getItem('orders') || '[]');
  }
};