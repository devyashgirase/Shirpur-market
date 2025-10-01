import { currentDb, API_BASE_URL, DB_TYPE, useSupabase } from './database';
import { supabaseApi } from './supabase';

// Database Interfaces
export interface ApiProduct {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  stockQuantity: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiOrder {
  id?: number;
  orderId?: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  total: number;
  status: string;
  paymentStatus: string;
  items: ApiOrderItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiOrderItem {
  id?: number;
  productId: number;
  productName: string;
  price: number;
  quantity: number;
  orderId?: number;
}

export interface ApiCustomer {
  id?: number;
  name: string;
  phone: string;
  email?: string;
  address: string;
  coordinates?: { lat: number; lng: number };
  createdAt?: string;
}

export interface ApiDeliveryAgent {
  id?: number;
  name: string;
  phone: string;
  email?: string;
  vehicleType: string;
  licenseNumber: string;
  isActive: boolean;
  currentLat?: number;
  currentLng?: number;
  totalDeliveries?: number;
  rating?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiCategory {
  id?: number;
  name: string;
  slug: string;
  isActive: boolean;
  createdAt?: string;
}

class ApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    // Use Supabase for production, MySQL API for local
    if (useSupabase && DB_TYPE === 'supabase') {
      throw new Error('Use Supabase client methods for production');
    }
    
    try {
      console.log(`Making API request to: ${API_BASE_URL}${endpoint}`);
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API Error ${response.status}:`, errorText);
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log(`API Response for ${endpoint}:`, data);
      return data;
    } catch (error) {
      const isDevelopment = import.meta.env.DEV || window.location.hostname === 'localhost';
      
      if (isDevelopment) {
        console.warn(`API Request failed for ${endpoint}, using mock data:`, error);
        return this.getMockData<T>(endpoint);
      } else {
        console.error(`Production API Request failed for ${endpoint}:`, error);
        throw error; // Don't use mock data in production
      }
    }
  }

  // Products CRUD
  async getProducts(): Promise<ApiProduct[]> {
    if (useSupabase && DB_TYPE === 'supabase') {
      return supabaseApi.getProducts();
    }
    return this.request<ApiProduct[]>('/products');
  }

  async createProduct(product: Omit<ApiProduct, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiProduct> {
    if (useSupabase && DB_TYPE === 'supabase') {
      return supabaseApi.createProduct(product);
    }
    return this.request<ApiProduct>('/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  }

  async updateProduct(id: number, product: Partial<ApiProduct>): Promise<ApiProduct> {
    if (useSupabase && DB_TYPE === 'supabase') {
      return supabaseApi.updateProduct(id, product);
    }
    return this.request<ApiProduct>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(product),
    });
  }

  private getMockData<T>(endpoint: string): T {
    const now = new Date().toISOString();
    const mockData: Record<string, any> = {
      '/products': [
        { id: 1, name: 'Fresh Tomatoes', price: 40, category: 'Vegetables', stockQuantity: 100, isActive: true, description: 'Fresh red tomatoes', imageUrl: '/api/placeholder/300/200', createdAt: now },
        { id: 2, name: 'Basmati Rice', price: 120, category: 'Grains', stockQuantity: 50, isActive: true, description: 'Premium basmati rice', imageUrl: '/api/placeholder/300/200', createdAt: now },
        { id: 3, name: 'Organic Milk', price: 60, category: 'Dairy', stockQuantity: 30, isActive: true, description: 'Fresh organic milk', imageUrl: '/api/placeholder/300/200', createdAt: now }
      ],
      '/orders': [
        { 
          id: 1, 
          orderId: 'ORD001', 
          customerName: 'John Doe', 
          customerPhone: '9876543210', 
          deliveryAddress: '123 Main St, Shirpur', 
          total: 250, 
          status: 'out_for_delivery', 
          paymentStatus: 'paid', 
          items: [
            { id: 1, productId: 1, productName: 'Fresh Tomatoes', price: 40, quantity: 2 },
            { id: 2, productId: 2, productName: 'Basmati Rice', price: 120, quantity: 1 }
          ], 
          createdAt: now 
        },
        { 
          id: 2, 
          orderId: 'ORD002', 
          customerName: 'Jane Smith', 
          customerPhone: '9876543211', 
          deliveryAddress: '456 Oak Ave, Shirpur', 
          total: 180, 
          status: 'pending', 
          paymentStatus: 'pending', 
          items: [
            { id: 3, productId: 3, productName: 'Organic Milk', price: 60, quantity: 3 }
          ], 
          createdAt: now 
        }
      ],
      '/categories': [
        { id: 1, name: 'Vegetables', slug: 'vegetables', isActive: true, createdAt: now },
        { id: 2, name: 'Grains', slug: 'grains', isActive: true, createdAt: now },
        { id: 3, name: 'Dairy', slug: 'dairy', isActive: true, createdAt: now }
      ],
      '/analytics/dashboard': {
        totalOrders: 2,
        totalRevenue: 430,
        pendingOrders: 1,
        completedOrders: 1,
        totalProducts: 3,
        lowStockProducts: 0
      }
    };
    
    console.log(`Returning mock data for ${endpoint}:`, mockData[endpoint] || []);
    return mockData[endpoint] || [] as T;
  }

  // Orders CRUD
  async getOrders(): Promise<ApiOrder[]> {
    if (useSupabase && DB_TYPE === 'supabase') {
      return supabaseApi.getOrders();
    }
    return this.request<ApiOrder[]>('/orders');
  }

  async createOrder(order: Omit<ApiOrder, 'id' | 'orderId' | 'createdAt' | 'updatedAt'>): Promise<ApiOrder> {
    if (useSupabase && DB_TYPE === 'supabase') {
      return supabaseApi.createOrder(order);
    }
    return this.request<ApiOrder>('/orders', {
      method: 'POST',
      body: JSON.stringify(order),
    });
  }

  async updateOrderStatus(orderId: number, status: string): Promise<void> {
    if (useSupabase && DB_TYPE === 'supabase') {
      await supabaseApi.updateOrderStatus(orderId, status);
      return;
    }
    await this.request(`/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  // Categories
  async getCategories(): Promise<ApiCategory[]> {
    if (useSupabase && DB_TYPE === 'supabase') {
      return supabaseApi.getCategories();
    }
    return this.request<ApiCategory[]>('/categories');
  }

  // Customers
  async createCustomer(customer: Omit<ApiCustomer, 'id' | 'createdAt'>): Promise<ApiCustomer> {
    if (useSupabase && DB_TYPE === 'supabase') {
      return supabaseApi.createCustomer(customer);
    }
    return this.request<ApiCustomer>('/customers', {
      method: 'POST',
      body: JSON.stringify(customer),
    });
  }

  // Fallback methods for local development
  async getProduct(id: number): Promise<ApiProduct> {
    return this.request<ApiProduct>(`/products/${id}`);
  }

  async deleteProduct(id: number): Promise<void> {
    await this.request(`/products/${id}`, { method: 'DELETE' });
  }

  async getOrder(id: number): Promise<ApiOrder> {
    return this.request<ApiOrder>(`/orders/${id}`);
  }

  async updateOrder(id: number, order: Partial<ApiOrder>): Promise<ApiOrder> {
    return this.request<ApiOrder>(`/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(order),
    });
  }

  async deleteOrder(id: number): Promise<void> {
    await this.request(`/orders/${id}`, { method: 'DELETE' });
  }

  async getCustomers(): Promise<ApiCustomer[]> {
    return this.request<ApiCustomer[]>('/customers');
  }

  async getCustomer(id: number): Promise<ApiCustomer> {
    return this.request<ApiCustomer>(`/customers/${id}`);
  }

  async updateCustomer(id: number, customer: Partial<ApiCustomer>): Promise<ApiCustomer> {
    return this.request<ApiCustomer>(`/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(customer),
    });
  }

  async deleteCustomer(id: number): Promise<void> {
    await this.request(`/customers/${id}`, { method: 'DELETE' });
  }

  async getDeliveryAgents(): Promise<ApiDeliveryAgent[]> {
    return this.request<ApiDeliveryAgent[]>('/delivery-agents');
  }

  async getDeliveryAgent(id: number): Promise<ApiDeliveryAgent> {
    return this.request<ApiDeliveryAgent>(`/delivery-agents/${id}`);
  }

  async createDeliveryAgent(agent: Omit<ApiDeliveryAgent, 'id' | 'createdAt'>): Promise<ApiDeliveryAgent> {
    return this.request<ApiDeliveryAgent>('/delivery-agents', {
      method: 'POST',
      body: JSON.stringify(agent),
    });
  }

  async updateDeliveryAgent(id: number, agent: Partial<ApiDeliveryAgent>): Promise<ApiDeliveryAgent> {
    return this.request<ApiDeliveryAgent>(`/delivery-agents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(agent),
    });
  }

  async updateDeliveryLocation(agentId: number, latitude: number, longitude: number): Promise<void> {
    await this.request(`/delivery-agents/${agentId}/location`, {
      method: 'PUT',
      body: JSON.stringify({ latitude, longitude }),
    });
  }

  async deleteDeliveryAgent(id: number): Promise<void> {
    await this.request(`/delivery-agents/${id}`, { method: 'DELETE' });
  }

  async getCategory(id: number): Promise<ApiCategory> {
    return this.request<ApiCategory>(`/categories/${id}`);
  }

  async createCategory(category: Omit<ApiCategory, 'id' | 'createdAt'>): Promise<ApiCategory> {
    return this.request<ApiCategory>('/categories', {
      method: 'POST',
      body: JSON.stringify(category),
    });
  }

  async updateCategory(id: number, category: Partial<ApiCategory>): Promise<ApiCategory> {
    return this.request<ApiCategory>(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(category),
    });
  }

  async deleteCategory(id: number): Promise<void> {
    await this.request(`/categories/${id}`, { method: 'DELETE' });
  }

  async getDashboardStats(): Promise<any> {
    return this.request('/analytics/dashboard');
  }

  async getOrdersByStatus(status: string): Promise<ApiOrder[]> {
    return this.request<ApiOrder[]>(`/orders?status=${status}`);
  }

  async getOrdersByDateRange(startDate: string, endDate: string): Promise<ApiOrder[]> {
    return this.request<ApiOrder[]>(`/orders?startDate=${startDate}&endDate=${endDate}`);
  }

  async bulkCreateProducts(products: Omit<ApiProduct, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<ApiProduct[]> {
    return this.request<ApiProduct[]>('/products/bulk', {
      method: 'POST',
      body: JSON.stringify(products),
    });
  }

  async bulkUpdateProducts(updates: { id: number; data: Partial<ApiProduct> }[]): Promise<ApiProduct[]> {
    return this.request<ApiProduct[]>('/products/bulk', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }
}

export const apiService = new ApiService();

// Dynamic Data Manager
export class DynamicDataManager {
  static saveData(key: string, data: any): void {
    const dataWithTimestamp = {
      data,
      timestamp: Date.now(),
      version: '1.0'
    };
    localStorage.setItem(key, JSON.stringify(dataWithTimestamp));
  }

  static getData(key: string): any {
    const stored = localStorage.getItem(key);
    if (!stored) return null;
    
    try {
      const parsed = JSON.parse(stored);
      return parsed.data || parsed;
    } catch {
      return null;
    }
  }

  static async syncData(key: string, apiCall: () => Promise<any>): Promise<any> {
    try {
      const apiData = await apiCall();
      this.saveData(key, apiData);
      return apiData;
    } catch (error) {
      console.warn(`API sync failed for ${key}, using cached data:`, error);
      return this.getData(key) || [];
    }
  }

  static clearCache(): void {
    const keys = ['products', 'orders', 'customers', 'deliveryAgents', 'categories'];
    keys.forEach(key => localStorage.removeItem(key));
  }
}