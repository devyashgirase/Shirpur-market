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
      return 'guest';
    }
  }

  private getLocalStorageKey(userPhone: string): string {
    return `cart_${userPhone}`;
  }

  private getLocalCart(userPhone: string): CartItem[] {
    try {
      const stored = localStorage.getItem(this.getLocalStorageKey(userPhone));
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private saveLocalCart(userPhone: string, cart: CartItem[]): void {
    localStorage.setItem(this.getLocalStorageKey(userPhone), JSON.stringify(cart));
  }

  async getCartItems(): Promise<CartItem[]> {
    const userPhone = await this.getCurrentUserPhone();
    if (!userPhone) return [];

    try {
      const cartData = await DatabaseService.getCart(userPhone);
      return cartData || [];
    } catch (error) {
      console.warn('Database cart failed, using localStorage:', error);
      return this.getLocalCart(userPhone);
    }
  }

  async addToCart(productId: string, quantity: number = 1, productData?: any): Promise<boolean> {
    const userPhone = await this.getCurrentUserPhone();
    if (!userPhone) return false;

    try {
      await DatabaseService.addToCart(userPhone, productId, quantity);
      return true;
    } catch (error) {
      console.warn('Database add failed, using localStorage:', error);
      
      if (!productData) return false;
      
      const cart = this.getLocalCart(userPhone);
      const existingIndex = cart.findIndex(item => item.product.id === productId);
      
      if (existingIndex >= 0) {
        cart[existingIndex].quantity += quantity;
      } else {
        cart.push({
          id: Date.now(),
          product: {
            id: productId,
            name: productData.name,
            price: productData.price,
            image_url: productData.image_url || '/placeholder.svg',
            stock_qty: productData.stock_qty || 100
          },
          quantity
        });
      }
      
      this.saveLocalCart(userPhone, cart);
      return true;
    }
  }

  async updateCartQuantity(productId: string, quantity: number): Promise<boolean> {
    const userPhone = await this.getCurrentUserPhone();
    if (!userPhone) return false;

    if (quantity <= 0) {
      return await this.removeFromCart(productId);
    }

    try {
      await DatabaseService.updateCartQuantity(userPhone, productId, quantity);
      return true;
    } catch (error) {
      console.warn('Database update failed, using localStorage:', error);
      
      const cart = this.getLocalCart(userPhone);
      const itemIndex = cart.findIndex(item => item.product.id === productId);
      
      if (itemIndex >= 0) {
        cart[itemIndex].quantity = quantity;
        this.saveLocalCart(userPhone, cart);
        return true;
      }
      return false;
    }
  }

  async removeFromCart(productId: string): Promise<boolean> {
    const userPhone = await this.getCurrentUserPhone();
    if (!userPhone) return false;

    try {
      await DatabaseService.removeFromCart(userPhone, productId);
      return true;
    } catch (error) {
      console.warn('Database remove failed, using localStorage:', error);
      
      const cart = this.getLocalCart(userPhone);
      const filteredCart = cart.filter(item => item.product.id !== productId);
      this.saveLocalCart(userPhone, filteredCart);
      return true;
    }
  }

  async clearCart(): Promise<boolean> {
    const userPhone = await this.getCurrentUserPhone();
    if (!userPhone) return false;

    try {
      await DatabaseService.clearCart(userPhone);
    } catch (error) {
      console.warn('Database clear failed, using localStorage:', error);
    }
    
    this.saveLocalCart(userPhone, []);
    return true;
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