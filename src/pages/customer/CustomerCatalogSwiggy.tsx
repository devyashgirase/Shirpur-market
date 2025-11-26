import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Minus, ShoppingCart, Package, Star, Heart, Zap, TrendingUp, Truck, MapPin, ChevronDown, Search } from "lucide-react";
import { type Product } from "@/lib/mockData";
import { cartService } from "@/lib/cartService";
import { CustomerDataService } from "@/lib/customerDataService";
import { useToast } from "@/hooks/use-toast";
import BannerCarousel from "@/components/BannerCarousel";
import ProductDetailModal from "@/components/ProductDetailModal";
import SuccessAlert from "@/components/SuccessAlert";
import "@/styles/swiggy-homepage.css";

const CustomerCatalogSwiggy = () => {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    // Check if coming from home page and preserve any existing cart context
    const homePageContext = localStorage.getItem('homePageContext');
    if (homePageContext) {
      localStorage.removeItem('homePageContext');
      // Ensure cart is properly initialized for guest users
      const customerPhone = localStorage.getItem('customerPhone');
      if (!customerPhone) {
        localStorage.setItem('customerPhone', 'guest');
      }
    }
    
    const loadCustomerProducts = async () => {
      try {
        setLoading(true);
        const customerProducts = await CustomerDataService.getAvailableProducts();
        const formattedProducts = customerProducts.map(p => {
          if (!p) return null;
          const category = p.category || p.category_id || 'general';
          return {
            id: String(p.id || Date.now()),
            name: String(p.name || 'Unknown Product'),
            description: String(p.description || ''),
            price: parseFloat(p.price || 0),
            image_url: p.image_url || p.imageUrl || '/placeholder.svg',
            category_id: String(category).toLowerCase().replace(/\s+/g, '-'),
            stock_qty: parseInt(p.stock_quantity || p.stockQuantity || 0),
            is_active: p.is_available !== undefined ? p.is_available : (p.is_active !== undefined ? p.is_active : p.isActive),
            sku: `SKU${p.id || Date.now()}`,
            unit: 'kg',
            is_age_restricted: false
          };
        }).filter(Boolean);
        const activeProducts = formattedProducts.filter(p => p.is_active);
        setProducts(activeProducts);
        
        const categoryMap = new Map();
        formattedProducts.forEach(product => {
          if (product && product.category_id && !categoryMap.has(product.category_id)) {
            const categoryName = String(product.category_id || 'general').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            categoryMap.set(product.category_id, {
              id: product.category_id,
              name: categoryName,
              is_active: true
            });
          }
        });
        setCategories(Array.from(categoryMap.values()));
      } catch (error) {
        console.error('Failed to load products:', error);
        setProducts([]);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadCustomerProducts();
  }, []);
  
  useEffect(() => {
    // Listen for category selection from carousel
    const handleCategorySelected = (event: CustomEvent) => {
      console.log('Category selected from carousel:', event.detail);
      setSelectedCategory(event.detail);
    };
    
    // Listen for product selection from carousel
    const handleProductSelected = (event: CustomEvent) => {
      console.log('Product selected from carousel:', event.detail);
      const productId = event.detail;
      const product = products.find(p => p.id === productId);
      if (product) {
        setSelectedProduct(product);
        setIsProductModalOpen(true);
      }
    };
    
    window.addEventListener('categorySelected', handleCategorySelected as EventListener);
    window.addEventListener('productSelected', handleProductSelected as EventListener);
    
    return () => {
      window.removeEventListener('categorySelected', handleCategorySelected as EventListener);
      window.removeEventListener('productSelected', handleProductSelected as EventListener);
    };
  }, [products]);

  const filteredProducts = products.filter(p => {
    if (!p || !p.is_active) return false;
    const matchesCategory = selectedCategory === 'all' || p.category_id === selectedCategory;
    const matchesSearch = !searchQuery || 
      String(p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(p.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });
  
  const getCategoryName = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.name || 'Unknown';
  };

  const handleAddToCart = async (product: Product) => {
    if (product.stock_qty > 0) {
      try {
        const success = await cartService.addToCart(product.id, 1);
        if (success) {
          setSuccessMessage(`${product.name} has been added to your cart`);
          setShowSuccess(true);
          window.dispatchEvent(new CustomEvent('cartUpdated'));
        } else {
          toast({
            title: "Error",
            description: "Failed to add item to cart. Please try again.",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Error adding to cart:', error);
        toast({
          title: "Error",
          description: "Failed to add item to cart. Please try again.",
          variant: "destructive"
        });
      }
    } else {
      toast({
        title: "Out of Stock",
        description: `${product.name} is currently out of stock.`,
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-md animate-pulse">
                <div className="aspect-[4/3] bg-gray-200 rounded-t-2xl"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Full Width Banner Carousel */}
      <BannerCarousel />

      {/* What's on your mind Section */}
      <section className="bg-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">What's on your mind?</h2>
            <div className="flex gap-2">
              <button className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors">
                <span className="text-gray-600">←</span>
              </button>
              <button className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors">
                <span className="text-gray-600">→</span>
              </button>
            </div>
          </div>
          <div className="flex overflow-x-auto gap-8 pb-4 scrollbar-hide">
            {/* All Category */}
            <div 
              className="flex flex-col items-center cursor-pointer hover:scale-105 transition-transform flex-shrink-0"
              onClick={() => {
                setSelectedCategory('all');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              <div className="w-24 h-24 rounded-full overflow-hidden mb-2 bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center">
                <span className="text-3xl">🍽️</span>
              </div>
              <p className="text-base font-medium text-gray-700 text-center whitespace-nowrap">All</p>
            </div>
            
            {categories.map((category, index) => (
              <div 
                key={index} 
                className="flex flex-col items-center cursor-pointer hover:scale-105 transition-transform flex-shrink-0"
                onClick={() => {
                  setSelectedCategory(category.id);
                  document.getElementById(`category-${category.id}`)?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <div className="w-24 h-24 rounded-full overflow-hidden mb-2 bg-gradient-to-r from-orange-400 to-red-500 flex items-center justify-center">
                  <span className="text-3xl">🍽️</span>
                </div>
                <p className="text-base font-medium text-gray-700 text-center whitespace-nowrap">{category.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Restaurants Section - Admin Products as Restaurants */}
      <section className="bg-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Restaurants with online food delivery in Shirpur</h2>
          </div>
          
          {/* Filter Tabs */}
          <div className="flex gap-4 mb-6 overflow-x-auto scrollbar-hide">
            <button className="px-4 py-2 bg-gray-100 rounded-full text-sm font-medium whitespace-nowrap hover:bg-gray-200 transition-colors">
              Filter
            </button>
            <button className="px-4 py-2 bg-gray-100 rounded-full text-sm font-medium whitespace-nowrap hover:bg-gray-200 transition-colors">
              Sort By
            </button>
            <button className="px-4 py-2 bg-gray-100 rounded-full text-sm font-medium whitespace-nowrap hover:bg-gray-200 transition-colors">
              Fast Delivery
            </button>
            <button className="px-4 py-2 bg-gray-100 rounded-full text-sm font-medium whitespace-nowrap hover:bg-gray-200 transition-colors">
              New on Shirpur Delivery
            </button>
            <button className="px-4 py-2 bg-gray-100 rounded-full text-sm font-medium whitespace-nowrap hover:bg-gray-200 transition-colors">
              Ratings 4.0+
            </button>
            <button className="px-4 py-2 bg-gray-100 rounded-full text-sm font-medium whitespace-nowrap hover:bg-gray-200 transition-colors">
              Pure Veg
            </button>
            <button className="px-4 py-2 bg-gray-100 rounded-full text-sm font-medium whitespace-nowrap hover:bg-gray-200 transition-colors">
              Offers
            </button>
            <button className="px-4 py-2 bg-gray-100 rounded-full text-sm font-medium whitespace-nowrap hover:bg-gray-200 transition-colors">
              ₹300-₹600
            </button>
            <button className="px-4 py-2 bg-gray-100 rounded-full text-sm font-medium whitespace-nowrap hover:bg-gray-200 transition-colors">
              Less than 30 mins
            </button>
          </div>

          {/* Show products based on selected category */}
          {selectedCategory === 'all' ? (
            /* All Products Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map(product => (
                <div key={product.id} id={`product-${product.id}`} className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer group">
                  {/* Restaurant Image */}
                  <div className="aspect-[4/3] rounded-t-2xl overflow-hidden relative">
                    <img 
                      src={product.image_url || '/placeholder.svg'} 
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `data:image/svg+xml;base64,${btoa(`
                          <svg width="320" height="240" xmlns="http://www.w3.org/2000/svg">
                            <rect width="320" height="240" fill="#f3f4f6"/>
                            <text x="160" y="125" text-anchor="middle" font-size="48">🍽️</text>
                          </svg>
                        `)}`;
                      }}
                    />
                    {/* Offer Badge */}
                    <div className="absolute top-3 left-3 bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold">
                      ITEMS AT ₹{product.price}
                    </div>
                    {/* Rating Badge */}
                    <div className="absolute top-3 right-3 bg-green-600 text-white px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current" />
                      4.{Math.floor(Math.random() * 5) + 1}
                    </div>
                    {/* Quick Add Button */}
                    <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Button 
                        onClick={() => handleAddToCart(product)}
                        size="sm"
                        className="bg-white text-green-600 hover:bg-green-50 font-bold shadow-lg"
                      >
                        ADD
                      </Button>
                    </div>
                  </div>
                  
                  {/* Restaurant Info */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-lg text-gray-800 line-clamp-1">{product.name}</h3>
                      <Heart className="w-5 h-5 text-gray-300 hover:text-red-500 cursor-pointer transition-colors" />
                    </div>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-green-600 fill-current" />
                        <span className="text-sm font-medium">4.{Math.floor(Math.random() * 5) + 1}</span>
                      </div>
                      <span className="text-gray-400">•</span>
                      <span className="text-sm text-gray-600">{Math.floor(Math.random() * 20) + 25}-{Math.floor(Math.random() * 20) + 35} mins</span>
                    </div>
                    
                    <p className="text-gray-600 text-sm line-clamp-1 mb-3">
                      {product.description || `${getCategoryName(product.category_id)}, Indian, Fast Food`}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-gray-800">₹{product.price}</span>
                        <span className="text-sm text-gray-500">for one</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {product.stock_qty > 0 ? `${product.stock_qty} available` : 'Limited stock'}
                      </div>
                    </div>
                    
                    {/* Offers */}
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-1 text-orange-600">
                        <span className="text-xs font-bold">🏷️ OFFERS</span>
                        <span className="text-xs">20% off up to ₹50</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Category Sections */
            categories.map(category => {
              const categoryProducts = filteredProducts.filter(p => p.category_id === category.id);
              if (categoryProducts.length === 0) return null;
              
              return (
                <div key={category.id} id={`category-${category.id}`} className="mb-12">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">{category.name}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {categoryProducts.map(product => (
                      <div key={product.id} id={`product-${product.id}`} className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer group">
                        {/* Restaurant Image */}
                        <div className="aspect-[4/3] rounded-t-2xl overflow-hidden relative">
                          <img 
                            src={product.image_url || '/placeholder.svg'} 
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = `data:image/svg+xml;base64,${btoa(`
                                <svg width="320" height="240" xmlns="http://www.w3.org/2000/svg">
                                  <rect width="320" height="240" fill="#f3f4f6"/>
                                  <text x="160" y="125" text-anchor="middle" font-size="48">🍽️</text>
                                </svg>
                              `)}`;
                            }}
                          />
                          {/* Offer Badge */}
                          <div className="absolute top-3 left-3 bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold">
                            ITEMS AT ₹{product.price}
                          </div>
                          {/* Rating Badge */}
                          <div className="absolute top-3 right-3 bg-green-600 text-white px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
                            <Star className="w-3 h-3 fill-current" />
                            4.{Math.floor(Math.random() * 5) + 1}
                          </div>
                          {/* Quick Add Button */}
                          <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <Button 
                              onClick={() => handleAddToCart(product)}
                              size="sm"
                              className="bg-white text-green-600 hover:bg-green-50 font-bold shadow-lg"
                            >
                              ADD
                            </Button>
                          </div>
                        </div>
                        
                        {/* Restaurant Info */}
                        <div className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-bold text-lg text-gray-800 line-clamp-1">{product.name}</h3>
                            <Heart className="w-5 h-5 text-gray-300 hover:text-red-500 cursor-pointer transition-colors" />
                          </div>
                          
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-green-600 fill-current" />
                              <span className="text-sm font-medium">4.{Math.floor(Math.random() * 5) + 1}</span>
                            </div>
                            <span className="text-gray-400">•</span>
                            <span className="text-sm text-gray-600">{Math.floor(Math.random() * 20) + 25}-{Math.floor(Math.random() * 20) + 35} mins</span>
                          </div>
                          
                          <p className="text-gray-600 text-sm line-clamp-1 mb-3">
                            {product.description || `${getCategoryName(product.category_id)}, Indian, Fast Food`}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-bold text-gray-800">₹{product.price}</span>
                              <span className="text-sm text-gray-500">for one</span>
                            </div>
                            <div className="text-xs text-gray-500">
                              {product.stock_qty > 0 ? `${product.stock_qty} available` : 'Limited stock'}
                            </div>
                          </div>
                          
                          {/* Offers */}
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <div className="flex items-center gap-1 text-orange-600">
                              <span className="text-xs font-bold">🏷️ OFFERS</span>
                              <span className="text-xs">20% off up to ₹50</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
          
          
          {filteredProducts.length === 0 && !loading && (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-gray-800">No restaurants found</h3>
              <p className="text-gray-600">
                {searchQuery ? `No results for "${searchQuery}"` : 'Try adjusting your filters'}
              </p>
            </div>
          )}
        </div>
      </section>
      
      {/* Product Detail Modal */}
      <ProductDetailModal 
        product={selectedProduct}
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false);
          setSelectedProduct(null);
        }}
      />
      
      {/* Success Alert */}
      <SuccessAlert 
        isVisible={showSuccess}
        message={successMessage}
        onClose={() => setShowSuccess(false)}
      />
    </div>
  );
};

export default CustomerCatalogSwiggy;