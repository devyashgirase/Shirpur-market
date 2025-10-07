// Mock Supabase service - completely safe mode
export const supabase = null;
export const isSupabaseEnabled = () => {
  // Always return false to prevent any Supabase initialization
  return false;
};

// Log the safe mode status
console.log('🛡️ Supabase Service: Safe Mock Mode Active');

export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  image: string;
  description?: string;
  stock: number;
  created_at?: string;
}

export interface Order {
  id: number;
  order_id: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  items: any[];
  total: number;
  status: string;
  payment_status: string;
  created_at: string;
  updated_at?: string;
}

export interface DeliveryAgent {
  id: number;
  name: string;
  phone: string;
  latitude?: number;
  longitude?: number;
  is_available: boolean;
  created_at?: string;
}

export class SupabaseService {
  static async getProducts(): Promise<Product[]> {
    return [];
  }

  static async addProduct(product: Omit<Product, 'id' | 'created_at'>): Promise<Product> {
    return { id: 1, created_at: new Date().toISOString(), ...product };
  }

  static async updateProduct(id: number, updates: Partial<Product>): Promise<Product> {
    return { id, ...updates } as Product;
  }

  static async deleteProduct(id: number): Promise<void> {
    return;
  }

  static async getOrders(): Promise<Order[]> {
    return [];
  }

  static async createOrder(order: Omit<Order, 'id' | 'created_at'>): Promise<Order> {
    return { id: 1, created_at: new Date().toISOString(), ...order };
  }

  static async updateOrderStatus(orderId: string, status: string): Promise<Order> {
    return {} as Order;
  }

  static async updatePaymentStatus(orderId: string, paymentStatus: string): Promise<Order> {
    return {} as Order;
  }

  static async getDeliveryAgents(): Promise<DeliveryAgent[]> {
    return [];
  }

  static async updateAgentLocation(phone: string, latitude: number, longitude: number): Promise<void> {
    return;
  }

  static async updateAgentAvailability(phone: string, isAvailable: boolean): Promise<void> {
    return;
  }

  static subscribeToOrders(callback: (payload: any) => void) {
    return null;
  }

  static subscribeToProducts(callback: (payload: any) => void) {
    return null;
  }
}