// Real-time Notification Service
export interface Notification {
  id: string;
  type: 'order_update' | 'delivery_request' | 'delivery_complete';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  orderId?: string;
  priority: 'low' | 'medium' | 'high';
}

export class NotificationService {
  private static listeners: Array<(notifications: Notification[]) => void> = [];
  
  // Subscribe to notifications
  static subscribe(callback: (notifications: Notification[]) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  // Notify all subscribers
  private static notifyListeners() {
    const notifications = this.getNotifications();
    this.listeners.forEach(callback => callback(notifications));
  }

  // Get all notifications
  static getNotifications(): Notification[] {
    return JSON.parse(localStorage.getItem('notifications') || '[]');
  }

  // Add new notification
  static addNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) {
    const newNotification: Notification = {
      ...notification,
      id: `NOTIF_${Date.now()}`,
      timestamp: new Date().toISOString(),
      read: false
    };

    const notifications = this.getNotifications();
    notifications.unshift(newNotification);
    
    // Keep only last 50 notifications
    if (notifications.length > 50) {
      notifications.splice(50);
    }

    localStorage.setItem('notifications', JSON.stringify(notifications));
    this.notifyListeners();

    // Show browser notification if supported
    this.showBrowserNotification(newNotification);
  }

  // Mark notification as read
  static markAsRead(notificationId: string) {
    const notifications = this.getNotifications();
    const updatedNotifications = notifications.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    );
    localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
    this.notifyListeners();
  }

  // Mark all as read
  static markAllAsRead() {
    const notifications = this.getNotifications();
    const updatedNotifications = notifications.map(n => ({ ...n, read: true }));
    localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
    this.notifyListeners();
  }

  // Get unread count
  static getUnreadCount(): number {
    const notifications = this.getNotifications();
    return notifications.filter(n => !n.read).length;
  }

  // Show browser notification
  private static showBrowserNotification(notification: Notification) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: notification.id
      });
    }
  }

  // Request notification permission
  static async requestPermission(): Promise<boolean> {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }

  // Send order status notification
  static sendOrderStatusNotification(orderId: string, status: string, userType: 'customer' | 'admin' | 'delivery') {
    const statusMessages = {
      customer: {
        confirmed: 'Your order has been confirmed and is being prepared',
        packing: 'Your order is being packed',
        out_for_delivery: 'Your order is out for delivery',
        delivered: 'Your order has been delivered successfully'
      },
      admin: {
        confirmed: `Order ${orderId} confirmed and ready for processing`,
        packing: `Order ${orderId} is being packed`,
        out_for_delivery: `Order ${orderId} assigned to delivery partner`,
        delivered: `Order ${orderId} delivered successfully`
      },
      delivery: {
        confirmed: `New order ${orderId} available for pickup`,
        packing: `Order ${orderId} ready for pickup`,
        out_for_delivery: `You accepted order ${orderId}`,
        delivered: `Order ${orderId} delivery completed`
      }
    };

    const message = statusMessages[userType][status as keyof typeof statusMessages.customer];
    if (message) {
      this.addNotification({
        type: 'order_update',
        title: `Order ${orderId}`,
        message,
        orderId,
        priority: status === 'delivered' ? 'high' : 'medium'
      });
    }
  }

  // Send delivery request notification
  static sendDeliveryRequestNotification(orderId: string, customerAddress: string, orderValue: number) {
    this.addNotification({
      type: 'delivery_request',
      title: 'New Delivery Request',
      message: `Order ${orderId} - ₹${orderValue.toFixed(2)} - ${customerAddress}`,
      orderId,
      priority: 'high'
    });
  }
}