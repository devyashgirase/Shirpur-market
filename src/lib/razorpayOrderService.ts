// Razorpay Order Service - Direct Supabase save with paid status
import { supabaseApi } from './supabase';

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
      delivery_address: `${addressData.address}${addressData.landmark ? ', ' + addressData.landmark : ''}${addressData.city ? ', ' + addressData.city : ''}${addressData.state ? ', ' + addressData.state : ''} - ${addressData.pincode}`,
      items: JSON.stringify(cart.map(item => ({
        product_id: parseInt(item.product.id),
        product_name: item.product.name,
        price: item.product.price,
        quantity: item.quantity
      }))),
      total: totalAmount,
      total_amount: totalAmount,
      status: 'confirmed',
      payment_status: 'paid',
      payment_id: paymentResponse.razorpay_payment_id,
      created_at: new Date().toISOString()
    };

    await supabaseApi.createOrder(orderData);
    console.log('✅ Order saved to Supabase with payment status: paid');
    
    return orderId;
  }
}