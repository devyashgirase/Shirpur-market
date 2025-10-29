// Razorpay Order Service - Direct Supabase save with paid status
import { createOrderInSupabase } from './orderCreationService';

export class RazorpayOrderService {
  static async createPaidOrder(
    paymentResponse: any,
    addressData: any,
    cart: any[],
    totalAmount: number,
    customerPhone: string
  ): Promise<string> {
    const orderId = `ORD-${Date.now()}`;
    
    const orderData = {
      order_id: orderId,
      customer_name: addressData.name,
      customer_phone: customerPhone,
      customer_address: `${addressData.address}${addressData.landmark ? ', ' + addressData.landmark : ''}${addressData.city ? ', ' + addressData.city : ''}${addressData.state ? ', ' + addressData.state : ''} - ${addressData.pincode}`,
      items: cart.map(item => ({
        product_id: parseInt(item.product.id),
        product_name: item.product.name,
        price: item.product.price,
        quantity: item.quantity
      })),
      total_amount: totalAmount,
      order_status: 'confirmed',
      payment_status: 'paid',
      payment_id: paymentResponse.razorpay_payment_id
    };

    try {
      await createOrderInSupabase(orderData);
      console.log('✅ Order saved to Supabase with payment status: paid');
      
      // Trigger real-time update for admin dashboard
      window.dispatchEvent(new CustomEvent('orderCreated', {
        detail: { orderId, status: 'confirmed', paymentStatus: 'paid' }
      }));
      
      window.dispatchEvent(new CustomEvent('newOrderAlert', {
        detail: { orderId, customerName: addressData.name, total: totalAmount }
      }));
      
      return orderId;
    } catch (error) {
      console.error('❌ Failed to save order:', error);
      throw new Error(`Order save failed: ${error.message}`);
    }
  }
}