// SMS Service for real-time text messaging
export class SMSService {
  private static formatPhoneNumber(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length === 10 ? `+91${cleaned}` : `+${cleaned}`;
  }

  static async sendSMS(phone: string, message: string): Promise<void> {
    const formattedPhone = this.formatPhoneNumber(phone);
    
    // Method 1: Twilio SMS API (Recommended)
    const TWILIO_SID = import.meta.env.VITE_TWILIO_SID;
    const TWILIO_TOKEN = import.meta.env.VITE_TWILIO_TOKEN;
    
    if (TWILIO_SID && TWILIO_TOKEN) {
      try {
        const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${btoa(`${TWILIO_SID}:${TWILIO_TOKEN}`)}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            From: '+1234567890', // Your Twilio phone number
            To: formattedPhone,
            Body: message
          })
        });
        
        if (response.ok) {
          console.log(`✅ SMS sent to ${formattedPhone}`);
          return;
        }
      } catch (error) {
        console.error('Twilio SMS failed:', error);
      }
    }
    
    // Method 2: Fast2SMS API (Indian SMS service)
    const FAST2SMS_API_KEY = import.meta.env.VITE_FAST2SMS_API_KEY;
    
    if (FAST2SMS_API_KEY) {
      try {
        const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
          method: 'POST',
          headers: {
            'Authorization': FAST2SMS_API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            route: 'v3',
            sender_id: 'TXTIND',
            message: message,
            language: 'english',
            flash: 0,
            numbers: phone.replace(/\D/g, '').slice(-10) // Last 10 digits
          })
        });
        
        if (response.ok) {
          console.log(`✅ SMS sent to ${phone}`);
          return;
        }
      } catch (error) {
        console.error('Fast2SMS failed:', error);
      }
    }
    
    // Method 3: TextLocal API (Alternative)
    const TEXTLOCAL_API_KEY = import.meta.env.VITE_TEXTLOCAL_API_KEY;
    
    if (TEXTLOCAL_API_KEY) {
      try {
        const response = await fetch('https://api.textlocal.in/send/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            apikey: TEXTLOCAL_API_KEY,
            numbers: phone.replace(/\D/g, '').slice(-10),
            message: message,
            sender: 'TXTLCL'
          })
        });
        
        if (response.ok) {
          console.log(`✅ SMS sent to ${phone}`);
          return;
        }
      } catch (error) {
        console.error('TextLocal SMS failed:', error);
      }
    }
    
    // Fallback: Log message (for development)
    console.log(`📱 SMS for ${formattedPhone}:`, message);
    throw new Error('No SMS service configured');
  }

  static async sendOrderConfirmationSMS(customerData: any, orderData: any, otp: string): Promise<void> {
    const message = `Shirpur Delivery: Order #${orderData.orderId} confirmed! Total: Rs.${orderData.total.toFixed(2)}. Your OTP: ${otp}. Track: shirpur-delivery.com/track`;
    
    try {
      await this.sendSMS(customerData.phone, message);
    } catch (error) {
      console.error('Order confirmation SMS failed:', error);
    }
  }

  static async sendOutForDeliverySMS(customerData: any, orderData: any, deliveryAgent: any, otp: string): Promise<void> {
    const message = `Shirpur Delivery: Order #${orderData.orderId} is out for delivery! Agent: ${deliveryAgent.name} (${deliveryAgent.phone}). Your OTP: ${otp}`;
    
    try {
      await this.sendSMS(customerData.phone, message);
    } catch (error) {
      console.error('Out for delivery SMS failed:', error);
    }
  }

  static async sendDeliveredSMS(customerData: any, orderData: any): Promise<void> {
    const message = `Shirpur Delivery: Order #${orderData.orderId} delivered successfully! Thank you for choosing us. Rate us: shirpur-delivery.com/rate`;
    
    try {
      await this.sendSMS(customerData.phone, message);
    } catch (error) {
      console.error('Delivered SMS failed:', error);
    }
  }
}