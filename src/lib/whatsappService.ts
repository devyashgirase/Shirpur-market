import { SMSService } from './smsService';

// WhatsApp Business API Service
export class WhatsAppService {
  private static generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private static formatPhoneNumber(phone: string): string {
    // Remove all non-digits
    const cleaned = phone.replace(/\D/g, '');
    // If it starts with 91 and has 12 digits, return as is
    if (cleaned.startsWith('91') && cleaned.length === 12) {
      return cleaned;
    }
    // If it's 10 digits, add 91 prefix
    if (cleaned.length === 10) {
      return `91${cleaned}`;
    }
    // Return cleaned number as is
    return cleaned;
  }

  static async sendOrderConfirmation(customerData: any, orderData: any): Promise<string> {
    const otp = this.generateOTP();
    const phone = this.formatPhoneNumber(customerData.phone);
    
    const message = `🛒 *Shirpur Delivery - Order Confirmed*

Hi ${customerData.name}! 👋

Your order has been placed successfully!

📦 *Order Details:*
Order ID: #${orderData.orderId}
Total Amount: ₹${orderData.total.toFixed(2)}
Items: ${orderData.items.length} items

📍 *Delivery Address:*
${customerData.address}

🔐 *Your OTP: ${otp}*
(Required for delivery verification)

⏰ Estimated delivery: 30-45 minutes
📱 Track your order: shirpur-delivery.com/track

Thank you for choosing Shirpur Delivery! 🙏`;

    // Store OTP for verification
    localStorage.setItem(`otp_${orderData.orderId}`, otp);
    
    // Store message history
    this.storeMessage({
      id: `msg_${Date.now()}`,
      orderId: orderData.orderId,
      phone: customerData.phone,
      message,
      timestamp: new Date().toISOString(),
      type: 'order_confirmation',
      status: 'sent'
    });
    
    // Send real WhatsApp message
    try {
      await this.sendWhatsAppMessage(phone, message);
      console.log(`✅ WhatsApp sent to ${phone}`);
    } catch (error) {
      console.error('❌ WhatsApp failed:', error);
      console.log(`📱 Message for ${phone}:`, message);
    }

    // Send SMS message
    try {
      await SMSService.sendOrderConfirmationSMS(customerData, orderData, otp);
      console.log(`✅ SMS sent to ${customerData.phone}`);
    } catch (error) {
      console.error('❌ SMS failed:', error);
    }

    return otp;
  }

  static async sendOutForDeliveryNotification(customerData: any, orderData: any, deliveryAgent: any): Promise<void> {
    const phone = this.formatPhoneNumber(customerData.phone);
    const storedOTP = localStorage.getItem(`otp_${orderData.orderId}`) || '123456';
    
    const message = `🚚 *Your Order is Out for Delivery!*

Hi ${customerData.name}! 👋

Great news! Your order is now on the way! 🎉

📦 *Order #${orderData.orderId}*
🚚 Delivery Partner: ${deliveryAgent.name}
📞 Contact: ${deliveryAgent.phone}

📍 *Delivery Address:*
${customerData.address}

🔐 *Your OTP: ${storedOTP}*
Please share this OTP with the delivery partner for order verification.

📱 Track live location: shirpur-delivery.com/track

Estimated arrival: 15-25 minutes ⏰

Thank you for your patience! 🙏`;

    // Store message history
    this.storeMessage({
      id: `msg_${Date.now()}`,
      orderId: orderData.orderId,
      phone: customerData.phone,
      message,
      timestamp: new Date().toISOString(),
      type: 'out_for_delivery',
      status: 'sent'
    });

    try {
      await this.sendWhatsAppMessage(phone, message);
      console.log(`✅ WhatsApp sent to ${phone}`);
    } catch (error) {
      console.error('❌ WhatsApp failed:', error);
      console.log(`📱 Message for ${phone}:`, message);
    }
  }

  static async sendStatusUpdate(customerData: any, orderData: any, status: string): Promise<void> {
    const phone = this.formatPhoneNumber(customerData.phone);
    
    const statusMessages = {
      'packing': '📦 Your order is being packed and will be ready soon!',
      'out_for_delivery': '🚚 Your order is out for delivery!',
      'delivered': '✅ Your order has been delivered successfully! Thank you for choosing Shirpur Delivery! 🙏'
    };

    const message = `📱 *Order Status Update*

Hi ${customerData.name}!

Order #${orderData.orderId}
Status: ${statusMessages[status as keyof typeof statusMessages] || status}

Track your order: shirpur-delivery.com/track

Shirpur Delivery Team 🙏`;

    // Store message history
    this.storeMessage({
      id: `msg_${Date.now()}`,
      orderId: orderData.orderId,
      phone: customerData.phone,
      message,
      timestamp: new Date().toISOString(),
      type: status as any,
      status: 'sent'
    });

    try {
      await this.sendWhatsAppMessage(phone, message);
      console.log(`✅ WhatsApp sent to ${phone}`);
    } catch (error) {
      console.error('❌ WhatsApp failed:', error);
      console.log(`📱 Message for ${phone}:`, message);
    }

    // Send SMS for delivered status
    if (status === 'delivered') {
      try {
        await SMSService.sendDeliveredSMS(customerData, orderData);
        console.log(`✅ SMS sent to ${customerData.phone}`);
      } catch (error) {
        console.error('❌ SMS failed:', error);
      }
    }
  }

  static getStoredOTP(orderId: string): string {
    return localStorage.getItem(`otp_${orderId}`) || '123456';
  }

  static verifyOTP(orderId: string, enteredOTP: string): boolean {
    const storedOTP = this.getStoredOTP(orderId);
    return storedOTP === enteredOTP;
  }

  private static storeMessage(messageData: any): void {
    const messages = JSON.parse(localStorage.getItem('whatsappMessages') || '[]');
    messages.push(messageData);
    localStorage.setItem('whatsappMessages', JSON.stringify(messages));
  }

  private static async sendWhatsAppMessage(phone: string, message: string): Promise<void> {
    // WhatsApp Business API Configuration
    const WHATSAPP_TOKEN = import.meta.env.VITE_WHATSAPP_ACCESS_TOKEN || 'EAAYour_Access_Token';
    const PHONE_NUMBER_ID = import.meta.env.VITE_WHATSAPP_PHONE_NUMBER_ID || 'your_phone_number_id';
    
    // Method 1: Meta WhatsApp Business API
    if (WHATSAPP_TOKEN.startsWith('EAA') && PHONE_NUMBER_ID) {
      const response = await fetch(`https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: phone,
          type: 'text',
          text: { body: message }
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(`WhatsApp API error: ${error.error?.message || response.status}`);
      }
      return;
    }
    
    // Method 2: WhatsApp Web URL (Opens WhatsApp with pre-filled message)
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phone}?text=${encodedMessage}`;
    
    if (typeof window !== 'undefined') {
      window.open(whatsappUrl, '_blank');
    }
    
    throw new Error('No WhatsApp API configured');
  }
}