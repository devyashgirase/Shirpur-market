// Database-only data service - No hardcoded data
// Direct Supabase integration - no mock data
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
    const { supabaseApi } = await import('./supabase');
    const products = await supabaseApi.getProducts();
    console.log('🔍 getProductsFromStorage: Raw Supabase products:', products);
    
    return products
      .filter(p => p && p.id && p.name && p.is_available === true)
      .map(p => ({
        id: String(p.id),
        name: String(p.name),
        description: String(p.description || ''),
        price: Number(p.price || 0),
        image_url: p.image_url || '/placeholder.svg',
        category_id: String(p.category || 'general').toLowerCase().replace(/\s+/g, '-'),
        stock_qty: Number(p.stock_quantity || 0),
        is_active: Boolean(p.is_available),
        sku: `SKU${p.id}`,
        unit: 'kg',
        is_age_restricted: false
      }));
  } catch (error) {
    console.error('Failed to fetch products from Supabase:', error);
    return [];
  }
};

export const getDynamicCategories = async () => {
  try {
    const products = await getProductsFromStorage();
    const categoryMap = new Map();
    
    products.forEach(product => {
      if (product && product.category_id && !categoryMap.has(product.category_id)) {
        const categoryName = String(product.category_id || 'general').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        categoryMap.set(product.category_id, {
          id: product.category_id,
          name: categoryName,
          slug: product.category_id,
          is_active: true,
          productCount: 0
        });
      }
      if (product && product.category_id && categoryMap.has(product.category_id)) {
        categoryMap.get(product.category_id).productCount++;
      }
    });
    
    return Array.from(categoryMap.values());
  } catch (error) {
    console.error('Failed to generate categories:', error);
    return [];
  }
};

// No mock data - all data from Supabase database only

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
    window.dispatchEvent(new CustomEvent('cartUpdated'));
  }
  return success;
};

export const updateCartQuantity = async (productId: string, newQuantity: number) => {
  const success = await cartService.updateCartQuantity(productId, newQuantity);
  if (success) {
    window.dispatchEvent(new CustomEvent('cartUpdated'));
  }
  return success;
};

export const removeFromCart = async (productId: string) => {
  const success = await cartService.removeFromCart(productId);
  if (success) {
    window.dispatchEvent(new CustomEvent('cartUpdated'));
  }
  return success;
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