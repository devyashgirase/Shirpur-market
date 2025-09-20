import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, CarouselDots } from "@/components/ui/carousel";
import { Plus, Minus, ShoppingCart, Package, Star, Heart, Zap, TrendingUp } from "lucide-react";
import { getDynamicCategories, getProductsFromStorage, addToCart, updateProductStock, type Product } from "@/lib/mockData";
import { CustomerDataService } from "@/lib/customerDataService";
import { useToast } from "@/hooks/use-toast";
import { realTimeDataService } from "@/lib/realTimeDataService";
import RealTimeIndicator from "@/components/RealTimeIndicator";
import DynamicPrice from "@/components/DynamicPrice";

const CustomerCatalog = () => {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const loadCustomerProducts = async () => {
      try {
        const customerProducts = await CustomerDataService.getAvailableProducts();
        const formattedProducts = customerProducts.map(p => ({
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
        setProducts(formattedProducts.filter(p => p.is_active));
        
        // Generate dynamic categories from products
        const dynamicCategories = getDynamicCategories();
        setCategories(dynamicCategories);
      } catch (error) {
        console.error('Failed to load customer products:', error);
        const fallbackProducts = getProductsFromStorage();
        setProducts(fallbackProducts);
        setCategories(getDynamicCategories());
      }
    };
    
    // Initialize real-time updates
    realTimeDataService.startRealTimeUpdates();
    
    // Subscribe to real-time product updates
    const handleProductUpdate = (updatedProducts: any[]) => {
      const formattedProducts = updatedProducts.map(p => ({
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
      setProducts(formattedProducts.filter(p => p.is_active));
      setCategories(getDynamicCategories());
    };
    
    realTimeDataService.subscribe('products', handleProductUpdate);
    
    loadCustomerProducts();
    
    // Refresh products every 15 seconds for real-time pricing
    const interval = setInterval(() => {
      realTimeDataService.getFreshData('products');
      loadCustomerProducts();
    }, 15000);
    
    return () => {
      clearInterval(interval);
      realTimeDataService.unsubscribe('products', handleProductUpdate);
    };
  }, []);

  const filteredProducts = selectedCategory === 'all' 
    ? products.filter(p => p.is_active)
    : products.filter(p => p.is_active && p.category_id === selectedCategory);

  const [categories, setCategories] = useState([]);
  
  const getCategoryName = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.name || 'Unknown';
  };

  const handleAddToCart = (product: Product) => {
    if (product.stock_qty > 0) {
      addToCart(product, 1);
      const updatedProducts = updateProductStock(product.id, 1);
      setProducts(updatedProducts);
      
      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart`,
      });
      
      // Trigger cart update event
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    }
  };

  // Get featured products (first 5 products)
  const featuredProducts = products.slice(0, 5);
  const popularProducts = products.filter(p => p.stock_qty > 20).slice(0, 8);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <RealTimeIndicator />
      {/* Hero Section with Carousel */}
      <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-5xl font-bold mb-4">🛒 Shirpur Delivery</h1>
            <p className="text-lg md:text-xl opacity-90">Fresh products delivered to your doorstep in 30 minutes</p>
          </div>
          
          {/* Featured Products Carousel */}
          <Carousel className="max-w-4xl mx-auto" autoPlay autoPlayInterval={4000}>
            <CarouselContent>
              {featuredProducts.map((product) => (
                <CarouselItem key={product.id}>
                  <Card className="bg-white/10 backdrop-blur border-white/20">
                    <CardContent className="p-6 text-center">
                      <div className="w-24 h-24 md:w-32 md:h-32 bg-white/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <Package className="w-12 h-12 md:w-16 md:h-16 text-white" />
                      </div>
                      <h3 className="text-xl md:text-2xl font-bold mb-2">{product.name}</h3>
                      <p className="text-2xl md:text-3xl font-bold text-yellow-300 mb-4">₹{product.price}</p>
                      <Button 
                        onClick={() => handleAddToCart(product)}
                        className="bg-white text-blue-600 hover:bg-gray-100"
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Add to Cart
                      </Button>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="bg-white/20 border-white/30 text-white hover:bg-white/30" />
            <CarouselNext className="bg-white/20 border-white/30 text-white hover:bg-white/30" />
            <CarouselDots />
          </Carousel>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <Zap className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="font-bold text-green-800">30 Min</p>
            <p className="text-xs text-green-600">Fast Delivery</p>
          </Card>
          <Card className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <Star className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="font-bold text-blue-800">{products.length}+</p>
            <p className="text-xs text-blue-600">Products</p>
          </Card>
          <Card className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <Heart className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <p className="font-bold text-purple-800">4.8★</p>
            <p className="text-xs text-purple-600">Rating</p>
          </Card>
          <Card className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <TrendingUp className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <p className="font-bold text-orange-800">₹4.99</p>
            <p className="text-xs text-orange-600">Delivery Fee</p>
          </Card>
        </div>

        {/* Popular Products Section */}
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            🔥 Popular Products
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {popularProducts.map((product) => (
              <Card key={product.id} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-white to-gray-50">
                <CardContent className="p-3">
                  <div className="aspect-square bg-gradient-to-br from-blue-100 to-green-100 rounded-lg mb-3 flex items-center justify-center">
                    <Package className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-sm mb-1 line-clamp-2">{product.name}</h3>
                  <p className="text-lg font-bold text-green-600 mb-2">₹{product.price}</p>
                  <Button 
                    onClick={() => handleAddToCart(product)}
                    size="sm"
                    className="w-full bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Category Filter */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-6 md:mb-8">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-6 gap-1 h-auto p-1 bg-white shadow-md">
            <TabsTrigger value="all" className="text-xs md:text-sm px-2 py-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-green-500 data-[state=active]:text-white">
              All
            </TabsTrigger>
            {categories.filter(c => c.is_active).map(category => (
              <TabsTrigger 
                key={category.id} 
                value={category.id} 
                className="text-xs md:text-sm px-2 py-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-green-500 data-[state=active]:text-white"
              >
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* All Products Grid */}
        <div className="mb-6">
          <h2 className="text-xl md:text-2xl font-bold mb-4">All Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-6">
            {filteredProducts.map(product => (
              <Card key={product.id} className="hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-white border-0 shadow-md">
                <CardHeader className="p-3 md:p-4 pb-2">
                  <div className="aspect-square bg-gradient-to-br from-blue-100 via-purple-50 to-green-100 rounded-xl mb-3 flex items-center justify-center overflow-hidden relative">
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <Package className="w-8 h-8 md:w-12 md:h-12 text-blue-600" />
                    )}
                    {product.stock_qty < 10 && (
                      <Badge className="absolute top-2 right-2 bg-red-500 text-white text-xs">
                        Low Stock
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-sm md:text-base leading-tight line-clamp-2">{product.name}</CardTitle>
                  <div className="flex items-center justify-between flex-wrap gap-1">
                    <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                      {getCategoryName(product.category_id)}
                    </Badge>
                    {product.is_age_restricted && (
                      <Badge variant="destructive" className="text-xs">
                        21+
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="p-3 md:p-4 pt-0">
                  <div className="mb-3">
                    <div className="mb-2">
                      <DynamicPrice 
                        currentPrice={product.price} 
                        productId={product.id}
                        className="mb-1"
                      />
                      <p className="text-xs text-muted-foreground">per {product.unit}</p>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className={`font-medium ${
                        product.stock_qty > 20 ? 'text-green-600' : 
                        product.stock_qty > 5 ? 'text-orange-600' : 'text-red-600'
                      }`}>
                        {product.stock_qty} in stock
                      </span>
                      <span className="text-muted-foreground">{product.sku}</span>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => handleAddToCart(product)}
                    disabled={product.stock_qty === 0}
                    className="w-full text-xs md:text-sm bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 border-0 shadow-md"
                    size="sm"
                  >
                    <ShoppingCart className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                    {product.stock_qty === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No products found</h3>
            <p className="text-muted-foreground">Try selecting a different category</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerCatalog;