// Order Tracking Service - Supabase only with real-time updates
import { supabaseApi } from './supabase';
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
        status: order.status,
        customerAddress: order.delivery_address,
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

    if (order.status !== 'confirmed') {
      history.push({ status: order.status, timestamp: new Date().toISOString() });
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

    const interval = setInterval(async () => {
      const trackingData = await this.getTrackingData(orderId);
      callback(trackingData);
    }, 3000); // Update every 3 seconds

    return () => {
      clearInterval(interval);
      window.removeEventListener('orderStatusUpdated', handleStatusUpdate as EventListener);
    };
  }
}

export const orderTrackingService = new OrderTrackingService();