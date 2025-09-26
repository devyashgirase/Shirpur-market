interface DeliveryAgent {
  id: string;
  name: string;
  phone: string;
  currentLat: number;
  currentLng: number;
  isActive: boolean;
  lastUpdate: string;
}

interface OrderLocation {
  orderId: string;
  customerLat: number;
  customerLng: number;
  customerAddress: string;
  customerName: string;
  customerPhone: string;
  total: number;
}

class DeliveryCoordinationService {
  private static instance: DeliveryCoordinationService;
  private subscribers: Map<string, Function[]> = new Map();
  private locationUpdateInterval: NodeJS.Timeout | null = null;

  static getInstance(): DeliveryCoordinationService {
    if (!DeliveryCoordinationService.instance) {
      DeliveryCoordinationService.instance = new DeliveryCoordinationService();
    }
    return DeliveryCoordinationService.instance;
  }

  // Calculate distance between two coordinates
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  // Set delivery agent location when they login
  setAgentLocation(agentId: string, lat: number, lng: number) {
    const agents = this.getDeliveryAgents();
    const agentIndex = agents.findIndex(a => a.id === agentId);
    
    if (agentIndex >= 0) {
      agents[agentIndex] = {
        ...agents[agentIndex],
        currentLat: lat,
        currentLng: lng,
        isActive: true,
        lastUpdate: new Date().toISOString()
      };
    } else {
      agents.push({
        id: agentId,
        name: `Agent ${agentId}`,
        phone: `+91 ${Math.floor(Math.random() * 9000000000) + 1000000000}`,
        currentLat: lat,
        currentLng: lng,
        isActive: true,
        lastUpdate: new Date().toISOString()
      });
    }
    
    localStorage.setItem('deliveryAgents', JSON.stringify(agents));
    this.notifySubscribers('agentLocationUpdate', { agentId, lat, lng });
  }

  // Get delivery agents
  getDeliveryAgents(): DeliveryAgent[] {
    return JSON.parse(localStorage.getItem('deliveryAgents') || '[]');
  }

  // Find nearby orders for delivery agent (within 10km)
  findNearbyOrders(agentId: string): OrderLocation[] {
    const agents = this.getDeliveryAgents();
    const agent = agents.find(a => a.id === agentId);
    if (!agent) return [];

    const orders = JSON.parse(localStorage.getItem('allOrders') || '[]');
    const nearbyOrders: OrderLocation[] = [];

    orders.forEach((order: any) => {
      if (order.status === 'confirmed' && order.customerAddress?.coordinates) {
        const distance = this.calculateDistance(
          agent.currentLat,
          agent.currentLng,
          order.customerAddress.coordinates.lat,
          order.customerAddress.coordinates.lng
        );

        if (distance <= 10) { // Within 10km
          nearbyOrders.push({
            orderId: order.orderId,
            customerLat: order.customerAddress.coordinates.lat,
            customerLng: order.customerAddress.coordinates.lng,
            customerAddress: order.customerAddress.address,
            customerName: order.customerAddress.name,
            customerPhone: order.customerAddress.phone,
            total: order.total
          });
        }
      }
    });

    return nearbyOrders;
  }

  // Accept order by delivery agent
  acceptOrder(agentId: string, orderId: string) {
    const agents = this.getDeliveryAgents();
    const agent = agents.find(a => a.id === agentId);
    if (!agent) return false;

    // Update order status to 'out_for_delivery'
    const orders = JSON.parse(localStorage.getItem('allOrders') || '[]');
    const orderIndex = orders.findIndex((o: any) => o.orderId === orderId);
    
    if (orderIndex >= 0) {
      orders[orderIndex].status = 'out_for_delivery';
      orders[orderIndex].deliveryAgent = {
        id: agentId,
        name: agent.name,
        phone: agent.phone,
        location: {
          lat: agent.currentLat,
          lng: agent.currentLng,
          timestamp: new Date().toISOString()
        }
      };
      
      localStorage.setItem('allOrders', JSON.stringify(orders));
      
      // Update current order if it matches
      const currentOrder = JSON.parse(localStorage.getItem('currentOrder') || '{}');
      if (currentOrder.orderId === orderId) {
        currentOrder.status = 'out_for_delivery';
        currentOrder.deliveryAgent = orders[orderIndex].deliveryAgent;
        localStorage.setItem('currentOrder', JSON.stringify(currentOrder));
      }

      this.notifySubscribers('orderAccepted', { orderId, agentId });
      this.startLiveTracking(orderId, agentId);
      return true;
    }
    
    return false;
  }

  // Start live tracking for accepted order
  private startLiveTracking(orderId: string, agentId: string) {
    if (this.locationUpdateInterval) {
      clearInterval(this.locationUpdateInterval);
    }

    this.locationUpdateInterval = setInterval(() => {
      this.updateAgentLocationForOrder(orderId, agentId);
    }, 3000); // Update every 3 seconds
  }

  // Update agent location during delivery
  private updateAgentLocationForOrder(orderId: string, agentId: string) {
    const orders = JSON.parse(localStorage.getItem('allOrders') || '[]');
    const orderIndex = orders.findIndex((o: any) => o.orderId === orderId);
    
    if (orderIndex >= 0 && orders[orderIndex].status === 'out_for_delivery') {
      const agents = this.getDeliveryAgents();
      const agent = agents.find(a => a.id === agentId);
      
      if (agent) {
        // Simulate movement towards customer
        const customerLat = orders[orderIndex].customerAddress.coordinates.lat;
        const customerLng = orders[orderIndex].customerAddress.coordinates.lng;
        
        // Move slightly towards customer
        const newLat = agent.currentLat + (customerLat - agent.currentLat) * 0.1;
        const newLng = agent.currentLng + (customerLng - agent.currentLng) * 0.1;
        
        // Update agent location
        this.setAgentLocation(agentId, newLat, newLng);
        
        // Update order with new agent location
        orders[orderIndex].deliveryAgent.location = {
          lat: newLat,
          lng: newLng,
          timestamp: new Date().toISOString()
        };
        
        localStorage.setItem('allOrders', JSON.stringify(orders));
        
        // Update current order
        const currentOrder = JSON.parse(localStorage.getItem('currentOrder') || '{}');
        if (currentOrder.orderId === orderId) {
          currentOrder.deliveryAgent.location = orders[orderIndex].deliveryAgent.location;
          localStorage.setItem('currentOrder', JSON.stringify(currentOrder));
        }
        
        this.notifySubscribers('liveLocationUpdate', { orderId, agentId, lat: newLat, lng: newLng });
      }
    }
  }

  // Mark order as delivered
  markAsDelivered(orderId: string) {
    const orders = JSON.parse(localStorage.getItem('allOrders') || '[]');
    const orderIndex = orders.findIndex((o: any) => o.orderId === orderId);
    
    if (orderIndex >= 0) {
      orders[orderIndex].status = 'delivered';
      localStorage.setItem('allOrders', JSON.stringify(orders));
      
      const currentOrder = JSON.parse(localStorage.getItem('currentOrder') || '{}');
      if (currentOrder.orderId === orderId) {
        currentOrder.status = 'delivered';
        localStorage.setItem('currentOrder', JSON.stringify(currentOrder));
      }
      
      if (this.locationUpdateInterval) {
        clearInterval(this.locationUpdateInterval);
        this.locationUpdateInterval = null;
      }
      
      this.notifySubscribers('orderDelivered', { orderId });
    }
  }

  subscribe(event: string, callback: Function) {
    if (!this.subscribers.has(event)) {
      this.subscribers.set(event, []);
    }
    this.subscribers.get(event)!.push(callback);
  }

  unsubscribe(event: string, callback: Function) {
    const callbacks = this.subscribers.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  private notifySubscribers(event: string, data: any) {
    const callbacks = this.subscribers.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }
}

export const deliveryCoordinationService = DeliveryCoordinationService.getInstance();
export type { DeliveryAgent, OrderLocation };