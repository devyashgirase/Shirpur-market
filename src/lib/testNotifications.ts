// Test script to trigger real-time notifications
import { NotificationService } from './notificationService';
import { OrderService } from './orderService';
import { DataGenerator } from './dataGenerator';

export const triggerTestNotifications = () => {
  // Generate dynamic test data
  const orderId1 = DataGenerator.generateOrderId();
  const orderId2 = DataGenerator.generateOrderId();
  const orderId3 = DataGenerator.generateOrderId();
  const customer = DataGenerator.generateCustomer();
  const amount = Math.floor(Math.random() * 500) + 100;
  const distance = Math.floor(Math.random() * 8) + 1;

  // Test customer notifications
  NotificationService.addNotification({
    type: 'order_update',
    title: 'Order Update',
    message: `Your order ${orderId1} is being packed`,
    orderId: orderId1,
    priority: 'medium'
  });

  // Test admin notifications
  NotificationService.addNotification({
    type: 'order_update',
    title: 'New Order',
    message: `Order ${orderId2} from ${customer.name} - ₹${amount}.00`,
    orderId: orderId2,
    priority: 'high'
  });

  // Test delivery notifications
  NotificationService.addNotification({
    type: 'delivery_request',
    title: 'New Delivery Request',
    message: `Order ${orderId3} - ${distance}.${Math.floor(Math.random() * 9)}km away - ₹${amount}.00`,
    orderId: orderId3,
    priority: 'high'
  });

  console.log('✅ Dynamic test notifications triggered!');
};

// Auto-trigger notifications for demo
export const startNotificationDemo = () => {
  // Trigger initial notifications
  setTimeout(() => {
    triggerTestNotifications();
  }, 2000);

  // Simulate order status updates every 15 seconds with dynamic data
  setInterval(() => {
    const statuses = ['confirmed', 'packing', 'out_for_delivery', 'delivered'];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    const orderId = DataGenerator.generateOrderId();
    const customer = DataGenerator.generateCustomer();
    
    NotificationService.addNotification({
      type: 'order_update',
      title: 'Order Status Update',
      message: `${customer.name}'s order ${orderId} is now ${randomStatus.replace('_', ' ')}`,
      orderId,
      priority: randomStatus === 'delivered' ? 'high' : 'medium'
    });
  }, 15000);
};

// Add to window for manual testing
if (typeof window !== 'undefined') {
  (window as any).triggerTestNotifications = triggerTestNotifications;
  (window as any).startNotificationDemo = startNotificationDemo;
}