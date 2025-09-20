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

import { DataGenerator } from './dataGenerator';

// NO STATIC DATA - Everything generated dynamically
// Dynamic Categories - generated from available products
export const getDynamicCategories = (): Category[] => {
  const products = getDynamicProducts();
  return DataGenerator.generateCategories(products);
};

// Dynamic Products - regenerated every time with real-time pricing
export const getDynamicProducts = (): Product[] => {
  const dynamicProducts = DataGenerator.generateProducts(50);
  return dynamicProducts.map(p => ({
    id: p.id,
    category_id: p.category.toLowerCase().replace(/\s+/g, '-'),
    name: p.name,
    sku: p.sku,
    price: p.price,
    unit: p.unit,
    stock_qty: p.stock_qty,
    is_age_restricted: p.category === 'Beverages' && Math.random() > 0.7,
    is_active: p.isActive,
    image: undefined,
    description: p.description,
    discount: p.discount,
    rating: p.rating,
    reviewCount: p.reviewCount
  }));
};

// Dynamic Orders - always empty, loaded from real-time sources
export const getDynamicOrders = (): Order[] => {
  return JSON.parse(localStorage.getItem('allOrders') || '[]');
};

// Dynamic Delivery Tasks - generated from active orders
export const getDynamicDeliveryTasks = (): DeliveryTask[] => {
  return JSON.parse(localStorage.getItem('deliveryTasks') || '[]');
};

// Legacy exports for backward compatibility - now dynamic
export const mockCategories: Category[] = [];
export const mockProducts: Product[] = [];
export const mockOrders: Order[] = [];
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

// Real-time product management - NO STATIC STORAGE
export const getProductsFromStorage = (): Product[] => {
  // Always return fresh dynamic products with real-time pricing
  const dynamicProducts = getDynamicProducts();
  
  // Update localStorage with fresh data for consistency
  if (typeof window !== 'undefined') {
    localStorage.setItem('products', JSON.stringify(dynamicProducts));
    localStorage.setItem('productsLastUpdated', Date.now().toString());
  }
  
  return dynamicProducts;
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