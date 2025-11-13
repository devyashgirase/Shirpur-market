// Database-only data service - No hardcoded data
// Direct Supabase only

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

// Direct Supabase only
export const getProductsFromStorage = async (): Promise<Product[]> => {
  const { supabaseApi } = await import('./supabase');
  const products = await supabaseApi.getProducts();
  return products.map(p => ({
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

// Cart functions using Supabase
export const getCartFromStorage = async () => {
  const { supabaseApi } = await import('./supabase');
  const userPhone = localStorage.getItem('customerPhone') || 'guest';
  return await supabaseApi.getCart(userPhone);
};

export const addToCart = async (product: Product, quantity: number) => {
  const { supabaseApi } = await import('./supabase');
  const userPhone = localStorage.getItem('customerPhone') || 'guest';
  await supabaseApi.addToCart(userPhone, product.id, quantity);
  window.dispatchEvent(new CustomEvent('cartUpdated'));
  return true;
};