// Production OTP Service with multiple SMS providers
import { ProductionSmsService } from './productionSmsService';

export interface OTPResult {
  success: boolean;
  message: string;
  errorCode?: string;
  whatsappLink?: string;
  provider?: string;
}

export class SimpleFreeOtp {
  
  static generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  static async sendOTP(phone: string, otp: string): Promise<OTPResult> {
    try {
      // Use production SMS service for reliable delivery
      const smsResult = await ProductionSmsService.sendOTP(phone, otp);
      
      // Store OTP for verification
      this.storeOTP(phone, otp);
      
      if (smsResult.success) {
        return {
          success: true,
          message: `OTP sent successfully via ${smsResult.provider}!`,
          provider: smsResult.provider
        };
      } else {
        // Fallback to WhatsApp link
        const whatsappLink = this.createWhatsAppLink(phone, `Your Shirpur Delivery OTP is: ${otp}. Valid for 5 minutes.`);
        
        return {
          success: true,
          message: "SMS service unavailable. Use WhatsApp link to get OTP.",
          errorCode: "SMS_SERVICE_DOWN",
          whatsappLink
        };
      }
    } catch (error) {
      console.error('OTP sending failed:', error);
      
      // Emergency fallback to WhatsApp
      const whatsappLink = this.createWhatsAppLink(phone, `Your Shirpur Delivery OTP is: ${otp}. Valid for 5 minutes.`);
      
      return {
        success: true,
        message: "SMS failed. Use WhatsApp link to get OTP.",
        errorCode: "NETWORK_ERROR",
        whatsappLink
      };
    }
  }

  private static async sendViaTextBelt(phone: string, message: string): Promise<{ success: boolean; error?: string }> {
    const cleanPhone = phone.replace(/\D/g, '');
    
    try {
      const response = await fetch('https://textbelt.com/text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: cleanPhone,
          message: message,
          key: 'textbelt'
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      if (result.success) {
        console.log('✅ SMS sent via TextBelt');
        return { success: true };
      } else {
        console.log('⚠️ TextBelt error:', result.error);
        return { success: false, error: result.error || 'SMS service unavailable' };
      }
    } catch (error) {
      console.error('TextBelt API error:', error);
      return { success: false, error: 'Network error or service unavailable' };
    }
  }

  private static createWhatsAppLink(phone: string, message: string): string {
    // Remove all non-digits
    const cleanPhone = phone.replace(/\D/g, '');
    // If phone already starts with 91 and has 12 digits, use as is
    // Otherwise, if it's 10 digits, add 91 prefix
    let formattedPhone = cleanPhone;
    if (cleanPhone.startsWith('91') && cleanPhone.length === 12) {
      formattedPhone = cleanPhone;
    } else if (cleanPhone.length === 10) {
      formattedPhone = `91${cleanPhone}`;
    }
    
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
    
    console.log('📱 WhatsApp Link:', whatsappUrl);
    
    localStorage.setItem('whatsappOTPLink', JSON.stringify({
      phone: cleanPhone,
      message,
      link: whatsappUrl,
      timestamp: new Date().toISOString()
    }));
    
    return whatsappUrl;
  }

  static getWhatsAppLink(): string | null {
    try {
      const stored = localStorage.getItem('whatsappOTPLink');
      if (stored) {
        const data = JSON.parse(stored);
        return data.link;
      }
    } catch (error) {
      console.error('Error getting WhatsApp link:', error);
    }
    return null;
  }

  private static storeOTP(phone: string, otp: string): void {
    const otpData = {
      phone,
      otp,
      timestamp: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString()
    };
    
    localStorage.setItem(`otp_${phone}`, JSON.stringify(otpData));
    console.log(`🔐 OTP stored: ${otp}`);
  }

  static verifyOTP(phone: string, enteredOtp: string): boolean {
    try {
      const storedData = localStorage.getItem(`otp_${phone}`);
      if (!storedData) return false;
      
      const otpData = JSON.parse(storedData);
      const now = new Date();
      const expiresAt = new Date(otpData.expiresAt);
      
      if (now > expiresAt) {
        localStorage.removeItem(`otp_${phone}`);
        return false;
      }
      
      if (otpData.otp === enteredOtp) {
        localStorage.removeItem(`otp_${phone}`);
        return true;
      }
      
      return false;
    } catch (error) {
      return false;
    }
  }

  static getStoredOTP(phone: string): string | null {
    try {
      const storedData = localStorage.getItem(`otp_${phone}`);
      if (!storedData) return null;
      
      const otpData = JSON.parse(storedData);
      return otpData.otp;
    } catch (error) {
      return null;
    }
  }

  static getLastError(): string | null {
    return localStorage.getItem('lastOTPError');
  }

  static clearLastError(): void {
    localStorage.removeItem('lastOTPError');
  }

  private static setLastError(error: string): void {
    localStorage.setItem('lastOTPError', error);
  }
}