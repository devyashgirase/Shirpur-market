import { apiService, DynamicDataManager, ApiProduct, ApiOrder, ApiCustomer, ApiCategory } from './apiService';

export class CustomerDataService {
  // Get all customer orders with dynamic caching
  static async getCustomerOrders() {
    const customerPhone = localStorage.getItem('customerPhone');
    if (!customerPhone) return [];

    return DynamicDataManager.syncData(`customerOrders_${customerPhone}`, async () => {
      const allOrders = await apiService.getOrders();
      return allOrders
        .filter(order => order.customerPhone === customerPhone)
        .map(order => ({
          id: order.orderId,
          orderId: order.orderId,
          status: order.status,
          total: order.total,
          items: order.items || [],
          createdAt: order.createdAt || new Date().toISOString(),
          deliveryAddress: order.deliveryAddress,
          customerName: order.customerName,
          customerPhone: order.customerPhone,
          paymentStatus: order.paymentStatus
        }))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    });
  }

  // Get available products with dynamic updates
  static async getAvailableProducts(): Promise<ApiProduct[]> {
    try {
      console.log('CustomerDataService: Fetching products from API...');
      const products = await apiService.getProducts();
      console.log('CustomerDataService: Raw products from API:', products);
      console.log('CustomerDataService: Number of products:', products.length);
      
      const filteredProducts = products
        .filter(product => {
          const isActive = product.isActive !== undefined ? product.isActive : product.is_active;
          console.log(`Product ${product.name}: isActive=${isActive}`);
          return isActive === true || isActive === 1 || isActive === '1';
        })
        .map(product => ({
          id: product.id,
          name: product.name,
          description: product.description,
          price: typeof product.price === 'string' ? parseFloat(product.price) : product.price,
          imageUrl: product.imageUrl || product.image,
          category: product.category,
          stockQuantity: product.stockQuantity || product.stock_quantity || 0,
          isActive: product.isActive !== undefined ? product.isActive : product.is_active
        }));
      
      // Save to cache
      DynamicDataManager.saveData('availableProducts', filteredProducts);
      console.log('CustomerDataService: Filtered products for customer:', filteredProducts);
      console.log('CustomerDataService: Returning', filteredProducts.length, 'products');
      return filteredProducts;
    } catch (error) {
      console.error('Failed to fetch products from API, using cached data:', error);
      return DynamicDataManager.getData('availableProducts') || [];
    }
  }

  // Get all categories dynamically
  static async getCategories(): Promise<ApiCategory[]> {
    return DynamicDataManager.syncData('categories', async () => {
      return await apiService.getCategories();
    });
  }

  // Search products dynamically
  static async searchProducts(query: string): Promise<ApiProduct[]> {
    const products = await this.getAvailableProducts();
    return products.filter(product => 
      String(product.name || '').toLowerCase().includes(query.toLowerCase()) ||
      String(product.description || '').toLowerCase().includes(query.toLowerCase()) ||
      String(product.category || '').toLowerCase().includes(query.toLowerCase())
    );
  }

  // Get products by category
  static async getProductsByCategory(categoryId: string): Promise<ApiProduct[]> {
    const products = await this.getAvailableProducts();
    return products.filter(product => 
      String(product.category || '').toLowerCase().replace(/\s+/g, '-') === categoryId
    );
  }

  // Create order with full data persistence
  static async createOrder(orderData: any) {
    try {
      const apiOrder = {
        customerName: orderData.customerAddress.name,
        customerPhone: orderData.customerAddress.phone,
        deliveryAddress: orderData.customerAddress.address,
        total: orderData.total,
        status: orderData.status,
        paymentStatus: orderData.paymentStatus,
        items: orderData.items.map((item: any) => ({
          productId: parseInt(item.product.id),
          productName: item.product.name,
          price: item.product.price,
          quantity: item.quantity
        }))
      };

      const createdOrder = await apiService.createOrder(apiOrder);
      
      // Save order data locally for immediate access
      DynamicDataManager.saveData('currentOrder', createdOrder);
      DynamicDataManager.saveData('customerAddress', orderData.customerAddress);
      
      // Update cached orders list
      const customerPhone = orderData.customerAddress.phone;
      const cachedOrders = DynamicDataManager.getData(`customerOrders_${customerPhone}`) || [];
      cachedOrders.unshift(createdOrder);
      DynamicDataManager.saveData(`customerOrders_${customerPhone}`, cachedOrders);
      
      return createdOrder;
    } catch (error) {
      console.error('Customer: Failed to create order', error);
      return null;
    }
  }

  // Save customer profile data
  static async saveCustomerProfile(customerData: Omit<ApiCustomer, 'id' | 'createdAt'>): Promise<ApiCustomer | null> {
    try {
      const customer = await apiService.createCustomer(customerData);
      DynamicDataManager.saveData('customerProfile', customer);
      localStorage.setItem('customerPhone', customer.phone);
      return customer;
    } catch (error) {
      console.error('Failed to save customer profile:', error);
      return null;
    }
  }

  // Get customer profile
  static getCustomerProfile(): ApiCustomer | null {
    return DynamicDataManager.getData('customerProfile');
  }

  // Update customer profile
  static async updateCustomerProfile(customerId: number, updates: Partial<ApiCustomer>): Promise<ApiCustomer | null> {
    try {
      const updatedCustomer = await apiService.updateCustomer(customerId, updates);
      DynamicDataManager.saveData('customerProfile', updatedCustomer);
      return updatedCustomer;
    } catch (error) {
      console.error('Failed to update customer profile:', error);
      return null;
    }
  }

  // Get customer metrics with real-time data
  static getCustomerMetrics(orders: any[]) {
    const now = new Date();
    const thisMonth = orders.filter(o => {
      const orderDate = new Date(o.createdAt);
      return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
    });
    
    return {
      totalOrders: orders.length,
      totalSpent: orders.reduce((sum, o) => sum + o.total, 0),
      activeOrders: orders.filter(o => ['pending', 'confirmed', 'preparing', 'out_for_delivery'].includes(o.status)).length,
      completedOrders: orders.filter(o => o.status === 'delivered').length,
      monthlyOrders: thisMonth.length,
      monthlySpent: thisMonth.reduce((sum, o) => sum + o.total, 0),
      averageOrderValue: orders.length > 0 ? orders.reduce((sum, o) => sum + o.total, 0) / orders.length : 0,
      lastOrderDate: orders.length > 0 ? orders[0].createdAt : null
    };
  }

  // Get real-time order updates
  static async getOrderUpdates(orderId: string): Promise<any> {
    try {
      const orders = await apiService.getOrders();
      const order = orders.find(o => o.orderId === orderId);
      if (order) {
        DynamicDataManager.saveData('currentOrder', order);
      }
      return order;
    } catch (error) {
      console.error('Failed to get order updates:', error);
      return DynamicDataManager.getData('currentOrder');
    }
  }

  // Clear customer session data
  static clearCustomerSession(): void {
    const keys = ['currentOrder', 'customerAddress', 'customerProfile', 'cart'];
    keys.forEach(key => localStorage.removeItem(key));
    localStorage.removeItem('customerPhone');
  }

  // Get cart data with persistence
  static getCart(): any[] {
    return DynamicDataManager.getData('cart') || [];
  }

  // Save cart data
  static saveCart(cartItems: any[]): void {
    DynamicDataManager.saveData('cart', cartItems);
  }

  // Add item to cart
  static addToCart(product: any, quantity: number = 1): void {
    const cart = this.getCart();
    const existingItem = cart.find(item => item.product.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push({ product, quantity });
    }
    
    this.saveCart(cart);
  }

  // Remove item from cart
  static removeFromCart(productId: string): void {
    const cart = this.getCart();
    const updatedCart = cart.filter(item => item.product.id !== productId);
    this.saveCart(updatedCart);
  }

  // Update cart item quantity
  static updateCartQuantity(productId: string, quantity: number): void {
    const cart = this.getCart();
    const item = cart.find(item => item.product.id === productId);
    
    if (item) {
      if (quantity <= 0) {
        this.removeFromCart(productId);
      } else {
        item.quantity = quantity;
        this.saveCart(cart);
      }
    }
  }

  // Clear cart
  static clearCart(): void {
    this.saveCart([]);
  }

  // Get cart total
  static getCartTotal(): number {
    const cart = this.getCart();
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  }
}