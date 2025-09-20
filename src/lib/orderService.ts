// Real-time Order Management Service
import { WhatsAppService } from './whatsappService';
import { SMSService } from './smsService';
import { FreeSmsService } from './freeSmsService';
import { WhatsAppBusinessService } from './whatsappBusinessService';
import { apiService } from './apiService';
import { realTimeService } from './realTimeService';

export interface OrderStatus {
  pending: 'Order Placed';
  confirmed: 'Order Confirmed';
  packing: 'Packing Your Order';
  out_for_delivery: 'Out for Delivery';
  delivered: 'Delivered';
}

export interface Order {
  orderId: string;
  status: keyof OrderStatus;
  timestamp: string;
  customerAddress: {
    name: string;
    phone: string;
    address: string;
    coordinates?: { lat: number; lng: number };
  };
  items: Array<{
    product: { id: string; name: string; price: number };
    quantity: number;
  }>;
  total: number;
  paymentStatus: string;
  deliveryAgent?: {
    id: string;
    name: string;
    phone: string;
    location?: { lat: number; lng: number };
  };
}

export class OrderService {
  private static listeners: Array<(orders: Order[]) => void> = [];
  
  // Subscribe to order updates
  static subscribe(callback: (orders: Order[]) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  // Notify all subscribers
  private static notifyListeners() {
    const orders = this.getAllOrders();
    this.listeners.forEach(callback => callback(orders));
  }

  // Get all orders
  static getAllOrders(): Order[] {
    return JSON.parse(localStorage.getItem('allOrders') || '[]');
  }

  // Get orders from API
  static async getOrdersFromAPI(): Promise<Order[]> {
    try {
      const apiOrders = await apiService.getOrders();
      const orders = apiOrders.map(order => ({
        orderId: order.orderId || order.id?.toString() || '',
        status: order.status as keyof OrderStatus,
        timestamp: new Date().toISOString(),
        customerAddress: {
          name: order.customerName,
          phone: order.customerPhone,
          address: order.deliveryAddress
        },
        items: order.items?.map(item => ({
          product: { id: item.productId.toString(), name: item.productName, price: item.price },
          quantity: item.quantity
        })) || [],
        total: order.total,
        paymentStatus: order.paymentStatus
      }));
      
      // Update local storage
      localStorage.setItem('allOrders', JSON.stringify(orders));
      return orders;
    } catch (error) {
      console.error('Failed to fetch orders from API:', error);
      return this.getAllOrders();
    }
  }

  // Update order status with real-time sync
  static async updateOrderStatus(orderId: string, newStatus: keyof OrderStatus, deliveryAgent?: any) {
    const orders = this.getAllOrders();
    const orderIndex = orders.findIndex(order => order.orderId === orderId);
    
    if (orderIndex === -1) return false;

    const order = orders[orderIndex];
    const oldStatus = order.status;
    
    try {
      // Update via API
      const dbId = parseInt(orderId.replace(/\D/g, '')) || 1;
      await apiService.updateOrderStatus(dbId, newStatus);
    } catch (error) {
      console.error('Failed to update order status via API:', error);
    }
    
    // Update local storage
    orders[orderIndex] = {
      ...order,
      status: newStatus,
      timestamp: new Date().toISOString(),
      ...(deliveryAgent && { deliveryAgent })
    };

    localStorage.setItem('allOrders', JSON.stringify(orders));

    // Update current order if it matches
    const currentOrder = JSON.parse(localStorage.getItem('currentOrder') || '{}');
    if (currentOrder.orderId === orderId) {
      currentOrder.status = newStatus;
      currentOrder.timestamp = new Date().toISOString();
      if (deliveryAgent) currentOrder.deliveryAgent = deliveryAgent;
      localStorage.setItem('currentOrder', JSON.stringify(currentOrder));
    }

    // Send notifications based on status change
    await this.sendStatusNotifications(order, newStatus, oldStatus);

    // Notify all subscribers
    this.notifyListeners();

    return true;
  }

  // Send notifications for status changes
  private static async sendStatusNotifications(order: Order, newStatus: keyof OrderStatus, oldStatus: keyof OrderStatus) {
    try {
      // Send WhatsApp Business API notification
      await WhatsAppBusinessService.sendOrderStatusUpdate(
        order.customerAddress.phone, 
        order.orderId, 
        newStatus
      );
      
      // Send delivery partner info when out for delivery
      if (newStatus === 'out_for_delivery' && order.deliveryAgent) {
        await WhatsAppBusinessService.sendDeliveryPartnerInfo(
          order.customerAddress.phone,
          order.orderId,
          order.deliveryAgent
        );
        
        // Send OTP for delivery verification
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        localStorage.setItem(`otp_${order.orderId}`, otp);
        await WhatsAppBusinessService.sendOTPMessage(
          order.customerAddress.phone,
          otp,
          order.orderId
        );
      }
      
      // Fallback to SMS for critical updates
      await FreeSmsService.sendStatusUpdate(
        order.customerAddress.phone,
        order.orderId,
        newStatus
      );

      console.log(`✅ WhatsApp Business notifications sent for order ${order.orderId}: ${oldStatus} → ${newStatus}`);
    } catch (error) {
      console.error('❌ Failed to send WhatsApp Business notifications:', error);
      // Fallback to existing services
      try {
        await WhatsAppService.sendStatusUpdate(order.customerAddress, order, newStatus);
      } catch (fallbackError) {
        console.error('❌ Fallback notification also failed:', fallbackError);
      }
    }
  }

  // Create delivery notification for nearby agents
  static createDeliveryNotification(order: Order) {
    const notification = {
      id: `NOTIF_${Date.now()}`,
      orderId: order.orderId,
      customerLocation: order.customerAddress.coordinates || { lat: 21.3487, lng: 74.8831 },
      customerAddress: order.customerAddress,
      orderValue: order.total,
      items: order.items,
      timestamp: new Date().toISOString(),
      status: 'pending',
      radius: 10 // 10km radius
    };

    const notifications = JSON.parse(localStorage.getItem('deliveryNotifications') || '[]');
    notifications.push(notification);
    localStorage.setItem('deliveryNotifications', JSON.stringify(notifications));

    console.log(`📱 Delivery notification created for order ${order.orderId}`);
  }

  // Accept order by delivery agent
  static async acceptOrder(orderId: string, agentInfo: any) {
    const deliveryAgent = {
      id: agentInfo.id || 'AGENT_001',
      name: agentInfo.name || 'Delivery Partner',
      phone: agentInfo.phone || '+91 98765 43210',
      location: agentInfo.location || { lat: 20.7516, lng: 74.2297 }
    };

    // Update order status to out_for_delivery
    await this.updateOrderStatus(orderId, 'out_for_delivery', deliveryAgent);

    // Create delivery task
    const order = this.getAllOrders().find(o => o.orderId === orderId);
    if (order) {
      const deliveryTask = {
        id: `TASK_${Date.now()}`,
        orderId: order.orderId,
        order_id: order.orderId,
        customer_name: order.customerAddress.name,
        customer_address: order.customerAddress.address,
        customer_phone: order.customerAddress.phone,
        customerAddress: order.customerAddress,
        items: order.items,
        orderValue: order.total,
        total_amount: order.total,
        status: 'accepted',
        acceptedAt: new Date().toISOString(),
        estimatedDelivery: new Date(Date.now() + 25 * 60000).toISOString()
      };

      const tasks = JSON.parse(localStorage.getItem('deliveryTasks') || '[]');
      tasks.push(deliveryTask);
      localStorage.setItem('deliveryTasks', JSON.stringify(tasks));
    }

    // Remove from notifications
    const notifications = JSON.parse(localStorage.getItem('deliveryNotifications') || '[]');
    const updatedNotifications = notifications.map((n: any) => 
      n.orderId === orderId ? { ...n, status: 'accepted' } : n
    );
    localStorage.setItem('deliveryNotifications', JSON.stringify(updatedNotifications));

    return true;
  }

  // Update delivery agent location
  static async updateDeliveryLocation(orderId: string, location: { lat: number; lng: number }) {
    const orders = this.getAllOrders();
    const orderIndex = orders.findIndex(order => order.orderId === orderId);
    
    if (orderIndex !== -1 && orders[orderIndex].deliveryAgent) {
      try {
        // Update via API
        const dbId = parseInt(orderId.replace(/\D/g, '')) || 1;
        await apiService.updateDeliveryLocation(dbId, location.lat, location.lng);
      } catch (error) {
        console.error('Failed to update delivery location via API:', error);
      }
      
      orders[orderIndex].deliveryAgent!.location = location;
      orders[orderIndex].timestamp = new Date().toISOString();
      
      localStorage.setItem('allOrders', JSON.stringify(orders));
      
      // Update current order
      const currentOrder = JSON.parse(localStorage.getItem('currentOrder') || '{}');
      if (currentOrder.orderId === orderId) {
        if (!currentOrder.deliveryAgent) currentOrder.deliveryAgent = {};
        currentOrder.deliveryAgent.location = location;
        currentOrder.deliveryAgentLocation = location;
        currentOrder.timestamp = new Date().toISOString();
        localStorage.setItem('currentOrder', JSON.stringify(currentOrder));
      }

      // Store for admin tracking
      localStorage.setItem('deliveryAgentLocation', JSON.stringify({
        orderId,
        ...location,
        timestamp: new Date().toISOString()
      }));

      this.notifyListeners();
    }
  }

  // Complete delivery with OTP verification
  static async completeDelivery(orderId: string, otp: string): Promise<boolean> {
    const isValidOTP = WhatsAppService.verifyOTP(orderId, otp);
    
    if (!isValidOTP) {
      return false;
    }

    // Update order status to delivered
    await this.updateOrderStatus(orderId, 'delivered');

    // Remove from delivery tasks
    const tasks = JSON.parse(localStorage.getItem('deliveryTasks') || '[]');
    const updatedTasks = tasks.filter((task: any) => task.orderId !== orderId);
    localStorage.setItem('deliveryTasks', JSON.stringify(updatedTasks));

    // Clear delivery location tracking
    localStorage.removeItem('deliveryAgentLocation');

    return true;
  }

  // Get order by ID
  static getOrderById(orderId: string): Order | null {
    const orders = this.getAllOrders();
    return orders.find(order => order.orderId === orderId) || null;
  }

  // Get orders by status
  static getOrdersByStatus(status: keyof OrderStatus): Order[] {
    const orders = this.getAllOrders();
    return orders.filter(order => order.status === status);
  }
}