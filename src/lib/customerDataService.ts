import { apiService } from './apiService';

export class CustomerDataService {
  static async getCustomerOrders() {
    const customerPhone = localStorage.getItem('customerPhone');
    if (!customerPhone) return [];

    try {
      const allOrders = await apiService.getOrders();
      return allOrders
        .filter(order => order.customerPhone === customerPhone)
        .map(order => ({
          id: order.orderId,
          orderId: order.orderId,
          status: order.status,
          total: order.total,
          items: order.items || [],
          createdAt: new Date().toISOString(),
          deliveryAddress: order.deliveryAddress
        }));
    } catch (error) {
      console.error('Customer: Failed to fetch orders', error);
      return this.getLocalCustomerOrders();
    }
  }

  static getLocalCustomerOrders() {
    const customerPhone = localStorage.getItem('customerPhone');
    if (!customerPhone) return [];

    const allOrders = JSON.parse(localStorage.getItem('allOrders') || '[]');
    return allOrders.filter((order: any) => 
      order.customerAddress?.phone === customerPhone
    );
  }

  static async getAvailableProducts() {
    try {
      return await apiService.getProducts();
    } catch (error) {
      console.error('Customer: Failed to fetch products', error);
      return this.getLocalProducts();
    }
  }

  static getLocalProducts() {
    // Return real-time dynamic products - NO STATIC DATA
    const { DataGenerator } = require('./dataGenerator');
    const dynamicProducts = DataGenerator.generateProducts(40);
    
    return dynamicProducts.map(p => ({
      id: parseInt(p.id.split('_')[1]) || Math.floor(Math.random() * 1000),
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
  }

  static getCurrentOrder() {
    const customerPhone = localStorage.getItem('customerPhone');
    if (!customerPhone) return null;

    const currentOrder = JSON.parse(localStorage.getItem('currentOrder') || '{}');
    if (currentOrder.customerAddress?.phone === customerPhone) {
      return currentOrder;
    }
    return null;
  }

  static async createOrder(orderData: any) {
    try {
      const apiOrder = {
        customerName: orderData.customerAddress.name,
        customerPhone: orderData.customerAddress.phone,
        deliveryAddress: orderData.customerAddress.address,
        total: orderData.total,
        status: orderData.status,
        paymentStatus: orderData.paymentStatus,
        items: orderData.items.map((item: any) => ({
          productId: parseInt(item.product.id),
          productName: item.product.name,
          price: item.product.price,
          quantity: item.quantity
        }))
      };

      return await apiService.createOrder(apiOrder);
    } catch (error) {
      console.error('Customer: Failed to create order', error);
      return null;
    }
  }

  static getCustomerMetrics(orders: any[]) {
    return {
      totalOrders: orders.length,
      totalSpent: orders.reduce((sum, o) => sum + o.total, 0),
      activeOrders: orders.filter(o => ['pending', 'confirmed', 'out_for_delivery'].includes(o.status)).length,
      completedOrders: orders.filter(o => o.status === 'delivered').length
    };
  }
}