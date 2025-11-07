import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, CarouselDots } from "@/components/ui/carousel";
import { Plus, Minus, ShoppingCart, Package, Star, Heart, Zap, TrendingUp } from "lucide-react";
import { type Product } from "@/lib/mockData";
import { cartService } from "@/lib/cartService";
import { CustomerDataService } from "@/lib/customerDataService";
import { useToast } from "@/hooks/use-toast";
import { sweetAlert } from "@/components/ui/sweet-alert";
import { realTimeDataService } from "@/lib/realTimeDataService";

import DynamicPrice from "@/components/DynamicPrice";
import CustomerLoyalty from "@/components/CustomerLoyalty";
import PersonalizedWelcome from "@/components/PersonalizedWelcome";
import { RealTimeLocation } from "@/components/RealTimeLocation";

import ProductSearch from "@/components/ProductSearch";
import AttractiveLoader from "@/components/AttractiveLoader";
import { personalizationService } from "@/lib/personalizationService";
import PersonalizedRecommendations from "@/components/PersonalizedRecommendations";
import PanCornerCarousel from "@/components/PanCornerCarousel";
import "@/styles/carousel.css";

const CustomerCatalog = () => {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadCustomerProducts = async () => {
      try {
        setLoading(true);
        const customerProducts = await CustomerDataService.getAvailableProducts();
        console.log('CustomerCatalog: Products received from service:', customerProducts);
        console.log('CustomerCatalog: Number of products received:', customerProducts.length);
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
            is_active: p.is_active !== undefined ? p.is_active : p.isActive,
            sku: `SKU${p.id || Date.now()}`,
            unit: 'kg',
            is_age_restricted: false
          };
        }).filter(Boolean);
        const activeProducts = formattedProducts.filter(p => p.is_active);
        console.log('CustomerCatalog: Active products after filtering:', activeProducts);
        console.log('CustomerCatalog: Setting', activeProducts.length, 'active products');
        setProducts(activeProducts);
        
        // Generate categories from API products
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
        const categoriesArray = Array.from(categoryMap.values());
        // Always ensure pan-corner category is available
        if (!categoriesArray.find(c => c.id === 'pan-corner')) {
          categoriesArray.push({
            id: 'pan-corner',
            name: 'Pan Corner',
            is_active: true
          });
        }
        setCategories(categoriesArray);
      } catch (error) {
        console.error('Failed to load products:', error);
        setProducts([]);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };
    
    realTimeDataService.startRealTimeUpdates();
    
    const handleProductUpdate = (updatedProducts: any[]) => {
      const formattedProducts = (updatedProducts || []).map(p => {
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
          is_active: p.is_active !== undefined ? p.is_active : p.isActive,
          sku: `SKU${p.id || Date.now()}`,
          unit: 'kg',
          is_age_restricted: false
        };
      }).filter(Boolean);
      setProducts(formattedProducts.filter(p => p.is_active));
    };
    
    realTimeDataService.subscribe('products', handleProductUpdate);
    
    // Listen for admin product updates
    const handleAdminProductUpdate = (event: CustomEvent) => {
      console.log('Products updated from admin:', event.detail);
      handleProductUpdate(event.detail);
    };
    
    // Listen for search events from layout
    const handleSearchEvent = (event: CustomEvent) => {
      const query = event.detail?.query || '';
      console.log('🔍 Search event received:', query);
      setSearchQuery(query);
    };
    
    window.addEventListener('productsUpdated', handleAdminProductUpdate as EventListener);
    window.addEventListener('productSearch', handleSearchEvent as EventListener);
    window.addEventListener('voiceSearch', handleSearchEvent as EventListener);
    loadCustomerProducts();
    
    return () => {
      realTimeDataService.unsubscribe('products', handleProductUpdate);
      window.removeEventListener('productsUpdated', handleAdminProductUpdate as EventListener);
      window.removeEventListener('productSearch', handleSearchEvent as EventListener);
      window.removeEventListener('voiceSearch', handleSearchEvent as EventListener);
    };
  }, []);

  const filteredProducts = products.filter(p => {
    if (!p || !p.is_active) return false;
    
    const matchesCategory = selectedCategory === 'all' || p.category_id === selectedCategory;
    const matchesSearch = !searchQuery || 
      String(p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(p.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });
  
  // Debug logging
  console.log('Selected category:', selectedCategory);
  console.log('All products:', products.map(p => ({ name: p.name, category: p.category_id })));
  console.log('Filtered products:', filteredProducts.length);
  
  const getCategoryName = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.name || 'Unknown';
  };

  const handleAddToCart = async (product: Product) => {
    if (product.stock_qty > 0) {
      try {
        const success = await cartService.addToCart(product.id, 1);
        
        if (success) {
          toast({
            title: "Added to Cart!",
            description: `${product.name} has been added to your cart`,
          });
          
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

  // State for carousel items
  const [carouselItems, setCarouselItems] = useState<any[]>([]);
  
  // Load carousel items from localStorage
  const loadCarouselItems = async () => {
    try {
      const saved = localStorage.getItem('carouselItems');
      if (saved) {
        const allItems = JSON.parse(saved);
        
        // Filter only active items
        const activeItems = allItems
          .filter((item: any) => item.isActive === true)
          .sort((a: any, b: any) => a.order - b.order);
        
        const formattedItems = activeItems.map((item: any) => ({
          id: item.productId.toString(),
          name: item.title,
          description: item.description,
          price: item.price,
          image_url: item.imageUrl,
          category_id: 'featured',
          stock_qty: 100,
          is_active: true,
          sku: `SKU${item.productId}`,
          unit: 'kg',
          is_age_restricted: false
        }));
        
        setCarouselItems(formattedItems);
        console.log('✅ Customer carousel loaded - Active items only:', formattedItems.length);
      } else {
        setCarouselItems([]);
      }
    } catch (error) {
      console.error('Error loading carousel items:', error);
      setCarouselItems([]);
    }
  };
  
  // Listen for carousel updates from admin
  useEffect(() => {
    loadCarouselItems();
    
    const handleCarouselUpdate = (event: CustomEvent) => {
      console.log('Carousel updated from admin:', event.detail);
      loadCarouselItems();
    };
    
    window.addEventListener('carouselUpdated', handleCarouselUpdate as EventListener);
    
    return () => {
      window.removeEventListener('carouselUpdated', handleCarouselUpdate as EventListener);
    };
  }, [products]);
  
  const featuredProducts = carouselItems.length > 0 ? carouselItems : [];
  const [popularProducts, setPopularProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (products.length > 0) {
      const personalized = personalizationService.getPersonalizedProducts(products, 8);
      setPopularProducts(personalized);
    }
  }, [products]);

  if (loading) {
    return <AttractiveLoader type="customer" message="Loading fresh products..." />;
  }

  if (products.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Products Available</h3>
          <p className="text-gray-600">Please check your database connection or add products to the database.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      
      <div className="w-full">
        <div className="w-full">
          
          {featuredProducts.length > 0 && (
            <Carousel className="w-full h-screen relative" autoPlay autoPlayInterval={7000}>
              <CarouselContent>
                {featuredProducts.map((product, index) => (
                  <CarouselItem key={product.id}>
                    <div className="carousel-banner relative h-screen w-full overflow-hidden">
                      {/* Banner Background */}
                      <div 
                        className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
                        style={{
                          backgroundImage: product.image_url 
                            ? `url(${product.image_url})` 
                            : `linear-gradient(135deg, ${
                              index % 4 === 0 ? '#8B5CF6, #EC4899, #EF4444' :
                              index % 4 === 1 ? '#3B82F6, #06B6D4, #10B981' :
                              index % 4 === 2 ? '#10B981, #059669, #84CC16' :
                              '#F59E0B, #D97706, #EAB308'
                            })`
                        }}
                      ></div>
                      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/30"></div>
                      
                      {/* Animated Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                      
                      {/* Decorative Elements */}
                      <div className="floating-element absolute top-6 right-6 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
                      <div className="floating-element absolute bottom-20 left-10 w-32 h-32 bg-yellow-400/20 rounded-full blur-2xl" style={{animationDelay: '1s'}}></div>
                      <div className="glow-effect absolute top-1/2 right-1/4 w-16 h-16 bg-pink-400/20 rounded-full blur-lg" style={{animationDelay: '2s'}}></div>
                      
                      {/* Content */}
                      <div className="carousel-content relative z-10 h-full flex flex-col justify-between px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20 py-8">
                        {/* Top Section */}
                        <div className="text-white">
                          {/* Badge */}
                          <div className="mb-4">
                            <Badge className="carousel-badge bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold px-4 py-2 text-sm animate-pulse">
                              🔥 SPECIAL OFFER
                            </Badge>
                          </div>
                          
                          {/* Title */}
                          <h3 className="carousel-title text-3xl sm:text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-black mb-4 leading-tight">
                            <span className="gradient-text drop-shadow-2xl">
                              {product.name}
                            </span>
                          </h3>
                          
                          {/* Description */}
                          <p className="carousel-description text-lg sm:text-xl md:text-2xl lg:text-3xl opacity-95 mb-6 line-clamp-3 font-medium">
                            {product.description || 'Premium quality product delivered fresh to your doorstep'}
                          </p>
                          
                          {/* Product Features */}
                          <div className="carousel-features">
                            <div className="carousel-feature">
                              <div className="text-2xl mb-2">🚚</div>
                              <div className="text-sm font-bold">30 Min</div>
                              <div className="text-xs opacity-80">Delivery</div>
                            </div>
                            <div className="carousel-feature">
                              <div className="text-2xl mb-2">✅</div>
                              <div className="text-sm font-bold">Fresh</div>
                              <div className="text-xs opacity-80">Quality</div>
                            </div>
                            <div className="carousel-feature">
                              <div className="text-2xl mb-2">💰</div>
                              <div className="text-sm font-bold">Best</div>
                              <div className="text-xs opacity-80">Price</div>
                            </div>
                            <div className="carousel-feature">
                              <div className="text-2xl mb-2">⭐</div>
                              <div className="text-sm font-bold">4.8★</div>
                              <div className="text-xs opacity-80">Rating</div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Bottom Section */}
                        <div className="text-white">
                          

                          
                          {/* Price Display */}
                          <div className="carousel-price flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
                            <div className="flex items-baseline gap-2">
                              <span className="price-main text-2xl sm:text-3xl md:text-4xl font-black text-yellow-300 drop-shadow-lg">
                                ₹{product.price}
                              </span>
                              <span className="text-sm sm:text-base text-white/80 line-through">
                                ₹{Math.round(product.price * 1.25)}
                              </span>
                            </div>

                          </div>
                          
                          {/* Add to Cart Button */}
                          <div className="carousel-buttons">
                            <Button 
                              onClick={() => handleAddToCart(product)}
                              className="btn-primary bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 hover:from-green-600 hover:via-emerald-600 hover:to-teal-600 text-white font-bold text-xl px-12 py-6 rounded-2xl shadow-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-3xl"
                            >
                              <ShoppingCart className="w-8 h-8 mr-4" />
                              Add to Cart - ₹{product.price}
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      {/* Enhanced Floating Elements */}
                      
                      <div className="absolute top-6 right-6 z-20">
                        <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg">
                          ✨ Premium Quality
                        </div>
                      </div>
                      
                      {/* Product Category Badge */}
                      <div className="absolute bottom-6 right-6 z-20">
                        <div className="bg-black/50 backdrop-blur-md text-white px-4 py-2 rounded-full font-bold text-sm border border-white/30">
                          🍿 Category: {product.category_id?.replace('-', ' ').toUpperCase() || 'PREMIUM'}
                        </div>
                      </div>
                      
                      {/* Enhanced Bottom Gradient */}
                      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              
              {/* Enhanced Navigation */}
              <CarouselPrevious className="carousel-nav-btn left-6 w-16 h-16 bg-white/20 backdrop-blur-md border-white/30 text-white hover:bg-white/40 hover:scale-110 transition-all duration-300 z-30" />
              <CarouselNext className="carousel-nav-btn right-6 w-16 h-16 bg-white/20 backdrop-blur-md border-white/30 text-white hover:bg-white/40 hover:scale-110 transition-all duration-300 z-30" />
              
              {/* Enhanced Progress Bar */}
              <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 w-64 bg-white/20 rounded-full h-2 backdrop-blur-sm z-30">
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 h-full rounded-full transition-all duration-300" style={{width: `${((featuredProducts.findIndex(p => p.id === featuredProducts[0]?.id) + 1) / featuredProducts.length) * 100}%`}}></div>
              </div>
              
              {/* Enhanced Dots with Numbers */}
              <div className="carousel-dots flex justify-center mt-8 gap-4">
                {featuredProducts.map((_, index) => (
                  <div key={index} className="carousel-dot w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/30 hover:bg-white/40 transition-all duration-300 cursor-pointer flex items-center justify-center text-white font-bold">
                    {index + 1}
                  </div>
                ))}
              </div>
              
              {/* Slide Counter */}
              <div className="absolute top-1/2 left-6 transform -translate-y-1/2 bg-black/50 backdrop-blur-md text-white px-4 py-2 rounded-full font-bold text-sm z-30">
                {featuredProducts.findIndex(p => p.id === featuredProducts[0]?.id) + 1} / {featuredProducts.length}
              </div>
            </Carousel>
          )}
          

        </div>
      </div>

      {/* Pan Corner Section */}
      <div className="container mx-auto px-4 py-6">
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            🌿 Pan Corner Special
          </h2>
          <PanCornerCarousel onBannerClick={() => {
            console.log('Pan Corner clicked - setting category to pan-corner');
            setSelectedCategory('pan-corner');
            setTimeout(() => {
              const productsSection = document.getElementById('products-section');
              if (productsSection) {
                productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }, 100);
          }} />
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 mt-8">
        {/* Real-time Location Tracking */}
        <RealTimeLocation />
        
        {/* Personalized Welcome */}
        <PersonalizedWelcome />
        
        {/* Customer Features Section */}
        <div className="mb-8">
          <CustomerLoyalty />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-6 sm:mb-8">
          <Card className="text-center p-3 sm:p-4 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 mx-auto mb-1 sm:mb-2" />
            <p className="font-bold text-green-800 text-sm sm:text-base">30 Min</p>
            <p className="text-xs sm:text-sm text-green-600">Fast Delivery</p>
          </Card>
          <Card className="text-center p-3 sm:p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <Star className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 mx-auto mb-1 sm:mb-2" />
            <p className="font-bold text-blue-800 text-sm sm:text-base">{products.length}+</p>
            <p className="text-xs sm:text-sm text-blue-600">Products</p>
          </Card>
          <Card className="text-center p-3 sm:p-4 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 mx-auto mb-1 sm:mb-2" />
            <p className="font-bold text-purple-800 text-sm sm:text-base">4.8★</p>
            <p className="text-xs sm:text-sm text-purple-600">Rating</p>
          </Card>
          <Card className="text-center p-3 sm:p-4 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600 mx-auto mb-1 sm:mb-2" />
            <p className="font-bold text-orange-800 text-sm sm:text-base">₹4.99</p>
            <p className="text-xs sm:text-sm text-orange-600">Delivery Fee</p>
          </Card>
        </div>

        {/* Personalized Recommendations */}
        <PersonalizedRecommendations products={products} />

        {popularProducts.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-center bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              🔥 Popular Items
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2 sm:gap-3 md:gap-4 mb-6 md:mb-8">
              {popularProducts.map((product) => (
                <Card key={product.id} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-white to-gray-50">
                  <CardContent className="p-2 sm:p-3">
                    <div className="aspect-square bg-gradient-to-br from-blue-100 to-green-100 rounded-lg mb-2 sm:mb-3 flex items-center justify-center overflow-hidden">
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover responsive-image" />
                      ) : (
                        <Package className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                      )}
                    </div>
                    <h3 className="font-semibold text-xs sm:text-sm mb-1 line-clamp-2">{product.name}</h3>
                    <p className="text-sm sm:text-lg font-bold text-green-600 mb-2">₹{product.price}</p>
                    <Button 
                      onClick={() => handleAddToCart(product)}
                      size="sm"
                      className="w-full bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-xs sm:text-sm btn-mobile"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      <span className="hidden sm:inline">Add</span>
                      <span className="sm:hidden">+</span>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="mb-6">
          <ProductSearch onSearch={setSearchQuery} placeholder="Search rice, dal, vegetables..." />
        </div>

        {categories.length > 0 && (
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-6 md:mb-8">
            <div className="overflow-x-auto hide-scrollbar">
              <TabsList className="flex w-max min-w-full gap-1 h-auto p-1 bg-white shadow-md">
                <TabsTrigger value="all" className="text-xs sm:text-sm px-3 sm:px-4 py-2 whitespace-nowrap data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-green-500 data-[state=active]:text-white">
                  All
                </TabsTrigger>
                {categories.filter(c => c.is_active).map(category => (
                  <TabsTrigger 
                    key={category.id} 
                    value={category.id} 
                    className="text-xs sm:text-sm px-3 sm:px-4 py-2 whitespace-nowrap data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-green-500 data-[state=active]:text-white"
                  >
                    {category.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
          </Tabs>
        )}

        <div className="mb-6" id="products-section">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-center bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            {selectedCategory === 'pan-corner' ? '🌿 Pan Corner Products' : '🛍️ All Products'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map(product => (
              <Card key={product.id} className="bg-gradient-to-br from-white via-blue-50 to-green-50 border-2 border-blue-200 hover:border-green-400 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl">
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-yellow-200 to-orange-200 rounded-2xl flex items-center justify-center text-3xl animate-pulse flex-shrink-0">
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover rounded-2xl" />
                      ) : (
                        '🥬'
                      )}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg font-bold text-gray-800 mb-1">{product.name}</CardTitle>
                      <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          {getCategoryName(product.category_id)}
                        </Badge>
                        {product.stock_qty > 50 && (
                          <Badge className="bg-gradient-to-r from-green-500 to-blue-500 text-white animate-pulse">
                            🔥 In Stock
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <DynamicPrice currentPrice={product.price} productId={product.id} />
                      <p className="text-sm text-gray-500">per {product.unit}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {product.stock_qty === 0 ? (
                        <Badge variant="destructive" className="animate-pulse">
                          😞 Out of Stock
                        </Badge>
                      ) : (
                        <Button 
                          onClick={() => handleAddToCart(product)}
                          className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold px-6 py-2 rounded-full transform hover:scale-110 transition-all duration-200 shadow-lg"
                        >
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Add to Cart 🛒
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {filteredProducts.length === 0 && !loading && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No products found</h3>
            <p className="text-muted-foreground">
              {searchQuery ? `No results for "${searchQuery}"` : 'Try selecting a different category'}
            </p>
            {searchQuery && (
              <Button 
                variant="outline" 
                onClick={() => setSearchQuery('')}
                className="mt-4"
              >
                Clear search
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerCatalog;