// Real-time data synchronization service - NO STATIC DATA
import { DataGenerator } from './dataGenerator';

export class RealTimeDataService {
  private static instance: RealTimeDataService;
  private updateInterval: NodeJS.Timeout | null = null;
  private subscribers: Map<string, Function[]> = new Map();

  static getInstance(): RealTimeDataService {
    if (!this.instance) {
      this.instance = new RealTimeDataService();
    }
    return this.instance;
  }

  // Start real-time data updates
  startRealTimeUpdates() {
    if (this.updateInterval) return;

    // Update data every 10 seconds
    this.updateInterval = setInterval(() => {
      this.updateAllData();
    }, 10000);

    // Initial update
    this.updateAllData();
  }

  // Stop real-time updates
  stopRealTimeUpdates() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  // Subscribe to data updates
  subscribe(dataType: string, callback: Function) {
    if (!this.subscribers.has(dataType)) {
      this.subscribers.set(dataType, []);
    }
    this.subscribers.get(dataType)!.push(callback);
  }

  // Unsubscribe from data updates
  unsubscribe(dataType: string, callback: Function) {
    const callbacks = this.subscribers.get(dataType);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  // Notify subscribers
  private notifySubscribers(dataType: string, data: any) {
    const callbacks = this.subscribers.get(dataType);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  // Update all data with fresh dynamic content
  private updateAllData() {
    this.updateProducts();
    this.updateOrders();
    this.updateDeliveryAgents();
    this.updateMarketTrends();
  }

  // Generate fresh products with real-time pricing
  private updateProducts() {
    const freshProducts = DataGenerator.generateProducts(50);
    const formattedProducts = freshProducts.map(p => ({
      id: p.id,
      name: p.name,
      description: p.description,
      price: p.price,
      category: p.category,
      stockQuantity: p.stock_qty,
      isActive: p.isActive,
      imageUrl: '',
      discount: p.discount,
      rating: p.rating,
      reviewCount: p.reviewCount,
      lastUpdated: new Date().toISOString()
    }));

    // Update localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('products', JSON.stringify(formattedProducts));
      localStorage.setItem('productsLastUpdated', Date.now().toString());
    }

    this.notifySubscribers('products', formattedProducts);
  }

  // Update order statuses in real-time
  private updateOrders() {
    if (typeof window === 'undefined') return;

    const orders = JSON.parse(localStorage.getItem('allOrders') || '[]');
    let updated = false;

    const updatedOrders = orders.map((order: any) => {
      // Randomly update order status for active orders
      if (['pending', 'confirmed', 'preparing', 'out_for_delivery'].includes(order.status)) {
        if (Math.random() < 0.1) { // 10% chance of status update
          const statusUpdate = DataGenerator.generateOrderStatusUpdate(order.orderId, order.status);
          updated = true;
          return {
            ...order,
            status: statusUpdate.status,
            lastUpdated: new Date().toISOString()
          };
        }
      }
      return order;
    });

    if (updated) {
      localStorage.setItem('allOrders', JSON.stringify(updatedOrders));
      this.notifySubscribers('orders', updatedOrders);
    }
  }

  // Update delivery agent locations
  private updateDeliveryAgents() {
    if (typeof window === 'undefined') return;

    const agents = JSON.parse(localStorage.getItem('deliveryAgents') || '[]');
    
    const updatedAgents = agents.map((agent: any) => {
      if (agent.isActive) {
        // Simulate agent movement
        const newLocation = {
          lat: agent.location.lat + (Math.random() - 0.5) * 0.001,
          lng: agent.location.lng + (Math.random() - 0.5) * 0.001
        };
        
        return {
          ...agent,
          location: newLocation,
          lastUpdated: new Date().toISOString()
        };
      }
      return agent;
    });

    if (updatedAgents.length > 0) {
      localStorage.setItem('deliveryAgents', JSON.stringify(updatedAgents));
      this.notifySubscribers('deliveryAgents', updatedAgents);
    }
  }

  // Update market trends
  private updateMarketTrends() {
    const trends = DataGenerator.generateMarketTrends();
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('marketTrends', JSON.stringify({
        ...trends,
        lastUpdated: new Date().toISOString()
      }));
    }

    this.notifySubscribers('marketTrends', trends);
  }

  // Get fresh data for any type
  getFreshData(dataType: string) {
    switch (dataType) {
      case 'products':
        this.updateProducts();
        break;
      case 'orders':
        this.updateOrders();
        break;
      case 'deliveryAgents':
        this.updateDeliveryAgents();
        break;
      case 'marketTrends':
        this.updateMarketTrends();
        break;
      default:
        this.updateAllData();
    }
  }

  // Initialize delivery agents if not exists
  initializeDeliveryAgents() {
    if (typeof window === 'undefined') return;

    const existingAgents = localStorage.getItem('deliveryAgents');
    if (!existingAgents) {
      const agents = Array.from({ length: 5 }, () => DataGenerator.generateDeliveryAgent());
      localStorage.setItem('deliveryAgents', JSON.stringify(agents));
    }
  }

  // Get real-time statistics
  getRealTimeStats() {
    if (typeof window === 'undefined') return null;

    const orders = JSON.parse(localStorage.getItem('allOrders') || '[]');
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    const agents = JSON.parse(localStorage.getItem('deliveryAgents') || '[]');

    return {
      totalOrders: orders.length,
      activeOrders: orders.filter((o: any) => ['pending', 'confirmed', 'preparing', 'out_for_delivery'].includes(o.status)).length,
      totalProducts: products.length,
      lowStockProducts: products.filter((p: any) => p.stockQuantity < 10).length,
      activeAgents: agents.filter((a: any) => a.isActive).length,
      totalRevenue: orders.filter((o: any) => o.paymentStatus === 'paid').reduce((sum: number, o: any) => sum + o.total, 0),
      lastUpdated: new Date().toISOString()
    };
  }
}

// Export singleton instance
export const realTimeDataService = RealTimeDataService.getInstance();