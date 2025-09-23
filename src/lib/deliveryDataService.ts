import { apiService, DynamicDataManager, ApiOrder, ApiDeliveryAgent } from './apiService';

export class DeliveryDataService {
  // Get available deliveries with caching
  static async getAvailableDeliveries() {
    return DynamicDataManager.syncData('availableDeliveries', async () => {
      const orders = await apiService.getOrders();
      return orders
        .filter(order => order.status === 'confirmed' || order.status === 'preparing')
        .map(order => ({
          id: order.id,
          orderId: order.orderId,
          customerName: order.customerName,
          customerPhone: order.customerPhone,
          deliveryAddress: order.deliveryAddress,
          total: order.total,
          status: order.status,
          items: order.items || [],
          estimatedEarning: Math.round(order.total * 0.15), // 15% commission
          createdAt: order.createdAt
        }));
    });
  }

  // Get assigned deliveries for current agent
  static async getAssignedDeliveries() {
    const agentId = localStorage.getItem('deliveryAgentId');
    if (!agentId) return [];
    
    return DynamicDataManager.syncData(`assignedDeliveries_${agentId}`, async () => {
      const orders = await apiService.getOrders();
      return orders
        .filter(order => order.status === 'out_for_delivery' && order.deliveryAgentId === parseInt(agentId))
        .map(order => ({
          id: order.id,
          orderId: order.orderId,
          customerName: order.customerName,
          customerPhone: order.customerPhone,
          deliveryAddress: order.deliveryAddress,
          total: order.total,
          status: order.status,
          items: order.items || [],
          estimatedEarning: Math.round(order.total * 0.15),
          createdAt: order.createdAt
        }));
    });
  }



  static getLocalDeliveryTasks() {
    return JSON.parse(localStorage.getItem('deliveryTasks') || '[]');
  }

  // Accept delivery assignment
  static async acceptDelivery(orderId: string): Promise<boolean> {
    try {
      const agentId = localStorage.getItem('deliveryAgentId');
      if (!agentId) return false;
      
      const dbId = parseInt(orderId.replace(/\D/g, '')) || parseInt(orderId);
      
      // Update order status and assign to agent
      await apiService.updateOrderStatus(dbId, 'out_for_delivery');
      
      // Store task locally
      const task = {
        id: `TASK_${Date.now()}`,
        orderId,
        agentId: parseInt(agentId),
        status: 'accepted',
        acceptedAt: new Date().toISOString()
      };
      
      const tasks = this.getLocalDeliveryTasks();
      tasks.push(task);
      localStorage.setItem('deliveryTasks', JSON.stringify(tasks));
      
      // Update cached data
      const cachedDeliveries = DynamicDataManager.getData('availableDeliveries') || [];
      const updatedDeliveries = cachedDeliveries.filter((d: any) => d.orderId !== orderId);
      DynamicDataManager.saveData('availableDeliveries', updatedDeliveries);
      
      return true;
    } catch (error) {
      console.error('Delivery: Failed to accept delivery', error);
      return false;
    }
  }

  // Complete delivery
  static async completeDelivery(orderId: string): Promise<boolean> {
    try {
      const dbId = parseInt(orderId.replace(/\D/g, '')) || parseInt(orderId);
      await apiService.updateOrderStatus(dbId, 'delivered');
      
      // Update local tasks
      const tasks = this.getLocalDeliveryTasks();
      const task = tasks.find((t: any) => t.orderId === orderId);
      if (task) {
        task.status = 'completed';
        task.completedAt = new Date().toISOString();
        localStorage.setItem('deliveryTasks', JSON.stringify(tasks));
      }
      
      return true;
    } catch (error) {
      console.error('Delivery: Failed to complete delivery', error);
      return false;
    }
  }

  // Update delivery agent location
  static async updateLocation(lat: number, lng: number): Promise<boolean> {
    try {
      const agentId = localStorage.getItem('deliveryAgentId');
      if (!agentId) return false;
      
      await apiService.updateDeliveryLocation(parseInt(agentId), lat, lng);
      
      // Store location locally
      DynamicDataManager.saveData('currentLocation', { lat, lng, timestamp: Date.now() });
      
      return true;
    } catch (error) {
      console.error('Delivery: Failed to update location', error);
      return false;
    }
  }

  // Get delivery agent profile
  static async getAgentProfile(): Promise<ApiDeliveryAgent | null> {
    const agentId = localStorage.getItem('deliveryAgentId');
    if (!agentId) return null;
    
    try {
      return await apiService.getDeliveryAgent(parseInt(agentId));
    } catch (error) {
      console.error('Failed to get agent profile:', error);
      return DynamicDataManager.getData('agentProfile');
    }
  }

  // Save agent profile
  static async saveAgentProfile(agentData: Omit<ApiDeliveryAgent, 'id' | 'createdAt'>): Promise<ApiDeliveryAgent | null> {
    try {
      const agent = await apiService.createDeliveryAgent(agentData);
      DynamicDataManager.saveData('agentProfile', agent);
      localStorage.setItem('deliveryAgentId', agent.id!.toString());
      return agent;
    } catch (error) {
      console.error('Failed to save agent profile:', error);
      return null;
    }
  }

  // Calculate delivery metrics
  static async getDeliveryMetrics(): Promise<any> {
    try {
      const agentId = localStorage.getItem('deliveryAgentId');
      if (!agentId) return this.getDefaultMetrics();
      
      const [available, assigned] = await Promise.all([
        this.getAvailableDeliveries(),
        this.getAssignedDeliveries()
      ]);
      
      const tasks = this.getLocalDeliveryTasks();
      const today = new Date().toDateString();
      
      const todaysTasks = tasks.filter((t: any) => {
        const taskDate = new Date(t.acceptedAt || t.createdAt).toDateString();
        return taskDate === today;
      });
      
      const completedToday = todaysTasks.filter((t: any) => t.status === 'completed').length;
      const totalToday = todaysTasks.length;
      
      return {
        activeTasks: assigned.length,
        availableOrders: available.length,
        todaysDeliveries: completedToday,
        todaysEarnings: todaysTasks.reduce((sum: number, t: any) => {
          const delivery = assigned.find((d: any) => d.orderId === t.orderId);
          return sum + (delivery?.estimatedEarning || 0);
        }, 0),
        completionRate: totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0,
        totalEarnings: tasks.reduce((sum: number, t: any) => {
          if (t.status === 'completed') {
            return sum + (t.estimatedEarning || 50); // Default earning
          }
          return sum;
        }, 0)
      };
    } catch (error) {
      console.error('Failed to get delivery metrics:', error);
      return this.getDefaultMetrics();
    }
  }

  // Get default metrics when data is unavailable
  private static getDefaultMetrics() {
    return {
      activeTasks: 0,
      availableOrders: 0,
      todaysDeliveries: 0,
      todaysEarnings: 0,
      completionRate: 0,
      totalEarnings: 0
    };
  }

  // Clear delivery session
  static clearDeliverySession(): void {
    const keys = ['deliveryTasks', 'currentLocation', 'agentProfile', 'availableDeliveries'];
    keys.forEach(key => localStorage.removeItem(key));
    localStorage.removeItem('deliveryAgentId');
  }
}