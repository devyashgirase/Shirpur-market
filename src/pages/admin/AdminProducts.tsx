import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, Plus, Edit, Trash2 } from "lucide-react";
import { getProductsFromStorage, type Product } from "@/lib/mockData";
import { useToast } from "@/hooks/use-toast";

const AdminProducts = () => {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    setProducts(getProductsFromStorage());
  }, []);

  const updateStock = (productId: string, newStock: number) => {
    const updatedProducts = products.map(product => 
      product.id === productId 
        ? { ...product, stock_qty: Math.max(0, newStock) }
        : product
    );
    setProducts(updatedProducts);
    localStorage.setItem('products', JSON.stringify(updatedProducts));
    
    toast({
      title: "Stock Updated",
      description: "Product stock has been updated successfully.",
    });
  };

  const toggleProductStatus = (productId: string) => {
    const updatedProducts = products.map(product => 
      product.id === productId 
        ? { ...product, is_active: !product.is_active }
        : product
    );
    setProducts(updatedProducts);
    localStorage.setItem('products', JSON.stringify(updatedProducts));
    
    toast({
      title: "Product Status Updated",
      description: "Product availability has been updated.",
    });
  };

  return (
    <div className="container mx-auto px-4 py-4 md:py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Product Management</h1>
        <Button className="bg-primary">
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => (
          <Card key={product.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="p-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{product.name}</CardTitle>
                <Badge variant={product.is_active ? "default" : "secondary"}>
                  {product.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="space-y-3">
                <div className="flex items-center justify-center w-full h-32 bg-muted rounded-md">
                  <Package className="w-12 h-12 text-muted-foreground" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Price:</span>
                    <span className="font-semibold">₹{product.price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Stock:</span>
                    <span className={`font-semibold ${product.stock_qty < 10 ? 'text-red-600' : 'text-green-600'}`}>
                      {product.stock_qty} {product.unit}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">SKU:</span>
                    <span className="text-sm">{product.sku}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateStock(product.id, product.stock_qty + 10)}
                    className="flex-1"
                  >
                    +10 Stock
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleProductStatus(product.id)}
                    className="flex-1"
                  >
                    {product.is_active ? "Disable" : "Enable"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Products Found</h3>
          <p className="text-muted-foreground">Add some products to get started</p>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;