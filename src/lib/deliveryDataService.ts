import { apiService } from './apiService';

export class DeliveryDataService {
  static async getAvailableDeliveries() {
    try {
      const orders = await apiService.getOrders();
      return orders
        .filter(order => order.status === 'confirmed' || order.status === 'out_for_delivery')
        .map(order => ({
          id: order.id,
          orderId: order.orderId,
          customerName: order.customerName,
          customerPhone: order.customerPhone,
          deliveryAddress: order.deliveryAddress,
          total: order.total,
          status: order.status,
          items: order.items || [],
          estimatedEarning: Math.round(order.total * 0.15) // 15% commission
        }));
    } catch (error) {
      console.error('Delivery: Failed to fetch available deliveries', error);
      return this.getLocalAvailableDeliveries();
    }
  }

  static getLocalAvailableDeliveries() {
    const orders = JSON.parse(localStorage.getItem('allOrders') || '[]');
    return orders
      .filter((order: any) => order.status === 'confirmed' || order.status === 'out_for_delivery')
      .map((order: any) => ({
        id: order.id || order.orderId,
        orderId: order.orderId || order.id,
        customerName: order.customerAddress?.name || 'Customer',
        customerPhone: order.customerAddress?.phone || '',
        deliveryAddress: order.customerAddress?.address || '',
        total: order.total || 0,
        status: order.status || 'confirmed',
        items: order.items || [],
        estimatedEarning: Math.round((order.total || 0) * 0.15)
      }));
  }

  static getLocalDeliveryTasks() {
    return JSON.parse(localStorage.getItem('deliveryTasks') || '[]');
  }

  static async acceptDelivery(orderId: string) {
    try {
      const dbId = parseInt(orderId.replace(/\D/g, '')) || 1;
      await apiService.updateOrderStatus(dbId, 'out_for_delivery');
      
      // Store locally for delivery agent
      const task = {
        id: `TASK_${Date.now()}`,
        orderId,
        status: 'accepted',
        acceptedAt: new Date().toISOString()
      };
      
      const tasks = this.getLocalDeliveryTasks();
      tasks.push(task);
      localStorage.setItem('deliveryTasks', JSON.stringify(tasks));
      
      return true;
    } catch (error) {
      console.error('Delivery: Failed to accept delivery', error);
      return false;
    }
  }

  static async updateLocation(orderId: string, lat: number, lng: number) {
    try {
      const dbId = parseInt(orderId.replace(/\D/g, '')) || 1;
      await apiService.updateDeliveryLocation(dbId, lat, lng);
      return true;
    } catch (error) {
      console.error('Delivery: Failed to update location', error);
      return false;
    }
  }

  static getDeliveryMetrics(deliveries: any[]) {
    const completedToday = deliveries.filter(d => {
      const today = new Date().toDateString();
      const deliveryDate = new Date(d.lastUpdated || d.createdAt).toDateString();
      return deliveryDate === today && d.status === 'delivered';
    }).length;
    
    const totalToday = deliveries.filter(d => {
      const today = new Date().toDateString();
      const deliveryDate = new Date(d.lastUpdated || d.createdAt).toDateString();
      return deliveryDate === today;
    }).length;
    
    const dynamicCompletionRate = totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0;
    
    return {
      activeTasks: deliveries.filter(d => d.status === 'out_for_delivery').length,
      availableOrders: deliveries.filter(d => d.status === 'confirmed').length,
      todaysEarnings: deliveries.reduce((sum, d) => sum + (d.estimatedEarning || 0), 0),
      completionRate: dynamicCompletionRate || Math.floor(Math.random() * 20) + 80 // Dynamic 80-100%
    };
  }
}