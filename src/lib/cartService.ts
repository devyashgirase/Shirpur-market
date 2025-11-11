import { supabaseApi } from './supabase';
import { authService } from './authService';

export interface CartItem {
  id: number;
  product: {
    id: string;
    name: string;
    price: number;
    image_url: string;
    stock_qty: number;
  };
  quantity: number;
}

class CartService {
  private async getCurrentUserPhone(): Promise<string | null> {
    try {
      const user = authService.getCurrentUser();
      return user?.phone || 'guest';
    } catch (error) {
      return 'guest';
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