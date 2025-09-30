// Live Tracking Service for Customer-Delivery Agent Communication
export interface LocationData {
  lat: number;
  lng: number;
  accuracy: number;
  timestamp: number;
  address?: string;
}

export interface DeliveryAgent {
  id: string;
  name: string;
  phone: string;
  currentLocation: LocationData;
  isOnline: boolean;
  orderId?: string;
}

export interface TrackingUpdate {
  orderId: string;
  agentLocation: LocationData;
  customerLocation: LocationData;
  estimatedArrival: number;
  distance: number;
  status: 'assigned' | 'picked_up' | 'on_the_way' | 'nearby' | 'delivered';
}

export class LiveTrackingService {
  private static trackingInterval: number | null = null;
  private static subscribers: Map<string, Function[]> = new Map();

  // Start live tracking for delivery agent
  static startAgentTracking(orderId: string, agentId: string): void {
    if (this.trackingInterval) {
      clearInterval(this.trackingInterval);
    }

    this.trackingInterval = setInterval(async () => {
      try {
        const location = await this.getCurrentLocation();
        if (location) {
          // Update agent location in storage
          this.updateAgentLocation(agentId, location);
          
          // Notify subscribers
          this.notifySubscribers('agentLocationUpdate', {
            orderId,
            agentId,
            location,
            timestamp: Date.now()
          });
        }
      } catch (error) {
        console.error('Agent tracking error:', error);
      }
    }, 10000); // Update every 10 seconds
  }

  // Stop tracking
  static stopTracking(): void {
    if (this.trackingInterval) {
      clearInterval(this.trackingInterval);
      this.trackingInterval = null;
    }
  }

  // Get current GPS location
  private static getCurrentLocation(): Promise<LocationData | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: Date.now()
          });
        },
        (error) => {
          console.error('Location error:', error);
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 8000,
          maximumAge: 5000
        }
      );
    });
  }

  // Update agent location in localStorage
  private static updateAgentLocation(agentId: string, location: LocationData): void {
    const agents = this.getDeliveryAgents();
    const agentIndex = agents.findIndex(a => a.id === agentId);
    
    if (agentIndex >= 0) {
      agents[agentIndex].currentLocation = location;
      localStorage.setItem('deliveryAgents', JSON.stringify(agents));
    }
  }

  // Get all delivery agents
  static getDeliveryAgents(): DeliveryAgent[] {
    const stored = localStorage.getItem('deliveryAgents');
    return stored ? JSON.parse(stored) : [];
  }

  // Get tracking data for customer
  static getTrackingData(orderId: string): TrackingUpdate | null {
    const order = this.getOrderById(orderId);
    if (!order || !order.deliveryAgentId) return null;

    const agent = this.getDeliveryAgents().find(a => a.id === order.deliveryAgentId);
    if (!agent) return null;

    const customerLocation = this.getCustomerLocation(orderId);
    if (!customerLocation) return null;

    const distance = this.calculateDistance(
      agent.currentLocation,
      customerLocation
    );

    return {
      orderId,
      agentLocation: agent.currentLocation,
      customerLocation,
      estimatedArrival: Math.ceil(distance * 2), // 2 minutes per km
      distance,
      status: this.getDeliveryStatus(distance)
    };
  }

  // Calculate distance between two points
  private static calculateDistance(loc1: LocationData, loc2: LocationData): number {
    const R = 6371; // Earth's radius in km
    const dLat = (loc2.lat - loc1.lat) * Math.PI / 180;
    const dLon = (loc2.lng - loc1.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(loc1.lat * Math.PI / 180) * Math.cos(loc2.lat * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  // Get delivery status based on distance
  private static getDeliveryStatus(distance: number): TrackingUpdate['status'] {
    if (distance < 0.1) return 'nearby';
    if (distance < 0.5) return 'on_the_way';
    return 'picked_up';
  }

  // Get order by ID
  private static getOrderById(orderId: string): any {
    const orders = JSON.parse(localStorage.getItem('customerOrders') || '[]');
    return orders.find((o: any) => o.orderId === orderId);
  }

  // Get customer location for order
  private static getCustomerLocation(orderId: string): LocationData | null {
    const order = this.getOrderById(orderId);
    return order?.customerCoordinates || null;
  }

  // Subscribe to tracking updates
  static subscribe(event: string, callback: Function): void {
    if (!this.subscribers.has(event)) {
      this.subscribers.set(event, []);
    }
    this.subscribers.get(event)!.push(callback);
  }

  // Unsubscribe from tracking updates
  static unsubscribe(event: string, callback: Function): void {
    const callbacks = this.subscribers.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  // Notify subscribers
  private static notifySubscribers(event: string, data: any): void {
    const callbacks = this.subscribers.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  // Assign delivery agent to order
  static assignAgent(orderId: string, agentId: string): void {
    const orders = JSON.parse(localStorage.getItem('customerOrders') || '[]');
    const orderIndex = orders.findIndex((o: any) => o.orderId === orderId);
    
    if (orderIndex >= 0) {
      orders[orderIndex].deliveryAgentId = agentId;
      orders[orderIndex].status = 'assigned';
      localStorage.setItem('customerOrders', JSON.stringify(orders));
    }

    const agents = this.getDeliveryAgents();
    const agentIndex = agents.findIndex(a => a.id === agentId);
    if (agentIndex >= 0) {
      agents[agentIndex].orderId = orderId;
      localStorage.setItem('deliveryAgents', JSON.stringify(agents));
    }
  }
}