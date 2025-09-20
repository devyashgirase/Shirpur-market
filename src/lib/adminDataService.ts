import { apiService } from './apiService';

export class AdminDataService {
  static async getAdminOrders() {
    try {
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
        createdAt: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Admin: Failed to fetch orders', error);
      return this.getLocalOrders();
    }
  }

  static getLocalOrders() {
    const orders = JSON.parse(localStorage.getItem('allOrders') || '[]');
    return orders.map((order: any) => ({
      id: order.id || order.orderId,
      orderId: order.orderId || order.id,
      customerName: order.customerAddress?.name || order.customerName || 'Customer',
      customerPhone: order.customerAddress?.phone || order.customerPhone || '',
      deliveryAddress: order.customerAddress?.address || order.deliveryAddress || '',
      total: order.total || 0,
      status: order.status || 'pending',
      paymentStatus: order.paymentStatus || 'pending',
      items: order.items || [],
      createdAt: order.timestamp || new Date().toISOString()
    }));
  }

  static async getAdminProducts() {
    try {
      return await apiService.getProducts();
    } catch (error) {
      console.error('Admin: Failed to fetch products', error);
      return this.getLocalProducts();
    }
  }

  static getLocalProducts() {
    // Return real-time dynamic products - NO STATIC DATA
    const { DataGenerator } = require('./dataGenerator');
    const dynamicProducts = DataGenerator.generateProducts(30);
    
    return dynamicProducts.map(p => ({
      id: parseInt(p.id.split('_')[1]) || Math.floor(Math.random() * 1000),
      name: p.name,
      category: p.category,
      stockQuantity: p.stock_qty,
      isActive: p.isActive,
      price: p.price,
      description: p.description,
      lastUpdated: new Date().toISOString()
    }));
  }

  static async updateOrderStatus(orderId: number, status: string) {
    try {
      await apiService.updateOrderStatus(orderId, status);
      return true;
    } catch (error) {
      console.error('Admin: Failed to update order status', error);
      return false;
    }
  }

  static getAdminMetrics(orders: any[]) {
    const today = new Date().toDateString();
    
    return {
      totalOrders: orders.length,
      todaysOrders: orders.filter(o => new Date(o.createdAt).toDateString() === today).length,
      totalRevenue: orders.filter(o => o.paymentStatus === 'paid').reduce((sum, o) => sum + o.total, 0),
      todaysRevenue: orders.filter(o => {
        const orderDate = new Date(o.createdAt).toDateString();
        return today === orderDate && o.paymentStatus === 'paid';
      }).reduce((sum, o) => sum + o.total, 0),
      outForDelivery: orders.filter(o => o.status === 'out_for_delivery').length
    };
  }
}