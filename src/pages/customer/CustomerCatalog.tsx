import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Minus, ShoppingCart, Package } from "lucide-react";
import { mockCategories, getProductsFromStorage, addToCart, updateProductStock, type Product } from "@/lib/mockData";
import { useToast } from "@/hooks/use-toast";

const CustomerCatalog = () => {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    setProducts(getProductsFromStorage());
  }, []);

  const filteredProducts = selectedCategory === 'all' 
    ? products.filter(p => p.is_active)
    : products.filter(p => p.is_active && p.category_id === selectedCategory);

  const getCategoryName = (categoryId: string) => {
    return mockCategories.find(c => c.id === categoryId)?.name || 'Unknown';
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

  return (
    <div className="container mx-auto px-4 py-4 md:py-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2 md:mb-4">Shop Products</h1>
        <p className="text-sm md:text-base text-muted-foreground">Browse our wide selection of quality products</p>
      </div>

      {/* Category Filter */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-6 md:mb-8">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-6 gap-1 h-auto p-1">
          <TabsTrigger value="all" className="text-xs md:text-sm px-2 py-2">All</TabsTrigger>
          {mockCategories.filter(c => c.is_active).map(category => (
            <TabsTrigger key={category.id} value={category.id} className="text-xs md:text-sm px-2 py-2">
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Products Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-6">
        {filteredProducts.map(product => (
          <Card key={product.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="p-3 md:p-6 pb-2 md:pb-4">
              <div className="aspect-square bg-muted rounded-md mb-2 md:mb-4 flex items-center justify-center overflow-hidden">
                {product.image ? (
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <Package className="w-8 h-8 md:w-12 md:h-12 text-muted-foreground" />
                )}
              </div>
              <CardTitle className="text-sm md:text-lg leading-tight">{product.name}</CardTitle>
              <div className="flex items-center justify-between flex-wrap gap-1">
                <Badge variant="secondary" className="text-xs">
                  {getCategoryName(product.category_id)}
                </Badge>
                {product.is_age_restricted && (
                  <Badge variant="destructive" className="text-xs">
                    21+
                  </Badge>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="p-3 md:p-6 pt-0">
              <div className="mb-3 md:mb-4">
                <div className="mb-2">
                  <p className="text-lg md:text-2xl font-bold text-primary">₹{product.price.toFixed(2)}</p>
                  <p className="text-xs md:text-sm text-muted-foreground">per {product.unit}</p>
                </div>
                <div className="text-xs md:text-sm">
                  <p className="font-medium">Stock: {product.stock_qty}</p>
                  <p className="text-muted-foreground">SKU: {product.sku}</p>
                </div>
              </div>
              
              <Button 
                onClick={() => handleAddToCart(product)}
                disabled={product.stock_qty === 0}
                className="w-full text-xs md:text-sm"
                size="sm"
              >
                <ShoppingCart className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                {product.stock_qty === 0 ? 'Out of Stock' : 'Add to Cart'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-8 md:py-12">
          <p className="text-sm md:text-base text-muted-foreground">No products found in this category</p>
        </div>
      )}
    </div>
  );
};

export default CustomerCatalog;