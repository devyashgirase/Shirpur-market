// Order Tracking Service - Direct Supabase connection
import { supabase } from './directSupabase';
import { customerOrderService, type CustomerOrder } from './customerOrderService';

export interface TrackingData {
  orderId: string;
  status: string;
  customerAddress: string;
  deliveryAgentLocation?: {
    lat: number;
    lng: number;
    timestamp: string;
  };
  estimatedDelivery?: string;
  statusHistory: {
    status: string;
    timestamp: string;
  }[];
}

class OrderTrackingService {
  async getTrackingData(orderId: string): Promise<TrackingData | null> {
    try {
      const order = await customerOrderService.getOrderById(orderId);
      if (!order) return null;

      return {
        orderId: order.order_id,
        status: order.order_status,
        customerAddress: order.customer_address,
        deliveryAgentLocation: order.delivery_latitude && order.delivery_longitude ? {
          lat: order.delivery_latitude,
          lng: order.delivery_longitude,
          timestamp: new Date().toISOString()
        } : undefined,
        statusHistory: this.getStatusHistory(order)
      };
    } catch (error) {
      console.error('Failed to get tracking data:', error);
      return null;
    }
  }

  private getStatusHistory(order: CustomerOrder) {
    const history = [
      { status: 'confirmed', timestamp: order.created_at }
    ];

    if (order.order_status !== 'confirmed') {
      history.push({ status: order.order_status, timestamp: new Date().toISOString() });
    }

    return history;
  }

  subscribeToTracking(orderId: string, callback: (data: TrackingData | null) => void) {
    // Listen for admin status updates
    const handleStatusUpdate = (event: CustomEvent) => {
      if (event.detail.orderId === orderId) {
        this.getTrackingData(orderId).then(callback);
      }
    };

    window.addEventListener('orderStatusUpdated', handleStatusUpdate as EventListener);

    // Real-time Supabase subscription
    let subscription: any = null;
    if (supabase) {
      subscription = supabase
        .channel(`order-${orderId}`)
        .on('postgres_changes', 
          { event: 'UPDATE', schema: 'public', table: 'orders', filter: `order_id=eq.${orderId}` },
          () => {
            this.getTrackingData(orderId).then(callback);
          }
        )
        .subscribe();
    }

    const interval = setInterval(async () => {
      const trackingData = await this.getTrackingData(orderId);
      callback(trackingData);
    }, 3000);

    return () => {
      clearInterval(interval);
      window.removeEventListener('orderStatusUpdated', handleStatusUpdate as EventListener);
      if (subscription) subscription.unsubscribe();
    };
  }
}

export const orderTrackingService = new OrderTrackingService();