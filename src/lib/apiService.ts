const API_BASE_URL = 'http://localhost:5000/api';

export interface ApiProduct {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  stockQuantity: number;
  isActive: boolean;
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
}

export interface ApiOrderItem {
  productId: number;
  productName: string;
  price: number;
  quantity: number;
}

class ApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    
    return response.json();
  }

  // Products
  async getProducts(): Promise<ApiProduct[]> {
    return this.request<ApiProduct[]>('/products');
  }

  async createProduct(product: Omit<ApiProduct, 'id'>): Promise<ApiProduct> {
    return this.request<ApiProduct>('/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  }

  // Orders
  async getOrders(): Promise<ApiOrder[]> {
    return this.request<ApiOrder[]>('/orders');
  }

  async createOrder(order: Omit<ApiOrder, 'id' | 'orderId'>): Promise<ApiOrder> {
    return this.request<ApiOrder>('/orders', {
      method: 'POST',
      body: JSON.stringify(order),
    });
  }

  async updateOrderStatus(orderId: number, status: string): Promise<void> {
    await this.request(`/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify(status),
    });
  }

  async updateDeliveryLocation(orderId: number, latitude: number, longitude: number): Promise<void> {
    await this.request(`/orders/${orderId}/location`, {
      method: 'PUT',
      body: JSON.stringify({ latitude, longitude }),
    });
  }
}

export const apiService = new ApiService();