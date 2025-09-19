import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, Plus, Edit, AlertTriangle, Search, Filter, Upload, Image } from "lucide-react";
import { mockProducts, mockCategories, type Product } from "@/lib/mockData";
import { useToast } from "@/hooks/use-toast";

const AdminProducts = () => {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category_id === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const lowStockProducts = products.filter(p => p.is_active && p.stock_qty < 10);

  const getCategoryName = (categoryId: string) => {
    return mockCategories.find(c => c.id === categoryId)?.name || 'Unknown';
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddProduct = (formData: FormData) => {
    const newProduct: Product = {
      id: (products.length + 1).toString(),
      category_id: formData.get('category') as string,
      name: formData.get('name') as string,
      sku: formData.get('sku') as string,
      price: parseFloat(formData.get('price') as string),
      unit: formData.get('unit') as string,
      stock_qty: parseInt(formData.get('stock') as string),
      is_age_restricted: formData.get('ageRestricted') === 'on',
      is_active: true,
      image: imagePreview || undefined,
    };

    setProducts([...products, newProduct]);
    setIsAddDialogOpen(false);
    setImagePreview(null);
    toast({
      title: "Product added",
      description: `${newProduct.name} has been added to the catalog`,
    });
  };

  const updateStock = (productId: string, newStock: number) => {
    setProducts(products.map(product => 
      product.id === productId 
        ? { ...product, stock_qty: newStock }
        : product
    ));
    
    toast({
      title: "Stock updated",
      description: "Product stock quantity has been updated",
    });
  };

  return (
    <div className="container mx-auto px-4 py-4 md:py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 md:mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2 md:mb-4">Product Management</h1>
          <p className="text-sm md:text-base text-muted-foreground">Manage your inventory and product catalog</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary w-full md:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
              <DialogDescription>
                Create a new product in your catalog
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleAddProduct(new FormData(e.currentTarget));
            }}>
              <div className="grid gap-4 py-4">
                {/* Image Upload */}
                <div className="space-y-2">
                  <Label>Product Image</Label>
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center overflow-hidden">
                      {imagePreview ? (
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <Image className="w-8 h-8 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                      />
                      <Label htmlFor="image-upload" className="cursor-pointer">
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground">
                          <Upload className="w-4 h-4" />
                          <span>Upload Image</span>
                        </div>
                      </Label>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Product Name</Label>
                    <Input id="name" name="name" placeholder="e.g. Organic Bananas" required />
                  </div>
                  <div>
                    <Label htmlFor="sku">SKU</Label>
                    <Input id="sku" name="sku" placeholder="e.g. BAN001" required />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select name="category" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockCategories.filter(c => c.is_active).map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">Price (₹)</Label>
                    <Input id="price" name="price" type="number" step="0.01" placeholder="0.00" required />
                  </div>
                  <div>
                    <Label htmlFor="unit">Unit</Label>
                    <Input id="unit" name="unit" placeholder="e.g. kg, piece, liter" required />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="stock">Initial Stock</Label>
                  <Input id="stock" name="stock" type="number" placeholder="0" required />
                </div>
                
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="ageRestricted" name="ageRestricted" className="rounded" />
                  <Label htmlFor="ageRestricted" className="text-sm">Age restricted (21+)</Label>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Product</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <Card className="mb-8 border-warning bg-warning/5">
          <CardHeader>
            <CardTitle className="flex items-center text-warning">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Low Stock Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              {lowStockProducts.length} products are running low on stock
            </p>
            <div className="flex flex-wrap gap-2">
              {lowStockProducts.slice(0, 5).map(product => (
                <Badge key={product.id} variant="outline" className="text-warning border-warning">
                  {product.name} ({product.stock_qty} left)
                </Badge>
              ))}
              {lowStockProducts.length > 5 && (
                <Badge variant="outline" className="text-warning border-warning">
                  +{lowStockProducts.length - 5} more
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mb-4 md:mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 text-sm md:text-base"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {mockCategories.filter(c => c.is_active).map(category => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {filteredProducts.map(product => (
          <Card key={product.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="p-4 md:p-6 pb-3 md:pb-4">
              <div className="aspect-square bg-muted rounded-md mb-3 md:mb-4 flex items-center justify-center overflow-hidden">
                {product.image ? (
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <Package className="w-8 h-8 md:w-12 md:h-12 text-muted-foreground" />
                )}
              </div>
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-base md:text-lg leading-tight">{product.name}</CardTitle>
                  <p className="text-xs md:text-sm text-muted-foreground">SKU: {product.sku}</p>
                </div>
                <Button variant="ghost" size="sm" className="ml-2">
                  <Edit className="w-3 h-3 md:w-4 md:h-4" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="p-4 md:p-6 pt-0 space-y-3 md:space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <Badge variant="secondary" className="text-xs">
                  {getCategoryName(product.category_id)}
                </Badge>
                {product.is_age_restricted && (
                  <Badge variant="destructive" className="text-xs">21+</Badge>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 md:gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs md:text-sm">Price</p>
                  <p className="font-semibold text-base md:text-lg">₹{product.price.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs md:text-sm">Unit</p>
                  <p className="font-medium text-sm md:text-base">{product.unit}</p>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs md:text-sm text-muted-foreground">Stock</span>
                  <span className={`font-medium text-xs md:text-sm ${product.stock_qty < 10 ? 'text-warning' : 'text-success'}`}>
                    {product.stock_qty} units
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    defaultValue={product.stock_qty}
                    className="flex-1 text-sm"
                    onBlur={(e) => {
                      const newStock = parseInt(e.target.value) || 0;
                      if (newStock !== product.stock_qty) {
                        updateStock(product.id, newStock);
                      }
                    }}
                  />
                  <Button size="sm" variant="outline" className="text-xs px-2">
                    Update
                  </Button>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2 border-t">
                <Badge variant={product.is_active ? "default" : "secondary"} className="text-xs">
                  {product.is_active ? "Active" : "Inactive"}
                </Badge>
                <Button variant="outline" size="sm" className="text-xs">
                  Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-8 md:py-12">
          <Package className="w-16 h-16 md:w-24 md:h-24 text-muted-foreground mx-auto mb-4 md:mb-6" />
          <h3 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">No products found</h3>
          <p className="text-sm md:text-base text-muted-foreground mb-4 md:mb-6">
            {searchQuery || selectedCategory !== 'all' 
              ? "Try adjusting your search or filter criteria" 
              : "Add your first product to get started"
            }
          </p>
          <Button className="bg-gradient-primary">
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;