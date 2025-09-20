// FREE WhatsApp Integration using WhatsApp Web API (Unofficial)
export class FreeWhatsAppService {
  
  // Method 1: WhatsApp Web URL (Opens WhatsApp with pre-filled message)
  static openWhatsAppWeb(phone: string, message: string) {
    const cleanPhone = phone.replace(/\D/g, '');
    const encodedMessage = encodeURIComponent(message);
    const url = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
    window.open(url, '_blank');
  }

  // Method 2: Generate WhatsApp link for order confirmation
  static generateOrderConfirmationLink(customerPhone: string, order: any) {
    const message = `🎉 Order Confirmed!\n\nOrder ID: ${order.orderId}\nTotal: ₹${order.total}\nEstimated Delivery: 30 minutes\n\nTrack: https://shirpur-delivery.com/track/${order.orderId}`;
    
    return this.generateWhatsAppLink(customerPhone, message);
  }

  // Method 3: Generate WhatsApp link for status updates
  static generateStatusUpdateLink(customerPhone: string, orderId: string, status: string) {
    const statusMessages = {
      confirmed: '✅ Your order has been confirmed and is being prepared',
      out_for_delivery: '🚚 Your order is out for delivery',
      delivered: '📦 Your order has been delivered successfully'
    };

    const message = `📱 Order Update\n\nOrder #${orderId}\nStatus: ${statusMessages[status] || status}\n\nThank you for choosing Shirpur Delivery!`;
    
    return this.generateWhatsAppLink(customerPhone, message);
  }

  // Method 4: Generate delivery partner contact link
  static generateDeliveryPartnerLink(customerPhone: string, orderId: string, deliveryPartner: any) {
    const message = `🚚 Delivery Partner Details\n\nOrder #${orderId}\nDelivery Partner: ${deliveryPartner.name}\nPhone: ${deliveryPartner.phone}\n\nYour order is on the way!`;
    
    return this.generateWhatsAppLink(customerPhone, message);
  }

  // Helper method to generate WhatsApp links
  private static generateWhatsAppLink(phone: string, message: string) {
    const cleanPhone = phone.replace(/\D/g, '');
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
  }

  // Method 5: Auto-send via browser (requires user interaction)
  static sendOrderNotification(customerPhone: string, order: any) {
    const link = this.generateOrderConfirmationLink(customerPhone, order);
    
    // Store link for admin to send manually
    const notifications = JSON.parse(localStorage.getItem('whatsappNotifications') || '[]');
    notifications.push({
      id: Date.now(),
      phone: customerPhone,
      orderId: order.orderId,
      message: `Order confirmation for ${order.orderId}`,
      link: link,
      timestamp: new Date().toISOString(),
      sent: false
    });
    localStorage.setItem('whatsappNotifications', JSON.stringify(notifications));
    
    return link;
  }

  // Method 6: Get pending notifications for admin
  static getPendingNotifications() {
    return JSON.parse(localStorage.getItem('whatsappNotifications') || '[]')
      .filter((n: any) => !n.sent);
  }

  // Method 7: Mark notification as sent
  static markNotificationSent(notificationId: number) {
    const notifications = JSON.parse(localStorage.getItem('whatsappNotifications') || '[]');
    const updated = notifications.map((n: any) => 
      n.id === notificationId ? { ...n, sent: true } : n
    );
    localStorage.setItem('whatsappNotifications', JSON.stringify(updated));
  }
}