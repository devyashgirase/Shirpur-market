import { apiService } from './apiService';
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

      // Fallback to localStorage when API is unavailable
      const localCart = localStorage.getItem(`cart_${userPhone}`);
      return localCart ? JSON.parse(localCart) : [];
    } catch (error) {
      console.error('Failed to get cart items:', error);
      return [];
    }
  }

  async addToCart(productId: string, quantity: number = 1): Promise<boolean> {
    try {
      const userPhone = await this.getCurrentUserPhone();
      if (!userPhone) return false;

      // Fallback to localStorage when API is unavailable
      const cartKey = `cart_${userPhone}`;
      const cart = JSON.parse(localStorage.getItem(cartKey) || '[]');
      const existingItem = cart.find((item: any) => item.product.id === productId);
      
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        // Get product details from API service (which has mock fallback)
        const products = await apiService.getProducts();
        const product = products.find(p => p.id.toString() === productId);
        if (product) {
          cart.push({
            id: Date.now(),
            product: {
              id: productId,
              name: String(product.name || 'Unknown Product'),
              price: Number(product.price || 0),
              image_url: product.imageUrl || '/placeholder.svg',
              stock_qty: Number(product.stockQuantity || 0)
            },
            quantity
          });
        }
      }
      
      localStorage.setItem(cartKey, JSON.stringify(cart));
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

      // Fallback to localStorage when API is unavailable
      const cartKey = `cart_${userPhone}`;
      const cart = JSON.parse(localStorage.getItem(cartKey) || '[]');
      const item = cart.find((item: any) => item.product.id === productId);
      
      if (item) {
        item.quantity = quantity;
        localStorage.setItem(cartKey, JSON.stringify(cart));
      }
      
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

      // Fallback to localStorage when API is unavailable
      const cartKey = `cart_${userPhone}`;
      const cart = JSON.parse(localStorage.getItem(cartKey) || '[]');
      const updatedCart = cart.filter((item: any) => item.product.id !== productId);
      localStorage.setItem(cartKey, JSON.stringify(updatedCart));
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

      // Fallback to localStorage when API is unavailable
      localStorage.removeItem(`cart_${userPhone}`);
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