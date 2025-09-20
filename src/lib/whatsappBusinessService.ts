const WHATSAPP_API_URL = 'https://graph.facebook.com/v18.0';
const ACCESS_TOKEN = import.meta.env.VITE_WHATSAPP_ACCESS_TOKEN;
const PHONE_NUMBER_ID = import.meta.env.VITE_WHATSAPP_PHONE_NUMBER_ID;

export class WhatsAppBusinessService {
  private static async sendMessage(to: string, message: any) {
    try {
      const response = await fetch(`${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: to.replace(/\D/g, '').replace(/^91/, ''),
          ...message
        })
      });

      if (!response.ok) {
        throw new Error(`WhatsApp API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('WhatsApp Business API Error:', error);
      throw error;
    }
  }

  static async sendOrderConfirmation(customerPhone: string, order: any) {
    const message = {
      type: 'template',
      template: {
        name: 'order_confirmation',
        language: { code: 'en' },
        components: [
          {
            type: 'body',
            parameters: [
              { type: 'text', text: order.orderId },
              { type: 'text', text: `₹${order.total}` },
              { type: 'text', text: '30 minutes' }
            ]
          }
        ]
      }
    };

    return this.sendMessage(customerPhone, message);
  }

  static async sendOrderStatusUpdate(customerPhone: string, orderId: string, status: string) {
    const statusMessages = {
      confirmed: 'Your order has been confirmed and is being prepared',
      out_for_delivery: 'Your order is out for delivery',
      delivered: 'Your order has been delivered successfully'
    };

    const message = {
      type: 'text',
      text: `🔔 Order Update\n\nOrder #${orderId}\nStatus: ${statusMessages[status] || status}\n\nTrack your order: https://shirpur-delivery.com/track/${orderId}`
    };

    return this.sendMessage(customerPhone, message);
  }

  static async sendDeliveryPartnerInfo(customerPhone: string, orderId: string, deliveryPartner: any) {
    const message = {
      type: 'text',
      text: `🚚 Delivery Partner Assigned\n\nOrder #${orderId}\nDelivery Partner: ${deliveryPartner.name}\nPhone: ${deliveryPartner.phone}\n\nYour order is on the way!`
    };

    return this.sendMessage(customerPhone, message);
  }

  static async sendOTPMessage(customerPhone: string, otp: string, orderId: string) {
    const message = {
      type: 'text',
      text: `🔐 Delivery OTP\n\nOrder #${orderId}\nOTP: ${otp}\n\nShare this OTP with delivery partner for order completion.`
    };

    return this.sendMessage(customerPhone, message);
  }

  static async sendPromotionalMessage(customerPhone: string, offer: any) {
    const message = {
      type: 'template',
      template: {
        name: 'promotional_offer',
        language: { code: 'en' },
        components: [
          {
            type: 'body',
            parameters: [
              { type: 'text', text: offer.title },
              { type: 'text', text: offer.discount },
              { type: 'text', text: offer.validUntil }
            ]
          }
        ]
      }
    };

    return this.sendMessage(customerPhone, message);
  }
}