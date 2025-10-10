import { DatabaseService } from './databaseService';
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
      // Fallback to guest user when auth service unavailable
      return 'guest';
    }
  }

  async getCartItems(): Promise<CartItem[]> {
    try {
      const userPhone = await this.getCurrentUserPhone();
      if (!userPhone) return [];

      // Get cart from Supabase
      const cartData = await DatabaseService.getCart(userPhone);
      return cartData || [];
    } catch (error) {
      console.error('Failed to get cart items:', error);
      return [];
    }
  }

  async addToCart(productId: string, quantity: number = 1): Promise<boolean> {
    try {
      const userPhone = await this.getCurrentUserPhone();
      if (!userPhone) return false;

      // Add to Supabase cart
      await DatabaseService.addToCart(userPhone, productId, quantity);
      return true;
    } catch (error) {
      console.error('Failed to add to cart:', error);
      return false;
    }
  }

  async updateCartQuantity(productId: string, quantity: number): Promise<boolean> {
    try {
      const userPhone = await this.getCurrentUserPhone();
      if (!userPhone) return false;

      if (quantity <= 0) {
        return await this.removeFromCart(productId);
      }

      // Update in Supabase cart
      await DatabaseService.updateCartQuantity(userPhone, productId, quantity);
      return true;
    } catch (error) {
      console.error('Failed to update cart quantity:', error);
      return false;
    }
  }

  async removeFromCart(productId: string): Promise<boolean> {
    try {
      const userPhone = await this.getCurrentUserPhone();
      if (!userPhone) return false;

      // Remove from Supabase cart
      await DatabaseService.removeFromCart(userPhone, productId);
      return true;
    } catch (error) {
      console.error('Failed to remove from cart:', error);
      return false;
    }
  }

  async clearCart(): Promise<boolean> {
    try {
      const userPhone = await this.getCurrentUserPhone();
      if (!userPhone) return false;

      // Clear Supabase cart
      await DatabaseService.clearCart(userPhone);
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