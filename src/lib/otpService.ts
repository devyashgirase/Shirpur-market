import { supabaseApi } from './supabase';

export class OTPService {
  // Generate 4-digit OTP
  static generateOTP(): string {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  // Send OTP to customer when order is out for delivery
  static async sendDeliveryOTP(orderId: string, customerPhone: string, customerName: string): Promise<{ success: boolean; otp?: string; error?: string }> {
    try {
      const otp = this.generateOTP();
      
      // Store OTP in database
      await supabaseApi.createDeliveryOTP({
        order_id: orderId,
        customer_phone: customerPhone,
        otp: otp,
        created_at: new Date().toISOString(),
        is_verified: false,
        expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutes
      });

      // Send WhatsApp message to customer
      const message = `🚚 *Shirpur Delivery Update*

Hi ${customerName}!

Your order #${orderId.slice(-8)} is now OUT FOR DELIVERY! 📦

🔐 *Delivery OTP: ${otp}*

Please share this OTP with the delivery agent when they arrive to complete your delivery.

⏰ This OTP is valid for 30 minutes.

Thank you for choosing Shirpur Delivery! 🙏`;

      const formattedPhone = customerPhone.replace(/^(\+91|91)?/, '91');
      const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
      
      // Auto-open WhatsApp
      if (typeof window !== 'undefined') {
        window.open(whatsappUrl, '_blank');
      }

      console.log('✅ OTP sent to customer:', { orderId, phone: formattedPhone, otp });
      return { success: true, otp };
    } catch (error) {
      console.error('❌ Failed to send OTP:', error);
      return { success: false, error: error.message };
    }
  }

  // Verify OTP during delivery
  static async verifyDeliveryOTP(orderId: string, enteredOTP: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Get OTP from database
      const otpRecord = await supabaseApi.getDeliveryOTP(orderId);
      
      if (!otpRecord) {
        return { success: false, error: 'No OTP found for this order' };
      }

      // Check if OTP is expired
      if (new Date() > new Date(otpRecord.expires_at)) {
        return { success: false, error: 'OTP has expired' };
      }

      // Check if already verified
      if (otpRecord.is_verified) {
        return { success: false, error: 'OTP already used' };
      }

      // Verify OTP
      if (otpRecord.otp !== enteredOTP) {
        return { success: false, error: 'Invalid OTP' };
      }

      // Mark OTP as verified
      await supabaseApi.updateDeliveryOTP(orderId, {
        is_verified: true,
        verified_at: new Date().toISOString()
      });

      console.log('✅ OTP verified successfully:', orderId);
      return { success: true };
    } catch (error) {
      console.error('❌ OTP verification failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Get OTP details for order
  static async getOTPDetails(orderId: string) {
    try {
      return await supabaseApi.getDeliveryOTP(orderId);
    } catch (error) {
      console.error('❌ Failed to get OTP details:', error);
      return null;
    }
  }
}