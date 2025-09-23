import { apiService } from './apiService';

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

  startRealTimeUpdates() {
    if (this.updateInterval) return;

    this.updateInterval = setInterval(() => {
      this.updateAllData();
    }, 30000); // Update every 30 seconds

    this.updateAllData();
  }

  stopRealTimeUpdates() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  subscribe(dataType: string, callback: Function) {
    if (!this.subscribers.has(dataType)) {
      this.subscribers.set(dataType, []);
    }
    this.subscribers.get(dataType)!.push(callback);
  }

  unsubscribe(dataType: string, callback: Function) {
    const callbacks = this.subscribers.get(dataType);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  private notifySubscribers(dataType: string, data: any) {
    const callbacks = this.subscribers.get(dataType);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  private async updateAllData() {
    await this.updateProducts();
    await this.updateOrders();
  }

  private async updateProducts() {
    try {
      const products = await apiService.getProducts();
      this.notifySubscribers('products', products);
    } catch (error) {
      console.error('Failed to update products:', error);
    }
  }

  private async updateOrders() {
    try {
      const orders = await apiService.getOrders();
      this.notifySubscribers('orders', orders);
    } catch (error) {
      console.error('Failed to update orders:', error);
    }
  }

  async getFreshData(dataType: string) {
    switch (dataType) {
      case 'products':
        await this.updateProducts();
        break;
      case 'orders':
        await this.updateOrders();
        break;
      default:
        await this.updateAllData();
    }
  }

  initializeDeliveryAgents() {
    // Empty method for compatibility - no hardcoded data initialization
    console.log('Delivery agents should be managed through database/API');
  }

  getRealTimeStats() {
    // Return empty stats for database-only approach
    return {
      totalOrders: 0,
      activeOrders: 0,
      totalProducts: 0,
      lowStockProducts: 0,
      activeAgents: 0,
      totalRevenue: 0,
      lastUpdated: new Date().toISOString()
    };
  }
}

export const realTimeDataService = RealTimeDataService.getInstance();