import { apiService, DynamicDataManager, ApiProduct, ApiOrder, ApiCustomer, ApiDeliveryAgent, ApiCategory } from './apiService';

export class AdminDataService {
  // Orders Management with dynamic caching
  static async getAdminOrders() {
    return DynamicDataManager.syncData('adminOrders', async () => {
      const orders = await apiService.getOrders();
      return orders.map(order => ({
        id: order.id,
        orderId: order.orderId,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        deliveryAddress: order.deliveryAddress,
        total: order.total,
        status: order.status,
        paymentStatus: order.paymentStatus,
        items: order.items || [],
        createdAt: order.createdAt || new Date().toISOString(),
        updatedAt: order.updatedAt
      })).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    });
  }

  // Products Management with dynamic caching
  static async getAdminProducts(): Promise<ApiProduct[]> {
    return DynamicDataManager.syncData('adminProducts', async () => {
      return await apiService.getProducts();
    });
  }

  // Create new product
  static async createProduct(productData: Omit<ApiProduct, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiProduct | null> {
    try {
      const createdProduct = await apiService.createProduct(productData);
      
      // Update cached products
      const cachedProducts = DynamicDataManager.getData('adminProducts') || [];
      cachedProducts.unshift(createdProduct);
      DynamicDataManager.saveData('adminProducts', cachedProducts);
      
      return createdProduct;
    } catch (error) {
      console.error('Admin: Failed to create product', error);
      return null;
    }
  }

  // Update product
  static async updateProduct(id: number, updates: Partial<ApiProduct>): Promise<ApiProduct | null> {
    try {
      const updatedProduct = await apiService.updateProduct(id, updates);
      
      // Update cached products
      const cachedProducts = DynamicDataManager.getData('adminProducts') || [];
      const index = cachedProducts.findIndex((p: ApiProduct) => p.id === id);
      if (index !== -1) {
        cachedProducts[index] = updatedProduct;
        DynamicDataManager.saveData('adminProducts', cachedProducts);
      }
      
      return updatedProduct;
    } catch (error) {
      console.error('Admin: Failed to update product', error);
      return null;
    }
  }

  // Delete product
  static async deleteProduct(id: number): Promise<boolean> {
    try {
      await apiService.deleteProduct(id);
      
      // Update cached products
      const cachedProducts = DynamicDataManager.getData('adminProducts') || [];
      const filteredProducts = cachedProducts.filter((p: ApiProduct) => p.id !== id);
      DynamicDataManager.saveData('adminProducts', filteredProducts);
      
      return true;
    } catch (error) {
      console.error('Admin: Failed to delete product', error);
      return false;
    }
  }

  // Update order status with caching
  static async updateOrderStatus(orderId: number, status: string): Promise<boolean> {
    try {
      await apiService.updateOrderStatus(orderId, status);
      
      // Update cached orders
      const cachedOrders = DynamicDataManager.getData('adminOrders') || [];
      const order = cachedOrders.find((o: any) => o.id === orderId);
      if (order) {
        order.status = status;
        order.updatedAt = new Date().toISOString();
        DynamicDataManager.saveData('adminOrders', cachedOrders);
      }
      
      return true;
    } catch (error) {
      console.error('Admin: Failed to update order status', error);
      return false;
    }
  }

  // Get customers with caching
  static async getCustomers(): Promise<ApiCustomer[]> {
    return DynamicDataManager.syncData('adminCustomers', async () => {
      return await apiService.getCustomers();
    });
  }

  // Get delivery agents with caching
  static async getDeliveryAgents(): Promise<ApiDeliveryAgent[]> {
    return DynamicDataManager.syncData('adminDeliveryAgents', async () => {
      return await apiService.getDeliveryAgents();
    });
  }

  // Create delivery agent
  static async createDeliveryAgent(agentData: Omit<ApiDeliveryAgent, 'id' | 'createdAt'>): Promise<ApiDeliveryAgent | null> {
    try {
      const agent = await apiService.createDeliveryAgent(agentData);
      
      // Update cached agents
      const cachedAgents = DynamicDataManager.getData('adminDeliveryAgents') || [];
      cachedAgents.unshift(agent);
      DynamicDataManager.saveData('adminDeliveryAgents', cachedAgents);
      
      return agent;
    } catch (error) {
      console.error('Admin: Failed to create delivery agent', error);
      return null;
    }
  }

  // Get categories with caching
  static async getCategories(): Promise<ApiCategory[]> {
    return DynamicDataManager.syncData('adminCategories', async () => {
      return await apiService.getCategories();
    });
  }

  // Create category
  static async createCategory(categoryData: Omit<ApiCategory, 'id' | 'createdAt'>): Promise<ApiCategory | null> {
    try {
      const category = await apiService.createCategory(categoryData);
      
      // Update cached categories
      const cachedCategories = DynamicDataManager.getData('adminCategories') || [];
      cachedCategories.unshift(category);
      DynamicDataManager.saveData('adminCategories', cachedCategories);
      
      return category;
    } catch (error) {
      console.error('Admin: Failed to create category', error);
      return null;
    }
  }

  // Get dashboard analytics
  static async getDashboardStats(): Promise<any> {
    return DynamicDataManager.syncData('dashboardStats', async () => {
      return await apiService.getDashboardStats();
    });
  }

  // Get orders by status
  static async getOrdersByStatus(status: string): Promise<any[]> {
    const orders = await this.getAdminOrders();
    return orders.filter(order => order.status === status);
  }

  // Get orders by date range
  static async getOrdersByDateRange(startDate: string, endDate: string): Promise<any[]> {
    const orders = await this.getAdminOrders();
    return orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= new Date(startDate) && orderDate <= new Date(endDate);
    });
  }

  // Calculate comprehensive admin metrics
  static getAdminMetrics(orders: any[], products: any[] = []) {
    const now = new Date();
    const today = now.toDateString();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    
    const todayOrders = orders.filter(o => new Date(o.createdAt).toDateString() === today);
    const monthlyOrders = orders.filter(o => {
      const orderDate = new Date(o.createdAt);
      return orderDate.getMonth() === thisMonth && orderDate.getFullYear() === thisYear;
    });
    
    const deliveredOrders = orders.filter(o => o.status === 'delivered');
    const paidOrders = orders.filter(o => o.paymentStatus === 'paid');
    
    return {
      // Order Statistics
      totalOrders: orders.length,
      todaysOrders: todayOrders.length,
      monthlyOrders: monthlyOrders.length,
      pendingOrders: orders.filter(o => o.status === 'pending').length,
      confirmedOrders: orders.filter(o => o.status === 'confirmed').length,
      preparingOrders: orders.filter(o => o.status === 'preparing').length,
      outForDelivery: orders.filter(o => o.status === 'out_for_delivery').length,
      deliveredOrders: deliveredOrders.length,
      cancelledOrders: orders.filter(o => o.status === 'cancelled').length,
      
      // Revenue Statistics
      totalRevenue: paidOrders.reduce((sum, o) => sum + o.total, 0),
      todaysRevenue: todayOrders.filter(o => o.paymentStatus === 'paid').reduce((sum, o) => sum + o.total, 0),
      monthlyRevenue: monthlyOrders.filter(o => o.paymentStatus === 'paid').reduce((sum, o) => sum + o.total, 0),
      averageOrderValue: orders.length > 0 ? orders.reduce((sum, o) => sum + o.total, 0) / orders.length : 0,
      
      // Product Statistics
      totalProducts: products.length,
      activeProducts: products.filter(p => p.isActive).length,
      inactiveProducts: products.filter(p => !p.isActive).length,
      lowStockProducts: products.filter(p => p.stockQuantity < 10).length,
      outOfStockProducts: products.filter(p => p.stockQuantity === 0).length,
      
      // Performance Metrics
      orderFulfillmentRate: orders.length > 0 ? (deliveredOrders.length / orders.length) * 100 : 0,
      paymentSuccessRate: orders.length > 0 ? (paidOrders.length / orders.length) * 100 : 0,
      
      // Growth Metrics (compared to previous month)
      orderGrowth: this.calculateMonthlyGrowth(orders, 'count'),
      revenueGrowth: this.calculateMonthlyGrowth(paidOrders, 'revenue')
    };
  }

  // Calculate monthly growth rate
  private static calculateMonthlyGrowth(orders: any[], type: 'count' | 'revenue'): number {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    
    const currentMonthOrders = orders.filter(o => {
      const orderDate = new Date(o.createdAt);
      return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
    });
    
    const previousMonthOrders = orders.filter(o => {
      const orderDate = new Date(o.createdAt);
      return orderDate.getMonth() === previousMonth && orderDate.getFullYear() === previousYear;
    });
    
    const currentValue = type === 'count' 
      ? currentMonthOrders.length 
      : currentMonthOrders.reduce((sum, o) => sum + o.total, 0);
      
    const previousValue = type === 'count'
      ? previousMonthOrders.length
      : previousMonthOrders.reduce((sum, o) => sum + o.total, 0);
    
    return previousValue > 0 ? ((currentValue - previousValue) / previousValue) * 100 : 0;
  }

  // Refresh all admin data
  static async refreshAllData(): Promise<void> {
    try {
      await Promise.all([
        this.getAdminOrders(),
        this.getAdminProducts(),
        this.getCustomers(),
        this.getDeliveryAgents(),
        this.getCategories(),
        this.getDashboardStats()
      ]);
    } catch (error) {
      console.error('Failed to refresh admin data:', error);
    }
  }

  // Clear admin cache
  static clearAdminCache(): void {
    const keys = ['adminOrders', 'adminProducts', 'adminCustomers', 'adminDeliveryAgents', 'adminCategories', 'dashboardStats'];
    keys.forEach(key => localStorage.removeItem(key));
  }

  // Save data to database and cache
  static async saveData(type: string, data: any): Promise<any> {
    try {
      let result;
      
      switch (type) {
        case 'product':
          result = await this.createProduct(data);
          break;
        case 'order':
          result = await apiService.createOrder(data);
          break;
        case 'customer':
          result = await apiService.createCustomer(data);
          break;
        case 'deliveryAgent':
          result = await this.createDeliveryAgent(data);
          break;
        case 'category':
          result = await this.createCategory(data);
          break;
        default:
          throw new Error(`Unknown data type: ${type}`);
      }
      
      return result;
    } catch (error) {
      console.error(`Failed to save ${type}:`, error);
      return null;
    }
  }

  // Get all data dynamically
  static async getAllData(): Promise<any> {
    try {
      const [orders, products, customers, agents, categories] = await Promise.all([
        this.getAdminOrders(),
        this.getAdminProducts(),
        this.getCustomers(),
        this.getDeliveryAgents(),
        this.getCategories()
      ]);
      
      return {
        orders,
        products,
        customers,
        deliveryAgents: agents,
        categories,
        metrics: this.getAdminMetrics(orders, products)
      };
    } catch (error) {
      console.error('Failed to get all admin data:', error);
      return {
        orders: [],
        products: [],
        customers: [],
        deliveryAgents: [],
        categories: [],
        metrics: this.getAdminMetrics([], [])
      };
    }
  }
}