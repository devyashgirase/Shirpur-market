// Production SMS Service with multiple providers
export interface SMSResult {
  success: boolean;
  message: string;
  provider?: string;
  messageId?: string;
}

export class ProductionSmsService {
  
  static async sendOTP(phone: string, otp: string): Promise<SMSResult> {
    const message = `Your Shirpur Delivery OTP is: ${otp}. Valid for 5 minutes. Do not share with anyone.`;
    
    // Try multiple SMS providers in order of preference
    const providers = [
      () => this.sendViaTwilio(phone, message),
      () => this.sendViaTextBelt(phone, message),
      () => this.sendViaFast2SMS(phone, message)
    ];
    
    for (const provider of providers) {
      try {
        const result = await provider();
        if (result.success) {
          return result;
        }
      } catch (error) {
        console.error('SMS provider failed:', error);
        continue;
      }
    }
    
    return {
      success: false,
      message: "All SMS providers failed. Please try again later."
    };
  }
  
  // Twilio SMS (Recommended for production)
  private static async sendViaTwilio(phone: string, message: string): Promise<SMSResult> {
    const accountSid = import.meta.env.VITE_TWILIO_ACCOUNT_SID;
    const authToken = import.meta.env.VITE_TWILIO_AUTH_TOKEN;
    const fromNumber = import.meta.env.VITE_TWILIO_PHONE_NUMBER;
    
    if (!accountSid || !authToken || !fromNumber) {
      throw new Error('Twilio credentials not configured');
    }
    
    const cleanPhone = phone.replace(/\D/g, '');
    const formattedPhone = cleanPhone.startsWith('91') ? `+${cleanPhone}` : `+91${cleanPhone}`;
    
    try {
      const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(`${accountSid}:${authToken}`)}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          From: fromNumber,
          To: formattedPhone,
          Body: message
        })
      });
      
      const data = await response.json();
      
      if (response.ok && data.sid) {
        return {
          success: true,
          message: "SMS sent successfully via Twilio",
          provider: "Twilio",
          messageId: data.sid
        };
      } else {
        throw new Error(data.message || 'Twilio API error');
      }
    } catch (error) {
      throw new Error(`Twilio failed: ${error}`);
    }
  }
  
  // TextBelt SMS (Free tier available)
  private static async sendViaTextBelt(phone: string, message: string): Promise<SMSResult> {
    const apiKey = import.meta.env.VITE_SMS_API_KEY || 'textbelt';
    const cleanPhone = phone.replace(/\D/g, '');
    
    try {
      const response = await fetch('https://textbelt.com/text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: cleanPhone,
          message: message,
          key: apiKey
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        return {
          success: true,
          message: "SMS sent successfully via TextBelt",
          provider: "TextBelt",
          messageId: data.textId
        };
      } else {
        throw new Error(data.error || 'TextBelt API error');
      }
    } catch (error) {
      throw new Error(`TextBelt failed: ${error}`);
    }
  }
  
  // Fast2SMS (Indian SMS provider)
  private static async sendViaFast2SMS(phone: string, message: string): Promise<SMSResult> {
    const apiKey = import.meta.env.VITE_FAST2SMS_API_KEY;
    
    if (!apiKey) {
      throw new Error('Fast2SMS API key not configured');
    }
    
    const cleanPhone = phone.replace(/\D/g, '');
    const indianPhone = cleanPhone.startsWith('91') ? cleanPhone.substring(2) : cleanPhone;
    
    try {
      const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          'Authorization': apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          route: 'v3',
          sender_id: import.meta.env.VITE_SMS_SENDER_ID || 'SHIRPUR',
          message: message,
          language: 'english',
          flash: 0,
          numbers: indianPhone
        })
      });
      
      const data = await response.json();
      
      if (data.return && data.return === true) {
        return {
          success: true,
          message: "SMS sent successfully via Fast2SMS",
          provider: "Fast2SMS",
          messageId: data.request_id
        };
      } else {
        throw new Error(data.message || 'Fast2SMS API error');
      }
    } catch (error) {
      throw new Error(`Fast2SMS failed: ${error}`);
    }
  }
  
  // Verify SMS delivery status
  static async verifyDelivery(messageId: string, provider: string): Promise<boolean> {
    try {
      switch (provider) {
        case 'Twilio':
          return await this.verifyTwilioDelivery(messageId);
        case 'TextBelt':
          return await this.verifyTextBeltDelivery(messageId);
        default:
          return true; // Assume delivered for other providers
      }
    } catch (error) {
      console.error('Delivery verification failed:', error);
      return false;
    }
  }
  
  private static async verifyTwilioDelivery(messageId: string): Promise<boolean> {
    const accountSid = import.meta.env.VITE_TWILIO_ACCOUNT_SID;
    const authToken = import.meta.env.VITE_TWILIO_AUTH_TOKEN;
    
    if (!accountSid || !authToken) return false;
    
    try {
      const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages/${messageId}.json`, {
        headers: {
          'Authorization': `Basic ${btoa(`${accountSid}:${authToken}`)}`
        }
      });
      
      const data = await response.json();
      return data.status === 'delivered' || data.status === 'sent';
    } catch (error) {
      return false;
    }
  }
  
  private static async verifyTextBeltDelivery(messageId: string): Promise<boolean> {
    try {
      const response = await fetch(`https://textbelt.com/status/${messageId}`);
      const data = await response.json();
      return data.status === 'DELIVERED';
    } catch (error) {
      return false;
    }
  }
}