import { DatabaseService } from './databaseService';

interface AdminStats {
  totalOrders: number;
  totalCustomers: number;
  totalRevenue: number;
  todaysOrders: number;
  todaysRevenue: number;
  paidOrders: number;
  pendingPayments: number;
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
}

class AdminRealTimeService {
  private static instance: AdminRealTimeService;
  private subscribers: Map<string, Function[]> = new Map();
  private updateInterval: NodeJS.Timeout | null = null;

  static getInstance(): AdminRealTimeService {
    if (!AdminRealTimeService.instance) {
      AdminRealTimeService.instance = new AdminRealTimeService();
    }
    return AdminRealTimeService.instance;
  }

  async fetchRealTimeStats(): Promise<AdminStats> {
    try {
      const orders = await DatabaseService.getOrders();
      const today = new Date().toDateString();

      const totalOrders = orders.length;
      const uniqueCustomers = new Set(orders.map(order => order.customerPhone)).size;
      const paidOrders = orders.filter(order => order.paymentStatus === 'paid');
      const totalRevenue = paidOrders.reduce((sum, order) => sum + order.total, 0);
      
      const todaysOrders = orders.filter(order => 
        new Date(order.createdAt).toDateString() === today
      );
      const todaysRevenue = todaysOrders
        .filter(order => order.paymentStatus === 'paid')
        .reduce((sum, order) => sum + order.total, 0);

      return {
        totalOrders,
        totalCustomers: uniqueCustomers,
        totalRevenue,
        todaysOrders: todaysOrders.length,
        todaysRevenue,
        paidOrders: paidOrders.length,
        pendingPayments: orders.filter(order => order.paymentStatus === 'pending').length
      };
    } catch (error) {
      console.error('Failed to fetch real-time stats:', error);
      return {
        totalOrders: 0,
        totalCustomers: 0,
        totalRevenue: 0,
        todaysOrders: 0,
        todaysRevenue: 0,
        paidOrders: 0,
        pendingPayments: 0
      };
    }
  }

  async fetchRecentOrders(): Promise<CustomerOrder[]> {
    try {
      const orders = await DatabaseService.getOrders();
      
      return orders
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10)
        .map(order => ({
          orderId: order.orderId || `ORD-${order.id}`,
          customerName: order.customerName,
          customerPhone: order.customerPhone,
          total: order.total,
          status: order.status,
          paymentStatus: order.paymentStatus,
          createdAt: order.createdAt,
          itemCount: order.items?.length || 0
        }));
    } catch (error) {
      console.error('Failed to fetch recent orders:', error);
      return [];
    }
  }

  startRealTimeUpdates() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    this.updateInterval = setInterval(async () => {
      const stats = await this.fetchRealTimeStats();
      const orders = await this.fetchRecentOrders();
      
      this.notifySubscribers('statsUpdate', stats);
      this.notifySubscribers('ordersUpdate', orders);
    }, 5000); // Update every 5 seconds
  }

  stopRealTimeUpdates() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
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

export const adminRealTimeService = AdminRealTimeService.getInstance();
export type { AdminStats, CustomerOrder };