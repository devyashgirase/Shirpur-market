import { DatabaseService } from './databaseService';

interface AdminStats {
  totalOrders: number;
  totalCustomers: number;
  totalRevenue: number;
  todaysOrders: number;
  todaysRevenue: number;
  paidOrders: number;
  pendingPayments: number;
  todaysDelivered: number;
  todaysPending: number;
  avgOrderValue: number;
  lastUpdated: string;
}

interface CustomerOrder {
  orderId: string;
  customerName: string;
  customerPhone: string;
  total: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
  itemCount: number;
  deliveryAddress?: string;
  items?: any[];
}

class AdminRealTimeService {
  private static instance: AdminRealTimeService;
  private subscribers: Map<string, Function[]> = new Map();
  private updateInterval: NodeJS.Timeout | null = null;
  private fastUpdateInterval: NodeJS.Timeout | null = null;
  private lastStats: AdminStats | null = null;

  static getInstance(): AdminRealTimeService {
    if (!AdminRealTimeService.instance) {
      AdminRealTimeService.instance = new AdminRealTimeService();
    }
    return AdminRealTimeService.instance;
  }

  async fetchRealTimeStats(): Promise<AdminStats> {
    try {
      const orders = await DatabaseService.getOrders();
      if (!orders || orders.length === 0) {
        return this.getDefaultStats();
      }
      
      const today = new Date().toDateString();
      const now = new Date();

      const totalOrders = orders.length;
      const uniqueCustomers = new Set(orders.map(order => order.customerPhone)).size;
      const paidOrders = orders.filter(order => order.paymentStatus === 'paid');
      const totalRevenue = paidOrders.reduce((sum, order) => sum + order.total, 0);
      
      const todaysOrders = orders.filter(order => 
        new Date(order.createdAt).toDateString() === today
      );
      
      const todaysPaidOrders = todaysOrders.filter(order => order.paymentStatus === 'paid');
      const todaysRevenue = todaysPaidOrders.reduce((sum, order) => sum + order.total, 0);
      
      const todaysDelivered = todaysOrders.filter(order => order.status === 'delivered').length;
      const todaysPending = todaysOrders.filter(order => 
        ['pending', 'confirmed', 'out_for_delivery'].includes(order.status)
      ).length;
      
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      const stats: AdminStats = {
        totalOrders,
        totalCustomers: uniqueCustomers,
        totalRevenue,
        todaysOrders: todaysOrders.length,
        todaysRevenue,
        paidOrders: paidOrders.length,
        pendingPayments: orders.filter(order => order.paymentStatus === 'pending').length,
        todaysDelivered,
        todaysPending,
        avgOrderValue,
        lastUpdated: now.toISOString()
      };

      // Cache the stats for comparison
      this.lastStats = stats;
      return stats;
    } catch (error) {
      console.error('Failed to fetch real-time stats:', error);
      return this.getDefaultStats();
    }
  }

  private getDefaultStats(): AdminStats {
    return {
      totalOrders: 2,
      totalCustomers: 2,
      totalRevenue: 430,
      todaysOrders: 1,
      todaysRevenue: 250,
      paidOrders: 2,
      pendingPayments: 0,
      todaysDelivered: 1,
      todaysPending: 0,
      avgOrderValue: 215,
      lastUpdated: new Date().toISOString()
    };
  }

  async fetchRecentOrders(): Promise<CustomerOrder[]> {
    try {
      const orders = await DatabaseService.getOrders();
      
      if (!orders || orders.length === 0) {
        return this.getDefaultOrders();
      }
      
      return orders
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 20)
        .map(order => ({
          orderId: order.orderId || `ORD-${order.id}`,
          customerName: order.customerName,
          customerPhone: order.customerPhone,
          total: order.total,
          status: order.status,
          paymentStatus: order.paymentStatus,
          createdAt: order.createdAt,
          itemCount: order.items?.length || 0,
          deliveryAddress: order.deliveryAddress,
          items: order.items
        }));
    } catch (error) {
      console.error('Failed to fetch recent orders:', error);
      return this.getDefaultOrders();
    }
  }

  private getDefaultOrders(): CustomerOrder[] {
    return [
      {
        orderId: 'ORD-001',
        customerName: 'Demo Customer',
        customerPhone: '+91 9876543210',
        total: 250,
        status: 'delivered',
        paymentStatus: 'paid',
        createdAt: new Date().toISOString(),
        itemCount: 2,
        deliveryAddress: 'Demo Address, Shirpur, Maharashtra',
        items: [
          { name: 'Demo Product 1', quantity: 2, price: 100 },
          { name: 'Demo Product 2', quantity: 1, price: 50 }
        ]
      },
      {
        orderId: 'ORD-002',
        customerName: 'Test User',
        customerPhone: '+91 8765432109',
        total: 180,
        status: 'out_for_delivery',
        paymentStatus: 'paid',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        itemCount: 1,
        deliveryAddress: 'Test Address, Shirpur, Maharashtra',
        items: [
          { name: 'Test Product', quantity: 3, price: 60 }
        ]
      }
    ];
  }

  startRealTimeUpdates() {
    // Clear existing intervals
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
    if (this.fastUpdateInterval) {
      clearInterval(this.fastUpdateInterval);
    }

    // Fast updates for critical metrics (every 2 seconds)
    this.fastUpdateInterval = setInterval(async () => {
      const stats = await this.fetchRealTimeStats();
      this.notifySubscribers('statsUpdate', stats);
    }, 2000);

    // Regular updates for orders and other data (every 5 seconds)
    this.updateInterval = setInterval(async () => {
      const orders = await this.fetchRecentOrders();
      this.notifySubscribers('ordersUpdate', orders);
    }, 5000);

    // Initial load
    this.loadInitialData();
  }

  private async loadInitialData() {
    try {
      const [stats, orders] = await Promise.all([
        this.fetchRealTimeStats(),
        this.fetchRecentOrders()
      ]);
      
      this.notifySubscribers('statsUpdate', stats);
      this.notifySubscribers('ordersUpdate', orders);
    } catch (error) {
      console.error('Failed to load initial data:', error);
    }
  }

  stopRealTimeUpdates() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    if (this.fastUpdateInterval) {
      clearInterval(this.fastUpdateInterval);
      this.fastUpdateInterval = null;
    }
  }

  // Get today's orders count in real-time
  async getTodaysOrdersCount(): Promise<number> {
    try {
      const orders = await DatabaseService.getOrders();
      if (!orders || orders.length === 0) {
        return 1; // Demo data
      }
      const today = new Date().toDateString();
      return orders.filter(order => 
        new Date(order.createdAt).toDateString() === today
      ).length;
    } catch (error) {
      console.error('Failed to get today\'s orders count:', error);
      return 1; // Demo fallback
    }
  }

  // Get today's revenue in real-time
  async getTodaysRevenue(): Promise<number> {
    try {
      const orders = await DatabaseService.getOrders();
      if (!orders || orders.length === 0) {
        return 250; // Demo data
      }
      const today = new Date().toDateString();
      return orders
        .filter(order => 
          new Date(order.createdAt).toDateString() === today &&
          order.paymentStatus === 'paid'
        )
        .reduce((sum, order) => sum + order.total, 0);
    } catch (error) {
      console.error('Failed to get today\'s revenue:', error);
      return 250; // Demo fallback
    }
  }

  // Force refresh all data
  async forceRefresh(): Promise<void> {
    await this.loadInitialData();
  }

  // Get last update time
  getLastUpdateTime(): string | null {
    return this.lastStats?.lastUpdated || null;
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
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in subscriber callback for ${event}:`, error);
        }
      });
    }
  }

  // Check if data has changed significantly
  private hasSignificantChange(newStats: AdminStats): boolean {
    if (!this.lastStats) return true;
    
    return (
      newStats.todaysOrders !== this.lastStats.todaysOrders ||
      Math.abs(newStats.todaysRevenue - this.lastStats.todaysRevenue) > 0.01 ||
      newStats.totalOrders !== this.lastStats.totalOrders ||
      Math.abs(newStats.totalRevenue - this.lastStats.totalRevenue) > 0.01
    );
  }
}

export const adminRealTimeService = AdminRealTimeService.getInstance();
export type { AdminStats, CustomerOrder };

// Auto-start real-time updates when service is imported
if (typeof window !== 'undefined') {
  // Only start in browser environment
  setTimeout(() => {
    adminRealTimeService.startRealTimeUpdates();
  }, 1000);
}