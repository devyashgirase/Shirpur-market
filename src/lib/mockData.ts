// Database-only data service - No hardcoded data
import { apiService } from './apiService';
import { cartService } from './cartService';
import { personalizationService } from './personalizationService';

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

// Database-based cart functions
export const getCartFromStorage = async () => {
  return await cartService.getCartItems();
};

export const getCartTotal = async () => {
  return await cartService.getCartTotal();
};

export const addToCart = async (product: Product, quantity: number) => {
  const success = await cartService.addToCart(product.id, quantity);
  if (success) {
    await personalizationService.trackAddToCart(product);
  }
  return success;
};

export const updateCartQuantity = async (productId: string, newQuantity: number) => {
  return await cartService.updateCartQuantity(productId, newQuantity);
};

export const removeFromCart = async (productId: string) => {
  return await cartService.removeFromCart(productId);
};

export const clearCart = async () => {
  const success = await cartService.clearCart();
  if (success) {
    window.dispatchEvent(new CustomEvent('cartUpdated'));
  }
  return success;
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
  return [];
};