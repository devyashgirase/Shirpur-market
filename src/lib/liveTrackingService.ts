// Live GPS Tracking Service
class LiveTrackingService {
  private static instance: LiveTrackingService;
  private subscribers: Map<string, Function[]> = new Map();
  private trackingInterval: NodeJS.Timeout | null = null;

  static getInstance(): LiveTrackingService {
    if (!LiveTrackingService.instance) {
      LiveTrackingService.instance = new LiveTrackingService();
    }
    return LiveTrackingService.instance;
  }

  // Start tracking when order status changes to 'out_for_delivery'
  startTracking(orderId: string) {
    if (this.trackingInterval) {
      clearInterval(this.trackingInterval);
    }

    this.trackingInterval = setInterval(() => {
      this.updateDeliveryAgentLocation(orderId);
    }, 5000); // Update every 5 seconds
  }

  // Stop tracking when order is delivered
  stopTracking() {
    if (this.trackingInterval) {
      clearInterval(this.trackingInterval);
      this.trackingInterval = null;
    }
  }

  // Simulate delivery agent movement
  private updateDeliveryAgentLocation(orderId: string) {
    const currentOrder = JSON.parse(localStorage.getItem('currentOrder') || '{}');
    
    if (currentOrder.orderId === orderId && currentOrder.status === 'out_for_delivery') {
      // Simulate GPS movement towards customer
      const customerAddress = JSON.parse(localStorage.getItem('customerAddress') || '{}');
      
      if (customerAddress.coordinates) {
        const agentLocation = {
          lat: 21.3486 + (Math.random() - 0.5) * 0.01,
          lng: 74.8811 + (Math.random() - 0.5) * 0.01,
          timestamp: new Date().toISOString()
        };

        // Update order with new agent location
        currentOrder.deliveryAgent = {
          ...currentOrder.deliveryAgent,
          location: agentLocation
        };

        localStorage.setItem('currentOrder', JSON.stringify(currentOrder));
        
        // Notify subscribers
        this.notifySubscribers('locationUpdate', {
          orderId,
          location: agentLocation
        });
      }
    }
  }

  // Subscribe to location updates
  subscribe(event: string, callback: Function) {
    if (!this.subscribers.has(event)) {
      this.subscribers.set(event, []);
    }
    this.subscribers.get(event)!.push(callback);
  }

  // Unsubscribe from updates
  unsubscribe(event: string, callback: Function) {
    const callbacks = this.subscribers.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  // Notify all subscribers
  private notifySubscribers(event: string, data: any) {
    const callbacks = this.subscribers.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  // Trigger tracking when admin changes order status
  onOrderStatusChange(orderId: string, newStatus: string) {
    if (newStatus === 'out_for_delivery') {
      // Assign delivery agent and start tracking
      const currentOrder = JSON.parse(localStorage.getItem('currentOrder') || '{}');
      
      if (currentOrder.orderId === orderId) {
        currentOrder.deliveryAgent = {
          name: 'Rahul Sharma',
          phone: '+91 98765 43210',
          location: {
            lat: 21.3486,
            lng: 74.8811,
            timestamp: new Date().toISOString()
          }
        };
        
        localStorage.setItem('currentOrder', JSON.stringify(currentOrder));
        this.startTracking(orderId);
      }
    } else if (newStatus === 'delivered') {
      this.stopTracking();
    }
  }
}

export const liveTrackingService = LiveTrackingService.getInstance();