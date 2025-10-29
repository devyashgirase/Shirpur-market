// Order validation to ensure all orders are saved to Supabase
import { supabaseApi } from './supabase';

export class OrderValidation {
  static async validateOrderSaved(orderId: string): Promise<boolean> {
    try {
      const orders = await supabaseApi.getOrders();
      const orderExists = orders.some(order => order.order_id === orderId);
      
      if (orderExists) {
        console.log('✅ Order confirmed in Supabase:', orderId);
        return true;
      } else {
        console.error('❌ Order NOT found in Supabase:', orderId);
        return false;
      }
    } catch (error) {
      console.error('❌ Failed to validate order in Supabase:', error);
      return false;
    }
  }

  static async ensureOrderInDatabase(orderData: any): Promise<string> {
    try {
      // Force save to Supabase
      const result = await supabaseApi.createOrder(orderData);
      console.log('✅ Order forcefully saved to Supabase:', orderData.order_id);
      
      // Validate it was saved
      const isValid = await this.validateOrderSaved(orderData.order_id);
      if (!isValid) {
        throw new Error('Order validation failed after save');
      }
      
      return orderData.order_id;
    } catch (error) {
      console.error('❌ CRITICAL: Failed to ensure order in database:', error);
      throw error;
    }
  }
}