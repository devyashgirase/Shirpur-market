// Optimized Delivery Data Service with caching
import { OrderService } from './orderService';

export class DeliveryDataService {
  private static cache = new Map();
  private static lastUpdate = 0;
  private static CACHE_DURATION = 30000; // 30 seconds

  static async getAvailableDeliveries(agentUserId?: string) {
    try {
      // Get current agent GPS location
      const agentLocation = await this.getCurrentLocation();
      
      let availableOrders = [];
      
      if (agentUserId) {
        // Get orders specific to this delivery agent from Supabase
        const { supabaseApi } = await import('./supabase');
        // Convert string agentUserId to integer if needed, or skip if not numeric
        const numericAgentId = parseInt(agentUserId);
        const agentOrders = isNaN(numericAgentId) ? [] : await supabaseApi.getOrdersByDeliveryAgent(numericAgentId);
        console.log(`📦 Agent ${agentUserId} specific orders:`, agentOrders.length);
        
        // Convert Supabase orders to the expected format
        availableOrders = agentOrders.map(order => ({
          orderId: order.order_id || order.id,
          status: order.status,
          customerAddress: {
            name: order.customer_name,
            address: order.delivery_address || order.customer_address,
            phone: order.customer_phone,
            coordinates: {
              lat: order.delivery_latitude || 21.3099,
              lng: order.delivery_longitude || 75.1178
            }
          },
          items: order.items ? JSON.parse(order.items) : [],
          total: order.total,
          timestamp: order.created_at
        }));
      } else {
        // Fallback to OrderService for general orders
        const allOrders = OrderService.getAllOrders();
        console.log('📦 DeliveryDataService - Total orders:', allOrders.length);
        
        // Get orders that admin changed to out_for_delivery status (not yet accepted by agent)
        availableOrders = allOrders.filter(order => 
          order.status === 'out_for_delivery' && !order.deliveryAgent
        );
      }
      
      console.log('🚚 Available for delivery:', availableOrders.length, 'orders');

      // Convert orders to delivery tasks format
      const deliveryTasks = availableOrders.map(order => ({
        id: `TASK_${order.orderId}`,
        orderId: order.orderId,
        order_id: order.orderId,
        customer_name: order.customerAddress.name,
        customer_address: order.customerAddress.address,
        customer_phone: order.customerAddress.phone,
        customerAddress: order.customerAddress,
        items: order.items,
        total: order.total,
        orderValue: order.total,
        total_amount: order.total,
        estimatedEarning: Math.round(order.total * 0.15), // 15% commission
        status: order.status === 'pending' ? 'available' : 'accepted',
        timestamp: order.timestamp,
        distance: this.calculateDistance(
          agentLocation.lat, 
          agentLocation.lng, 
          order.customerAddress.coordinates?.lat || 21.3099, 
          order.customerAddress.coordinates?.lng || 75.1178
        ),
        agentLocation,
        debugInfo: {
          agentUserId,
          totalOrders: availableOrders.length,
          agentGPS: agentLocation,
          lastUpdate: new Date().toLocaleTimeString(),
          orderStatuses: availableOrders.map(o => ({ id: o.orderId, status: o.status }))
        }
      }));

      console.log('🚚 Delivery tasks created:', deliveryTasks.length);
      return deliveryTasks;
    } catch (error) {
      console.error('DeliveryDataService error:', error);
      return [];
    }
  }

  static async getCurrentLocation(): Promise<{lat: number, lng: number}> {
    return new Promise((resolve) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const location = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            localStorage.setItem('agentLocation', JSON.stringify(location));
            resolve(location);
          },
          () => {
            // Fallback to Shirpur coordinates
            const fallback = { lat: 21.3486, lng: 74.8811 };
            localStorage.setItem('agentLocation', JSON.stringify(fallback));
            resolve(fallback);
          }
        );
      } else {
        const fallback = { lat: 21.3486, lng: 74.8811 };
        localStorage.setItem('agentLocation', JSON.stringify(fallback));
        resolve(fallback);
      }
    });
  }

  static getDeliveryMetrics(tasks: any[]) {
    const activeTasks = tasks.filter(task => 
      ['accepted', 'in_progress'].includes(task.status)
    ).length;
    
    const todaysEarnings = tasks
      .filter(task => task.status === 'completed' && 
        new Date(task.timestamp).toDateString() === new Date().toDateString()
      )
      .reduce((sum, task) => sum + (task.estimatedEarning || 0), 0);

    return {
      activeTasks,
      availableOrders: tasks.length,
      todaysEarnings,
      completionRate: 95
    };
  }

  private static calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + 
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  static clearCache() {
    this.cache.clear();
    this.lastUpdate = 0;
  }
}