import { supabase } from './directSupabase';

export interface DeliveryOrder {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  items: any[];
  total_amount: number;
  order_status: string;
  created_at: string;
}

export class DeliveryOrderService {
  // Get orders for delivery (ready_for_delivery and out_for_delivery)
  static async getDeliveryOrders(): Promise<DeliveryOrder[]> {
    try {
      const { supabaseApi } = await import('@/lib/supabase');
      const allOrders = await supabaseApi.getOrders();
      
      // Filter orders that are ready for delivery or out for delivery
      const deliveryOrders = allOrders.filter((order: any) => 
        order.order_status === 'ready_for_delivery' ||
        order.order_status === 'out_for_delivery'
      );
      
      console.log('📦 Total orders found:', allOrders.length);
      console.log('🚚 Delivery orders found:', deliveryOrders.length);
      console.log('🚚 Delivery order statuses:', deliveryOrders.map(o => ({ id: o.id, status: o.order_status })));
      console.log('🏠 Customer addresses:', deliveryOrders.map(o => ({ id: o.id, customer_address: o.customer_address, delivery_address: o.delivery_address })));
      
      return deliveryOrders.map((order: any) => ({
        id: order.id || order.order_id,
        customer_name: order.customer_name,
        customer_phone: order.customer_phone,
        customer_address: order.customer_address || order.delivery_address,
        items: typeof order.items === 'string' ? JSON.parse(order.items) : order.items || [],
        total_amount: Number(order.total_amount),
        order_status: order.order_status,
        created_at: order.created_at
      }));
    } catch (error) {
      console.error('Error fetching delivery orders:', error);
      return [];
    }
  }

  // Mark order as delivered
  static async markAsDelivered(orderId: string): Promise<boolean> {
    try {
      const { supabaseApi } = await import('@/lib/supabase');
      const success = await supabaseApi.updateOrderStatus(orderId, 'delivered');
      
      if (success) {
        console.log('✅ Order marked as delivered in database:', orderId);
        
        // Trigger real-time update
        window.dispatchEvent(new CustomEvent('orderStatusUpdated', {
          detail: { orderId, status: 'delivered' }
        }));
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error marking order as delivered:', error);
      return false;
    }
  }

  // Subscribe to delivery order updates
  static subscribeToDeliveryOrders(callback: (orders: DeliveryOrder[]) => void) {
    const handleOrderUpdate = () => {
      this.getDeliveryOrders().then(callback);
    };
    
    window.addEventListener('orderStatusUpdated', handleOrderUpdate);
    
    return {
      unsubscribe: () => {
        window.removeEventListener('orderStatusUpdated', handleOrderUpdate);
      }
    };
  }
}