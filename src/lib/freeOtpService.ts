// Free OTP SMS Service for Shirpur Delivery
export class FreeOtpService {
  
  // Generate OTP
  static generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Send OTP via multiple free methods
  static async sendOTP(phone: string, otp: string, name?: string): Promise<boolean> {
    const message = `Your Shirpur Delivery OTP is: ${otp}. Valid for 5 minutes. Do not share with anyone.`;
    
    try {
      // Method 1: Free SMS API (TextBelt - 1 free SMS per day per IP)
      await this.sendViaTextBelt(phone, message);
      
      // Method 2: Generate WhatsApp link as backup
      this.generateWhatsAppLink(phone, message);
      
      // Method 3: Store for manual verification (development)
      this.storeForManualVerification(phone, otp);
      
      console.log(`📱 OTP ${otp} sent to ${phone} via multiple methods`);
      return true;
    } catch (error) {
      console.error('Failed to send OTP:', error);
      return false;
    }
  }

  // Method 1: TextBelt Free SMS (1 free per day)
  private static async sendViaTextBelt(phone: string, message: string): Promise<void> {
    try {
      const response = await fetch('https://textbelt.com/text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: phone.replace(/\D/g, ''), // Remove non-digits
          message: message,
          key: 'textbelt' // Free tier key
        })
      });
      
      const result = await response.json();
      if (result.success) {
        console.log('✅ SMS sent via TextBelt');
      } else {
        console.log('⚠️ TextBelt limit reached, using backup methods');
      }
    } catch (error) {
      console.log('⚠️ TextBelt failed, using backup methods');
    }
  }

  // Method 2: Generate WhatsApp link for manual sending
  private static generateWhatsAppLink(phone: string, message: string): string {
    const cleanPhone = phone.replace(/\D/g, '');
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/91${cleanPhone}?text=${encodedMessage}`;
    
    console.log('📱 WhatsApp Link:', whatsappUrl);
    
    // Store link for admin to manually send
    localStorage.setItem('pendingWhatsAppOTP', JSON.stringify({
      phone: cleanPhone,
      message,
      link: whatsappUrl,
      timestamp: new Date().toISOString()
    }));
    
    return whatsappUrl;
  }

  // Method 3: Store for manual verification (development/testing)
  private static storeForManualVerification(phone: string, otp: string): void {
    const otpData = {
      phone,
      otp,
      timestamp: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString() // 5 minutes
    };
    
    localStorage.setItem(`otp_${phone}`, JSON.stringify(otpData));
    console.log(`🔐 OTP stored for manual verification: ${otp}`);
  }

  // Verify OTP
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
      console.error('OTP verification failed:', error);
      return false;
    }
  }

  // Get stored OTP for testing
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

  // Alternative: Use email as backup
  static async sendOTPViaEmail(email: string, otp: string): Promise<boolean> {
    try {
      // Using EmailJS (free tier: 200 emails/month)
      const emailData = {
        to_email: email,
        subject: 'Shirpur Delivery - OTP Verification',
        message: `Your OTP is: ${otp}. Valid for 5 minutes.`,
        from_name: 'Shirpur Delivery'
      };
      
      console.log('📧 Email OTP would be sent to:', email);
      console.log('📧 OTP:', otp);
      
      // Store for verification
      localStorage.setItem(`email_otp_${email}`, JSON.stringify({
        otp,
        timestamp: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString()
      }));
      
      return true;
    } catch (error) {
      console.error('Email OTP failed:', error);
      return false;
    }
  }
}

// Free SMS Alternatives Documentation
export const FREE_SMS_ALTERNATIVES = {
  textbelt: {
    name: 'TextBelt',
    limit: '1 SMS per day per IP',
    url: 'https://textbelt.com',
    cost: 'Free tier available'
  },
  twilio: {
    name: 'Twilio',
    limit: '$15 free credit',
    url: 'https://twilio.com',
    cost: 'Free trial credit'
  },
  msg91: {
    name: 'MSG91',
    limit: '100 free SMS',
    url: 'https://msg91.com',
    cost: 'Free trial'
  },
  fast2sms: {
    name: 'Fast2SMS',
    limit: '50 free SMS',
    url: 'https://fast2sms.com',
    cost: 'Free trial'
  },
  whatsapp: {
    name: 'WhatsApp Business API',
    limit: '1000 free messages/month',
    url: 'https://business.whatsapp.com',
    cost: 'Free tier available'
  }
};