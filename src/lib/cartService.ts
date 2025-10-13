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

      // Try Supabase first
      try {
        const cartData = await DatabaseService.getCart(userPhone);
        if (cartData && cartData.length > 0) {
          return cartData;
        }
      } catch (dbError) {
        console.warn('Supabase cart failed, using localStorage fallback:', dbError);
      }

      // Fallback to localStorage
      const localCart = localStorage.getItem(`cart_${userPhone}`);
      return localCart ? JSON.parse(localCart) : [];
    } catch (error) {
      console.error('Failed to get cart items:', error);
      return [];
    }
  }

  async addToCart(productId: string, quantity: number = 1, productData?: any): Promise<boolean> {
    try {
      const userPhone = await this.getCurrentUserPhone();
      if (!userPhone) return false;

      // Try Supabase first
      try {
        await DatabaseService.addToCart(userPhone, productId, quantity);
      } catch (dbError) {
        console.warn('Supabase add to cart failed, using localStorage:', dbError);
      }

      // Always update localStorage as backup
      const currentCart = await this.getCartItems();
      const existingItem = currentCart.find(item => item.product.id === productId);
      
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        // Use provided product data or get from products
        let productInfo = productData;
        if (!productInfo) {
          try {
            const { CustomerDataService } = await import('./customerDataService');
            const products = await CustomerDataService.getAvailableProducts();
            productInfo = products.find(p => String(p.id) === String(productId));
          } catch (error) {
            console.warn('Could not fetch product details:', error);
          }
        }
        
        const newItem: CartItem = {
          id: Date.now(),
          product: {
            id: productId,
            name: productInfo?.name || `Product ${productId}`,
            price: productInfo?.price || 0,
            image_url: productInfo?.image_url || productInfo?.imageUrl || '/placeholder.svg',
            stock_qty: productInfo?.stock_quantity || productInfo?.stockQuantity || 100
          },
          quantity
        };
        currentCart.push(newItem);
      }
      
      localStorage.setItem(`cart_${userPhone}`, JSON.stringify(currentCart));
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