export const supabase = null;

export const createOrderDirect = async (orderData: any) => {
  // Store in localStorage instead
  const orders = JSON.parse(localStorage.getItem('orders') || '[]');
  const newOrder = { id: Date.now(), ...orderData };
  orders.push(newOrder);
  localStorage.setItem('orders', JSON.stringify(orders));
  return newOrder;
};