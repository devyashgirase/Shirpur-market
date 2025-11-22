import { supabaseApi } from './supabase';
import { authService } from './authService';

export interface CartItem {
  id: number;
  product: {
    id: string;
    name: string;
    price: number;
    image_url?: string;
    imageUrl?: string;
    stock_qty: number;
  };
  quantity: number;
}

class CartService {
  private async getCurrentUserPhone(): Promise<string | null> {
    try {
      // First try to get from current user session
      const user = authService.getCurrentUser();
      if (user?.phone) {
        // Only transfer if not already done
        if (!this.transferExecuted) {
          await this.transferGuestCartToUser(user.phone);
        }
        localStorage.setItem('customerPhone', user.phone);
        return user.phone;
      }
      
      // Fallback to customerPhone in localStorage
      const customerPhone = localStorage.getItem('customerPhone');
      if (customerPhone && customerPhone !== 'guest' && !customerPhone.startsWith('guest_')) {
        return customerPhone;
      }
      
      return 'guest';
    } catch (error) {
      return 'guest';
    }
  }

  private transferExecuted = false;
  
  private async transferGuestCartToUser(userPhone: string): Promise<void> {
    // Prevent multiple transfers
    if (this.transferExecuted) return;
    
    try {
      // Get guest cart items
      const guestCart = await supabaseApi.getCart('guest');
      const guestItems = Array.isArray(guestCart) ? guestCart : guestCart?.items || [];
      
      if (guestItems.length > 0) {
        console.log('🔄 Transferring guest cart to user:', userPhone, guestItems.length, 'items');
        
        // Get existing user cart to merge
        const userCart = await supabaseApi.getCart(userPhone);
        const userItems = Array.isArray(userCart) ? userCart : userCart?.items || [];
        
        // Transfer each item to user cart (merge with existing)
        for (const item of guestItems) {
          const existingItem = userItems.find(ui => ui.product.id === item.product.id);
          if (existingItem) {
            // Update quantity if item already exists
            await supabaseApi.updateCartQuantity(userPhone, item.product.id, existingItem.quantity + item.quantity);
          } else {
            // Add new item
            await supabaseApi.addToCart(userPhone, item.product.id, item.quantity);
          }
        }
        
        // Only clear guest cart after successful transfer
        await supabaseApi.clearCart('guest');
        this.transferExecuted = true;
        console.log('✅ Guest cart transferred successfully to user:', userPhone);
      }
    } catch (error) {
      console.error('Failed to transfer guest cart:', error);
      // Don't clear guest cart if transfer failed
    }
  }

  async getCartItems(): Promise<CartItem[]> {
    const userPhone = await this.getCurrentUserPhone();
    if (!userPhone) return [];

    try {
      const cartData = await supabaseApi.getCart(userPhone);
      // Handle both array and {items: []} structure
      if (Array.isArray(cartData)) {
        return cartData;
      }
      return cartData?.items || [];
    } catch (error) {
      console.warn('Cart not available, please set up cart_items table:', error);
      return [];
    }
  }

  async addToCart(productId: string, quantity: number = 1): Promise<boolean> {
    const userPhone = await this.getCurrentUserPhone();
    if (!userPhone) return false;

    try {
      await supabaseApi.addToCart(userPhone, productId, quantity);
      return true;
    } catch (error) {
      console.error('Failed to add to cart:', error);
      return false;
    }
  }

  async updateCartQuantity(productId: string, quantity: number): Promise<boolean> {
    const userPhone = await this.getCurrentUserPhone();
    if (!userPhone) return false;

    if (quantity <= 0) {
      return await this.removeFromCart(productId);
    }

    try {
      await supabaseApi.updateCartQuantity(userPhone, productId, quantity);
      return true;
    } catch (error) {
      console.error('Failed to update cart quantity:', error);
      return false;
    }
  }

  async removeFromCart(productId: string): Promise<boolean> {
    const userPhone = await this.getCurrentUserPhone();
    if (!userPhone) return false;

    try {
      await supabaseApi.removeFromCart(userPhone, productId);
      return true;
    } catch (error) {
      console.error('Failed to remove from cart:', error);
      return false;
    }
  }

  async clearCart(): Promise<boolean> {
    const userPhone = await this.getCurrentUserPhone();
    if (!userPhone) return false;

    try {
      await supabaseApi.clearCart(userPhone);
      return true;
    } catch (error) {
      console.error('Failed to clear cart:', error);
      return false;
    }
  }

  async getCartTotal(): Promise<number> {
    const items = await this.getCartItems();
    return items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  }

  async getCartItemCount(): Promise<number> {
    const items = await this.getCartItems();
    return items.reduce((total, item) => total + item.quantity, 0);
  }
}

export const cartService = new CartService();