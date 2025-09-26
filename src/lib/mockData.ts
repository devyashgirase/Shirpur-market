// Database-only data service - No hardcoded data
import { apiService } from './apiService';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category_id: string;
  stock_qty: number;
  is_active: boolean;
  sku: string;
  unit: string;
  is_age_restricted: boolean;
}

export const getProductsFromStorage = async (): Promise<Product[]> => {
  try {
    const products = await apiService.getProducts();
    return products.map(p => ({
      id: p.id.toString(),
      name: p.name,
      description: p.description,
      price: p.price,
      image_url: p.imageUrl,
      category_id: p.category.toLowerCase().replace(/\s+/g, '-'),
      stock_qty: p.stockQuantity,
      is_active: p.isActive,
      sku: `SKU${p.id}`,
      unit: 'kg',
      is_age_restricted: false
    }));
  } catch (error) {
    console.error('Failed to fetch products from API:', error);
    return [];
  }
};

export const getDynamicCategories = async () => {
  try {
    const products = await getProductsFromStorage();
    const categoryMap = new Map();
    
    products.forEach(product => {
      if (!categoryMap.has(product.category_id)) {
        categoryMap.set(product.category_id, {
          id: product.category_id,
          name: product.category_id.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          slug: product.category_id,
          is_active: true,
          productCount: 0
        });
      }
      categoryMap.get(product.category_id).productCount++;
    });
    
    return Array.from(categoryMap.values());
  } catch (error) {
    console.error('Failed to generate categories:', error);
    return [];
  }
};

export const mockOrders = [];
export const mockDeliveryTasks = [];

export const getCartFromStorage = () => {
  return JSON.parse(localStorage.getItem('cart') || '[]');
};

export const getCartTotal = () => {
  const cart = getCartFromStorage();
  return cart.reduce((total: number, item: any) => total + (item.product.price * item.quantity), 0);
};

export const addToCart = (product: Product, quantity: number) => {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const existingItem = cart.find((item: any) => item.product.id === product.id);
  
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({ product, quantity });
  }
  
  localStorage.setItem('cart', JSON.stringify(cart));
};

export const updateCartQuantity = (productId: string, newQuantity: number) => {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const item = cart.find((item: any) => item.product.id === productId);
  
  if (item) {
    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else {
      item.quantity = newQuantity;
      localStorage.setItem('cart', JSON.stringify(cart));
    }
  }
};

export const removeFromCart = (productId: string) => {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const updatedCart = cart.filter((item: any) => item.product.id !== productId);
  localStorage.setItem('cart', JSON.stringify(updatedCart));
};

export const clearCart = () => {
  localStorage.setItem('cart', '[]');
  window.dispatchEvent(new CustomEvent('cartUpdated'));
};

export const saveLastOrder = (orderData: any) => {
  localStorage.setItem('lastOrder', JSON.stringify({
    ...orderData,
    timestamp: Date.now()
  }));
};

export const getLastOrder = () => {
  const lastOrder = localStorage.getItem('lastOrder');
  return lastOrder ? JSON.parse(lastOrder) : null;
};

export const updateProductStock = (productId: string, quantityUsed: number): Product[] => {
  // This should update stock in database via API
  // For now, return empty array as we're using database-only approach
  return [];
};