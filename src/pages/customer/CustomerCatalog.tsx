import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Minus, ShoppingCart, Package } from "lucide-react";
import { mockCategories, mockProducts, addToCart, type Product } from "@/lib/mockData";
import { useToast } from "@/hooks/use-toast";

const CustomerCatalog = () => {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredProducts = selectedCategory === 'all' 
    ? mockProducts.filter(p => p.is_active)
    : mockProducts.filter(p => p.is_active && p.category_id === selectedCategory);

  const getCategoryName = (categoryId: string) => {
    return mockCategories.find(c => c.id === categoryId)?.name || 'Unknown';
  };

  const handleAddToCart = (product: Product) => {
    addToCart(product, 1);
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart`,
    });
    
    // Trigger cart update event
    window.dispatchEvent(new CustomEvent('cartUpdated'));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Shop Products</h1>
        <p className="text-muted-foreground">Browse our wide selection of quality products</p>
      </div>

      {/* Category Filter */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-8">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">All Products</TabsTrigger>
          {mockCategories.filter(c => c.is_active).map(category => (
            <TabsTrigger key={category.id} value={category.id}>
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map(product => (
          <Card key={product.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-4">
              <div className="aspect-square bg-muted rounded-md mb-4 flex items-center justify-center overflow-hidden">
                {product.image ? (
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <Package className="w-12 h-12 text-muted-foreground" />
                )}
              </div>
              <CardTitle className="text-lg">{product.name}</CardTitle>
              <div className="flex items-center justify-between">
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
            
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-2xl font-bold text-primary">₹{product.price.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">per {product.unit}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">Stock: {product.stock_qty}</p>
                  <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
                </div>
              </div>
              
              <Button 
                onClick={() => handleAddToCart(product)}
                disabled={product.stock_qty === 0}
                className="w-full"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                {product.stock_qty === 0 ? 'Out of Stock' : 'Add to Cart'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No products found in this category</p>
        </div>
      )}
    </div>
  );
};

export default CustomerCatalog;