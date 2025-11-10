// Disabled to prevent build errors
export const supabase = null;

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