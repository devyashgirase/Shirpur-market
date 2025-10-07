// Enhanced Dynamic Data Service
import { apiService, DynamicDataManager } from './apiService';

export class DynamicDataService {
  private static instance: DynamicDataService;
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private subscribers = new Map<string, Function[]>();

  static getInstance(): DynamicDataService {
    if (!this.instance) {
      this.instance = new DynamicDataService();
    }
    return this.instance;
  }

  // Cache with TTL
  private setCache(key: string, data: any, ttlMinutes = 5) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMinutes * 60 * 1000
    });
  }

  private getCache(key: string) {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  // Dynamic Products with real-time updates
  async getProducts(forceRefresh = false) {
    const cacheKey = 'products';
    
    if (!forceRefresh) {
      const cached = this.getCache(cacheKey);
      if (cached) return cached;
    }

    try {
      const products = await apiService.getProducts();
      const enhancedProducts = products.map(product => ({
        ...product,
        lowStock: product.stockQuantity < 10,
        outOfStock: product.stockQuantity === 0,
        discountPrice: this.calculateDynamicDiscount(product),
        trending: this.isProductTrending(product.id),
        lastUpdated: new Date().toISOString()
      }));

      this.setCache(cacheKey, enhancedProducts);
      this.notifySubscribers('products', enhancedProducts);
      return enhancedProducts;
    } catch (error) {
      console.error('Failed to fetch products:', error);
      return this.getCache(cacheKey) || [];
    }
  }

  // Dynamic Orders with status tracking
  async getOrders(forceRefresh = false) {
    const cacheKey = 'orders';
    
    if (!forceRefresh) {
      const cached = this.getCache(cacheKey);
      if (cached) return cached;
    }

    try {
      const orders = await apiService.getOrders();
      const enhancedOrders = orders.map(order => ({
        ...order,
        statusColor: this.getStatusColor(order.status),
        estimatedDelivery: this.calculateDeliveryTime(order),
        canCancel: this.canCancelOrder(order),
        trackingSteps: this.getTrackingSteps(order.status),
        lastUpdated: new Date().toISOString()
      }));

      this.setCache(cacheKey, enhancedOrders);
      this.notifySubscribers('orders', enhancedOrders);
      return enhancedOrders;
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      return this.getCache(cacheKey) || [];
    }
  }

  // Dynamic Analytics
  async getDashboardStats() {
    const cacheKey = 'dashboard-stats';
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    try {
      const [products, orders] = await Promise.all([
        this.getProducts(),
        this.getOrders()
      ]);

      const stats = {
        totalProducts: products.length,
        activeProducts: products.filter(p => p.isActive).length,
        lowStockProducts: products.filter(p => p.lowStock).length,
        outOfStockProducts: products.filter(p => p.outOfStock).length,
        
        totalOrders: orders.length,
        pendingOrders: orders.filter(o => o.status === 'pending').length,
        processingOrders: orders.filter(o => o.status === 'processing').length,
        deliveredOrders: orders.filter(o => o.status === 'delivered').length,
        
        totalRevenue: orders
          .filter(o => o.paymentStatus === 'paid')
          .reduce((sum, o) => sum + o.total, 0),
        
        todayOrders: orders.filter(o => 
          new Date(o.createdAt || '').toDateString() === new Date().toDateString()
        ).length,
        
        averageOrderValue: orders.length > 0 
          ? orders.reduce((sum, o) => sum + o.total, 0) / orders.length 
          : 0,
          
        lastUpdated: new Date().toISOString()
      };

      this.setCache(cacheKey, stats, 2); // 2 minute cache
      return stats;
    } catch (error) {
      console.error('Failed to calculate dashboard stats:', error);
      return this.getDefaultStats();
    }
  }

  // Real-time order updates
  async updateOrderStatus(orderId: number, newStatus: string) {
    try {
      await apiService.updateOrderStatus(orderId, newStatus);
      
      // Update cache
      const orders = this.getCache('orders') || [];
      const updatedOrders = orders.map(order => 
        order.id === orderId 
          ? { 
              ...order, 
              status: newStatus, 
              statusColor: this.getStatusColor(newStatus),
              trackingSteps: this.getTrackingSteps(newStatus),
              lastUpdated: new Date().toISOString()
            }
          : order
      );
      
      this.setCache('orders', updatedOrders);
      this.notifySubscribers('orders', updatedOrders);
      this.notifySubscribers('orderStatusUpdate', { orderId, newStatus });
      
      return true;
    } catch (error) {
      console.error('Failed to update order status:', error);
      return false;
    }
  }

  // Dynamic product stock management
  async updateProductStock(productId: number, quantityChange: number) {
    try {
      await apiService.updateProductStock(productId, quantityChange);
      
      // Update cache
      const products = this.getCache('products') || [];
      const updatedProducts = products.map(product => 
        product.id === productId 
          ? { 
              ...product, 
              stockQuantity: Math.max(0, product.stockQuantity + quantityChange),
              lowStock: (product.stockQuantity + quantityChange) < 10,
              outOfStock: (product.stockQuantity + quantityChange) === 0,
              lastUpdated: new Date().toISOString()
            }
          : product
      );
      
      this.setCache('products', updatedProducts);
      this.notifySubscribers('products', updatedProducts);
      this.notifySubscribers('stockUpdate', { productId, quantityChange });
      
      return true;
    } catch (error) {
      console.error('Failed to update product stock:', error);
      return false;
    }
  }

  // Subscription system for real-time updates
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
    const callbacks = this.subscribers.get(event) || [];
    callbacks.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Error in subscriber callback:', error);
      }
    });
  }

  // Helper methods
  private calculateDynamicDiscount(product: any) {
    // Dynamic pricing logic
    if (product.stockQuantity > 50) return null;
    if (product.stockQuantity < 5) return Math.round(product.price * 0.1); // 10% off for low stock
    return null;
  }

  private isProductTrending(productId: number) {
    // Simple trending logic - can be enhanced with real analytics
    const trendingIds = JSON.parse(localStorage.getItem('trendingProducts') || '[]');
    return trendingIds.includes(productId);
  }

  private getStatusColor(status: string) {
    const colors = {
      'pending': 'orange',
      'processing': 'blue',
      'out_for_delivery': 'purple',
      'delivered': 'green',
      'cancelled': 'red'
    };
    return colors[status] || 'gray';
  }

  private calculateDeliveryTime(order: any) {
    const baseTime = 30; // 30 minutes base
    const now = new Date();
    const estimatedTime = new Date(now.getTime() + baseTime * 60000);
    return estimatedTime.toISOString();
  }

  private canCancelOrder(order: any) {
    return ['pending', 'processing'].includes(order.status);
  }

  private getTrackingSteps(status: string) {
    const allSteps = [
      { name: 'Order Placed', status: 'completed' },
      { name: 'Processing', status: status === 'pending' ? 'pending' : 'completed' },
      { name: 'Out for Delivery', status: ['out_for_delivery', 'delivered'].includes(status) ? 'completed' : 'pending' },
      { name: 'Delivered', status: status === 'delivered' ? 'completed' : 'pending' }
    ];
    return allSteps;
  }

  private getDefaultStats() {
    return {
      totalProducts: 0,
      activeProducts: 0,
      lowStockProducts: 0,
      outOfStockProducts: 0,
      totalOrders: 0,
      pendingOrders: 0,
      processingOrders: 0,
      deliveredOrders: 0,
      totalRevenue: 0,
      todayOrders: 0,
      averageOrderValue: 0,
      lastUpdated: new Date().toISOString()
    };
  }

  // Clear all caches
  clearCache() {
    this.cache.clear();
    DynamicDataManager.clearCache();
  }

  // Force refresh all data
  async refreshAllData() {
    this.clearCache();
    const [products, orders, stats] = await Promise.all([
      this.getProducts(true),
      this.getOrders(true),
      this.getDashboardStats()
    ]);
    
    return { products, orders, stats };
  }
}

export const dynamicDataService = DynamicDataService.getInstance();