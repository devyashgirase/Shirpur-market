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
  customer_phone?: string;
  customer_address?: string;
  total_amount?: number;
  status?: string;
  items?: any[];
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

import { DataGenerator } from './dataGenerator';

// Dynamic Products - generated on app load
export const mockProducts: Product[] = DataGenerator.generateProducts(50).map(p => ({
  id: p.id,
  category_id: '1',
  name: p.name,
  sku: p.sku,
  price: p.price,
  unit: p.unit,
  stock_qty: p.stock_qty,
  is_age_restricted: false,
  is_active: true
}));

// Dynamic Orders - loaded from localStorage
export const mockOrders: Order[] = [];

// Dynamic Delivery Tasks - generated when orders are accepted
export const mockDeliveryTasks: DeliveryTask[] = [];

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

// Initialize products in localStorage
if (typeof window !== 'undefined' && !localStorage.getItem('products')) {
  localStorage.setItem('products', JSON.stringify(mockProducts));
}

export const getProductsFromStorage = (): Product[] => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('products');
    return stored ? JSON.parse(stored) : mockProducts;
  }
  return mockProducts;
};

export const updateProductStock = (productId: string, quantity: number) => {
  if (typeof window !== 'undefined') {
    const products = getProductsFromStorage();
    const updatedProducts = products.map(product => 
      product.id === productId 
        ? { ...product, stock_qty: Math.max(0, product.stock_qty - quantity) }
        : product
    );
    localStorage.setItem('products', JSON.stringify(updatedProducts));
    return updatedProducts;
  }
  return [];
};