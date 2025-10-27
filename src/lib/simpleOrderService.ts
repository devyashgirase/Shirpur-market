// Simple order service for error-free customer flow
export interface SimpleOrder {
  id: string;
  order_id: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  items: any[];
  total_amount: number;
  status: string;
  payment_status: string;
  created_at: string;
}

class SimpleOrderService {
  async createOrder(orderData: any): Promise<string> {
    try {
      console.log('📦 Creating order:', orderData);
      
      // Direct Supabase insert
      const response = await fetch('https://ftexuxkdfahbqjddidaf.supabase.co/rest/v1/orders', {
        method: 'POST',
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0ZXh1eGtkZmFoYnFqZGRpZGFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4OTg0MjMsImV4cCI6MjA3NTQ3NDQyM30.j_HfG_5FLay9EymJkJAkWRx0P0yScHXPZckIQ3apbEY',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0ZXh1eGtkZmFoYnFqZGRpZGFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4OTg0MjMsImV4cCI6MjA3NTQ3NDQyM30.j_HfG_5FLay9EymJkJAkWRx0P0yScHXPZckIQ3apbEY',
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(orderData)
      });
      
      if (response.ok) {
        const savedOrder = await response.json();
        console.log('✅ Order saved to Supabase:', savedOrder);
        
        // Trigger events for real-time updates
        window.dispatchEvent(new CustomEvent('orderCreated', { 
          detail: { orderId: orderData.order_id, status: orderData.status } 
        }));
        window.dispatchEvent(new CustomEvent('ordersUpdated'));
        
        return orderData.order_id;
      } else {
        const error = await response.text();
        console.error('❌ Failed to save order:', error);
        throw new Error('Failed to save order');
      }
    } catch (error) {
      console.error('❌ Order creation error:', error);
      throw error;
    }
  }

  async getCustomerOrders(customerPhone: string): Promise<SimpleOrder[]> {
    try {
      const response = await fetch(`https://ftexuxkdfahbqjddidaf.supabase.co/rest/v1/orders?customer_phone=eq.${customerPhone}&order=created_at.desc`, {
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0ZXh1eGtkZmFoYnFqZGRpZGFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4OTg0MjMsImV4cCI6MjA3NTQ3NDQyM30.j_HfG_5FLay9EymJkJAkWRx0P0yScHXPZckIQ3apbEY',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0ZXh1eGtkZmFoYnFqZGRpZGFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4OTg0MjMsImV4cCI6MjA3NTQ3NDQyM30.j_HfG_5FLay9EymJkJAkWRx0P0yScHXPZckIQ3apbEY',
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const orders = await response.json();
        return orders || [];
      } else {
        console.error('Failed to fetch orders');
        return [];
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      return [];
    }
  }
}

export const simpleOrderService = new SimpleOrderService();