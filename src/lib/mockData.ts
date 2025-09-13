// Mock data for the delivery system
export interface Category {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
}

export interface Product {
  id: string;
  category_id: string;
  name: string;
  sku: string;
  price: number;
  unit: string;
  stock_qty: number;
  is_age_restricted: boolean;
  is_active: boolean;
  image?: string;
}

export interface Order {
  id: string;
  customer_id: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';
  total: number;
  payment_status: 'pending' | 'paid' | 'failed';
  created_at: string;
  customer_name?: string;
  customer_address?: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  qty: number;
  price: number;
  product_name?: string;
}

export interface DeliveryTask {
  id: string;
  order_id: string;
  assigned_to_user_id: string;
  otp_hash?: string;
  otp_salt?: string;
  otp_expires_at?: string;
  verify_attempts: number;
  verified_at?: string;
  delivery_lat?: number;
  delivery_lng?: number;
  customer_name?: string;
  customer_address?: string;
  total_amount?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

// Mock Categories
export const mockCategories: Category[] = [
  { id: '1', name: 'Groceries', slug: 'groceries', is_active: true },
  { id: '2', name: 'Beverages', slug: 'beverages', is_active: true },
  { id: '3', name: 'Electronics', slug: 'electronics', is_active: true },
  { id: '4', name: 'Healthcare', slug: 'healthcare', is_active: true },
  { id: '5', name: 'Personal Care', slug: 'personal-care', is_active: true },
];

// Mock Products
export const mockProducts: Product[] = [
  { id: '1', category_id: '1', name: 'Organic Bananas', sku: 'BAN001', price: 2.99, unit: 'bunch', stock_qty: 50, is_age_restricted: false, is_active: true },
  { id: '2', category_id: '1', name: 'Whole Milk', sku: 'MLK001', price: 3.49, unit: 'gallon', stock_qty: 30, is_age_restricted: false, is_active: true },
  { id: '3', category_id: '1', name: 'Fresh Bread', sku: 'BRD001', price: 2.29, unit: 'loaf', stock_qty: 25, is_age_restricted: false, is_active: true },
  { id: '4', category_id: '2', name: 'Orange Juice', sku: 'OJ001', price: 4.99, unit: 'bottle', stock_qty: 40, is_age_restricted: false, is_active: true },
  { id: '5', category_id: '2', name: 'Craft Beer', sku: 'BEER001', price: 8.99, unit: '6-pack', stock_qty: 20, is_age_restricted: true, is_active: true },
  { id: '6', category_id: '3', name: 'Wireless Headphones', sku: 'WH001', price: 99.99, unit: 'piece', stock_qty: 15, is_age_restricted: false, is_active: true },
  { id: '7', category_id: '4', name: 'Pain Relief', sku: 'PR001', price: 12.99, unit: 'bottle', stock_qty: 35, is_age_restricted: false, is_active: true },
  { id: '8', category_id: '5', name: 'Shampoo', sku: 'SH001', price: 7.99, unit: 'bottle', stock_qty: 45, is_age_restricted: false, is_active: true },
];

// Mock Orders
export const mockOrders: Order[] = [
  {
    id: '1001',
    customer_id: 'cust_1',
    status: 'out_for_delivery',
    total: 45.67,
    payment_status: 'paid',
    created_at: new Date().toISOString(),
    customer_name: 'John Smith',
    customer_address: '123 Main St, Springfield, IL 62701'
  },
  {
    id: '1002',
    customer_id: 'cust_2',
    status: 'preparing',
    total: 23.45,
    payment_status: 'paid',
    created_at: new Date(Date.now() - 3600000).toISOString(),
    customer_name: 'Sarah Johnson',
    customer_address: '456 Oak Ave, Springfield, IL 62702'
  },
  {
    id: '1003',
    customer_id: 'cust_3',
    status: 'delivered',
    total: 78.90,
    payment_status: 'paid',
    created_at: new Date(Date.now() - 7200000).toISOString(),
    customer_name: 'Mike Davis',
    customer_address: '789 Pine Rd, Springfield, IL 62703'
  },
];

// Mock Delivery Tasks
export const mockDeliveryTasks: DeliveryTask[] = [
  {
    id: 'task_1',
    order_id: '1001',
    assigned_to_user_id: 'delivery_1',
    verify_attempts: 0,
    customer_name: 'John Smith',
    customer_address: '123 Main St, Springfield, IL 62701',
    total_amount: 45.67,
    delivery_lat: 39.7817,
    delivery_lng: -89.6501
  },
  {
    id: 'task_2',
    order_id: '1004',
    assigned_to_user_id: 'delivery_1',
    verify_attempts: 0,
    customer_name: 'Lisa Wilson',
    customer_address: '321 Elm St, Springfield, IL 62704',
    total_amount: 67.23,
    delivery_lat: 39.7901,
    delivery_lng: -89.6440
  },
];

// Cart utilities
export const getCartFromStorage = (): CartItem[] => {
  try {
    const cart = localStorage.getItem('deliveryCart');
    return cart ? JSON.parse(cart) : [];
  } catch {
    return [];
  }
};

export const saveCartToStorage = (cart: CartItem[]) => {
  localStorage.setItem('deliveryCart', JSON.stringify(cart));
};

export const addToCart = (product: Product, quantity: number = 1) => {
  const cart = getCartFromStorage();
  const existingItem = cart.find(item => item.product.id === product.id);
  
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({ product, quantity });
  }
  
  saveCartToStorage(cart);
  return cart;
};

export const removeFromCart = (productId: string) => {
  const cart = getCartFromStorage();
  const updatedCart = cart.filter(item => item.product.id !== productId);
  saveCartToStorage(updatedCart);
  return updatedCart;
};

export const updateCartQuantity = (productId: string, quantity: number) => {
  const cart = getCartFromStorage();
  const item = cart.find(item => item.product.id === productId);
  
  if (item) {
    if (quantity <= 0) {
      return removeFromCart(productId);
    }
    item.quantity = quantity;
    saveCartToStorage(cart);
  }
  
  return cart;
};

export const clearCart = () => {
  localStorage.removeItem('deliveryCart');
  return [];
};

export const getCartTotal = (cart: CartItem[]) => {
  return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
};