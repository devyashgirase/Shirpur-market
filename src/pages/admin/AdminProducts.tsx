import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, Plus, Upload, X } from "lucide-react";
import { AdminDataService } from "@/lib/adminDataService";
import { apiService } from "@/lib/apiService";
import { unifiedDB } from "@/lib/database";
import { useToast } from "@/hooks/use-toast";

const AdminProducts = () => {
  const { toast } = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stockQuantity: '',
    imageUrl: ''
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      console.log('📊 Loading products from database...');
      
      // Load from unified database (auto-switches between MySQL/Supabase)
      const dbProducts = await unifiedDB.getProducts();
      setProducts(dbProducts || []);
    } catch (error) {
      console.error('❌ Failed to load products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleImageFile = (file) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setNewProduct({...newProduct, imageUrl: e.target.result});
      };
      reader.readAsDataURL(file);
    } else {
      toast({
        title: "Invalid File",
        description: "Please select an image file",
        variant: "destructive"
      });
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleImageFile(e.target.files[0]);
    }
  };

  const handleAddProduct = async () => {
    try {
      if (!newProduct.name || !newProduct.price || !newProduct.category) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive"
        });
        return;
      }

      const productData = {
        name: newProduct.name,
        description: newProduct.description,
        price: parseFloat(newProduct.price),
        category: newProduct.category,
        stockQuantity: parseInt(newProduct.stockQuantity) || 0,
        imageUrl: newProduct.imageUrl,
        isActive: true
      };

      console.log('💾 Adding product to database:', productData.name);
      
      // Save to unified database
      const dbProduct = await unifiedDB.createProduct(productData);
      if (dbProduct) {
        toast({
          title: "Product Added to Database",
          description: `${productData.name} has been saved successfully`,
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to add product to database",
          variant: "destructive"
        });
        return;
      }

      setNewProduct({
        name: '',
        description: '',
        price: '',
        category: '',
        stockQuantity: '',
        imageUrl: ''
      });
      setIsDialogOpen(false);
      loadProducts();
    } catch (error) {
      console.error('❌ Failed to add product:', error);
      toast({
        title: "Database Error",
        description: "Failed to add product to database. Check your Supabase configuration.",
        variant: "destructive"
      });
    }
  };

  const updateStock = (productId: string, newStock: number) => {
    const updatedProducts = products.map(product => 
      product.id === productId 
        ? { ...product, stockQuantity: Math.max(0, newStock) }
        : product
    );
    setProducts(updatedProducts);
    
    toast({
      title: "Stock Updated",
      description: "Product stock has been updated successfully.",
    });
  };

  const toggleProductStatus = async (productId: string) => {
    const product = products.find(p => p.id === productId);
    const newStatus = !product.isActive;
    
    try {
      console.log('🔄 Updating product status in database:', productId, '→', newStatus);
      
      // Update in unified database
      const dbUpdated = await unifiedDB.updateProduct(parseInt(productId), { isActive: newStatus });
      if (!dbUpdated) {
        toast({
          title: "Database Error",
          description: "Failed to update product status",
          variant: "destructive"
        });
        return;
      }
      
      const updatedProducts = products.map(p => 
        p.id === productId ? { ...p, isActive: newStatus } : p
      );
      setProducts(updatedProducts);
      
      toast({
        title: "Database Updated",
        description: `Product ${newStatus ? 'enabled' : 'disabled'} in database successfully.`,
      });
    } catch (error) {
      console.error('❌ Failed to update product status:', error);
      toast({
        title: "Database Error",
        description: "Failed to update product status in database.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-4 md:py-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="loading-spinner mx-auto mb-4"></div>
            <p className="text-lg text-gray-600">Loading products from database...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-3 md:px-4 py-4 md:py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 md:mb-6 gap-3 md:gap-0">
        <h1 className="text-xl md:text-3xl font-bold">Product Management</h1>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary">
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                  placeholder="Enter product name"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                  placeholder="Enter product description"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="price">Price *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                    placeholder="0.00"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="stock">Stock Quantity</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={newProduct.stockQuantity}
                    onChange={(e) => setNewProduct({...newProduct, stockQuantity: e.target.value})}
                    placeholder="0"
                  />
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={newProduct.category} onValueChange={(value) => setNewProduct({...newProduct, category: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Grains">Grains</SelectItem>
                    <SelectItem value="Pulses">Pulses</SelectItem>
                    <SelectItem value="Oil">Oil</SelectItem>
                    <SelectItem value="Sweeteners">Sweeteners</SelectItem>
                    <SelectItem value="Beverages">Beverages</SelectItem>
                    <SelectItem value="Dairy">Dairy</SelectItem>
                    <SelectItem value="Vegetables">Vegetables</SelectItem>
                    <SelectItem value="Fruits">Fruits</SelectItem>
                    <SelectItem value="Bakery">Bakery</SelectItem>
                    <SelectItem value="Snacks">Snacks</SelectItem>
                    <SelectItem value="Instant Food">Instant Food</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label>Product Image</Label>
                <div
                  className={`border-2 border-dashed rounded-lg p-4 transition-colors ${
                    dragActive ? 'border-primary bg-primary/10' : 'border-gray-300'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  {newProduct.imageUrl ? (
                    <div className="relative">
                      <img
                        src={newProduct.imageUrl}
                        alt="Product preview"
                        className="w-full h-32 object-cover rounded-md"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => setNewProduct({...newProduct, imageUrl: ''})}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-600 mb-2">
                        Drag and drop an image here, or click to select
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileInput}
                        className="hidden"
                        id="image-upload"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById('image-upload').click()}
                      >
                        Choose File
                      </Button>
                    </div>
                  )}
                </div>
                
                <div className="grid gap-2 mt-2">
                  <Label htmlFor="imageUrl">Or paste Image URL</Label>
                  <Input
                    id="imageUrl"
                    value={newProduct.imageUrl}
                    onChange={(e) => setNewProduct({...newProduct, imageUrl: e.target.value})}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleAddProduct} className="flex-1">
                Add Product
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {products.map((product) => (
          <Card key={product.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="p-3 md:p-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base md:text-lg truncate pr-2">{product.name}</CardTitle>
                <Badge variant={product.isActive ? "default" : "secondary"}>
                  {product.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-3 md:p-4 pt-0">
              <div className="space-y-3">
                <div className="flex items-center justify-center w-full h-32 bg-muted rounded-md overflow-hidden">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <Package className="w-12 h-12 text-muted-foreground" />
                  )}
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Price:</span>
                    <span className="font-semibold">₹{parseFloat(product.price || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Stock:</span>
                    <span className={`font-semibold ${product.stockQuantity < 10 ? 'text-red-600' : 'text-green-600'}`}>
                      {product.stockQuantity || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Category:</span>
                    <span className="text-sm">{product.category || 'N/A'}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateStock(product.id, (product.stockQuantity || 0) + 10)}
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
                    {product.isActive ? "Disable" : "Enable"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {products.length === 0 && !loading && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Products Found</h3>
          <p className="text-muted-foreground mb-4">Please check your database connection or add products to the database</p>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Product
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;