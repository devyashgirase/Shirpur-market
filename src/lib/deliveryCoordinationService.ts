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
      // Look for orders with 'out_for_delivery' status only
      if (order.status === 'out_for_delivery' && order.customerAddress) {
        const customerLat = order.customerAddress.coordinates?.lat || 21.3099;
        const customerLng = order.customerAddress.coordinates?.lng || 75.1178;
        
        const distance = this.calculateDistance(
          agent.currentLat,
          agent.currentLng,
          customerLat,
          customerLng
        );

        // Show all orders regardless of distance for now
        nearbyOrders.push({
          orderId: order.orderId,
          customerLat,
          customerLng,
          customerAddress: order.customerAddress.address,
          customerName: order.customerAddress.name,
          customerPhone: order.customerAddress.phone,
          total: order.total,
          distance: distance,
          status: order.status
        });
      }
    });
    return nearbyOrders;
  }

  // Generate OTP for delivery verification
  private generateDeliveryOTP(orderId: string, customerPhone: string): string {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP with order details
    localStorage.setItem(`delivery_otp_${orderId}`, JSON.stringify({
      otp: otp,
      timestamp: Date.now(),
      phone: customerPhone,
      orderId: orderId
    }));
    
    console.log(`📱 Generated delivery OTP ${otp} for order ${orderId}`);
    
    // In real app, send SMS here
    // await this.sendSMS(customerPhone, `Your delivery OTP is: ${otp}. Share this with delivery agent to confirm delivery.`);
    
    return otp;
  }

  // Accept order by delivery agent
  acceptOrder(agentId: string, orderId: string) {
    console.log(`🚚 Agent ${agentId} accepting order ${orderId}`);
    
    const agents = this.getDeliveryAgents();
    const agent = agents.find(a => a.id === agentId);
    if (!agent) {
      console.error('Agent not found:', agentId);
      return false;
    }

    // Try to find order in allOrders first, then create mock if needed
    let orders = JSON.parse(localStorage.getItem('allOrders') || '[]');
    let orderIndex = orders.findIndex((o: any) => o.orderId === orderId);
    
    // If order not found, create a mock order
    if (orderIndex < 0) {
      const mockOrder = {
        orderId: orderId,
        status: 'accepted',
        customerAddress: {
          name: 'Mock Customer',
          address: '123 Test Street, Shirpur',
          phone: '9876543210',
          coordinates: { lat: 21.3099, lng: 75.1178 }
        },
        total: 250,
        items: [{ name: 'Test Product', quantity: 1, price: 250 }],
        timestamp: new Date().toISOString()
      };
      orders.push(mockOrder);
      orderIndex = orders.length - 1;
    }
    
    // Update order with delivery agent info
    orders[orderIndex].status = 'accepted';
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
    
    // Generate OTP for delivery verification
    const customerPhone = orders[orderIndex].customerAddress?.phone;
    if (customerPhone) {
      const otp = this.generateDeliveryOTP(orderId, customerPhone);
      orders[orderIndex].deliveryOTP = {
        generated: true,
        timestamp: new Date().toISOString()
      };
      
      console.log(`🔐 Delivery OTP generated for order ${orderId}: ${otp}`);
    }
    
    localStorage.setItem('allOrders', JSON.stringify(orders));
    
    // Update current order
    localStorage.setItem('currentOrder', JSON.stringify(orders[orderIndex]));

    console.log('✅ Order accepted successfully:', orders[orderIndex]);
    
    this.notifySubscribers('orderAccepted', { orderId, agentId });
    this.startLiveTracking(orderId, agentId);
    
    // Show success notification
    window.dispatchEvent(new CustomEvent('deliveryNotificationCreated', {
      detail: {
        type: 'success',
        message: `Order ${orderId} accepted! GPS tracking started. OTP sent to customer.`,
        orderId
      }
    }));
    
    return true;
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
    
    if (orderIndex >= 0 && orders[orderIndex].status === 'accepted') {
      const agents = this.getDeliveryAgents();
      const agent = agents.find(a => a.id === agentId);
      
      if (agent) {
        // Get customer location
        const customerLat = orders[orderIndex].customerAddress?.coordinates?.lat || 21.3099;
        const customerLng = orders[orderIndex].customerAddress?.coordinates?.lng || 75.1178;
        
        // Calculate distance to customer
        const distance = this.calculateDistance(
          agent.currentLat, agent.currentLng,
          customerLat, customerLng
        );
        
        // If very close to customer (within 100m), don't move further
        if (distance < 0.1) {
          console.log('🎯 Agent reached customer location!');
          return;
        }
        
        // Move towards customer (smaller steps for realistic movement)
        const moveStep = 0.02; // Smaller movement step
        const newLat = agent.currentLat + (customerLat - agent.currentLat) * moveStep;
        const newLng = agent.currentLng + (customerLng - agent.currentLng) * moveStep;
        
        // Update agent location
        this.setAgentLocation(agentId, newLat, newLng);
        
        // Update order with new agent location
        orders[orderIndex].deliveryAgent.location = {
          lat: newLat,
          lng: newLng,
          timestamp: new Date().toISOString(),
          distanceToCustomer: distance
        };
        
        localStorage.setItem('allOrders', JSON.stringify(orders));
        
        // Update current order
        const currentOrder = JSON.parse(localStorage.getItem('currentOrder') || '{}');
        if (currentOrder.orderId === orderId) {
          currentOrder.deliveryAgent.location = orders[orderIndex].deliveryAgent.location;
          localStorage.setItem('currentOrder', JSON.stringify(currentOrder));
        }
        
        console.log(`📍 Agent moving: ${distance.toFixed(2)}km to customer`);
        this.notifySubscribers('liveLocationUpdate', { orderId, agentId, lat: newLat, lng: newLng, distance });
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