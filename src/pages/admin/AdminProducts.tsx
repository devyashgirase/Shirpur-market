import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, Plus, Upload, X, Search, Trash2 } from "lucide-react";
import { ProductCardSkeleton } from "@/components/LoadingSkeleton";
import { AdminDataService } from "@/lib/adminDataService";
import { apiService } from "@/lib/apiService";
import { unifiedDB } from "@/lib/database";
import { useToast } from "@/hooks/use-toast";

const AdminProducts = () => {
  const { toast } = useToast();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
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
      
      // Load directly from Supabase API
      const { supabaseApi } = await import('@/lib/supabase');
      
      const dbProducts = await supabaseApi.getProducts();
      console.log('📦 Loaded products from Supabase:', dbProducts.length);
      setProducts(dbProducts || []);
      setFilteredProducts(dbProducts || []);
    } catch (error) {
      console.error('❌ Failed to load products:', error);
      setProducts([]);
      setFilteredProducts([]);
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
        imageUrl: newProduct.imageUrl || '/placeholder.svg',
        image_url: newProduct.imageUrl || '/placeholder.svg',
        isActive: true,
        is_available: true
      };

      console.log('💾 Adding product to database:', productData.name);
      
      // Save directly to Supabase API
      console.log('🔍 AdminProducts: Starting product creation...');
      console.log('📤 Product data to save:', productData);
      
      const { supabaseApi } = await import('@/lib/supabase');
      
      const dbProduct = await supabaseApi.createProduct(productData);
      console.log('✅ AdminProducts: Product created in Supabase:', dbProduct);
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

      // Reset form and refresh list
      setNewProduct({
        name: '',
        description: '',
        price: '',
        category: '',
        stockQuantity: '',
        imageUrl: ''
      });
      setIsDialogOpen(false);
      
      // Force refresh products list
      console.log('🔄 Refreshing products list...');
      await loadProducts();
      
      // Also trigger customer catalog refresh
      window.dispatchEvent(new CustomEvent('productsUpdated'));
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
    setFilteredProducts(updatedProducts.filter(product => 
      !searchQuery.trim() || 
      product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase())
    ));
    
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
      
      // Update directly in Supabase
      const { supabaseApi } = await import('@/lib/supabase');
      await supabaseApi.updateProduct(parseInt(productId), { isActive: newStatus });
      
      // Update local state immediately
      const updatedProducts = products.map(p => 
        p.id === productId ? { ...p, isActive: newStatus } : p
      );
      setProducts(updatedProducts);
      setFilteredProducts(updatedProducts.filter(product => 
        !searchQuery.trim() || 
        product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase())
      ));
      
      // Trigger customer catalog refresh
      window.dispatchEvent(new CustomEvent('productsUpdated', { detail: updatedProducts }));
      
      toast({
        title: "Product Updated",
        description: `${product.name} ${newStatus ? 'enabled' : 'disabled'} successfully.`,
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

  const handleDeleteProduct = async (productId: string, productName: string) => {
    const confirmed = window.confirm(`Are you sure you want to delete "${productName}"? This action cannot be undone.`);
    
    if (!confirmed) return;
    
    try {
      console.log('🗑️ Deleting product from database:', productId);
      
      // Delete from Supabase
      const { supabaseApi } = await import('@/lib/supabase');
      await supabaseApi.deleteProduct(parseInt(productId));
      
      // Update local state
      const updatedProducts = products.filter(p => p.id !== productId);
      setProducts(updatedProducts);
      setFilteredProducts(updatedProducts.filter(product => 
        !searchQuery.trim() || 
        product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase())
      ));
      
      // Trigger customer catalog refresh
      window.dispatchEvent(new CustomEvent('productsUpdated', { detail: updatedProducts }));
      
      toast({
        title: "Product Deleted",
        description: `${productName} has been deleted successfully.`,
      });
    } catch (error) {
      console.error('❌ Failed to delete product:', error);
      toast({
        title: "Database Error",
        description: "Failed to delete product from database.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-3 md:px-4 py-4 md:py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-3 md:px-4 py-4 md:py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 md:mb-6 gap-3 md:gap-0">
        <h1 className="text-xl md:text-3xl font-bold">Product Management</h1>
        
        <div className="flex gap-3 items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                const query = e.target.value;
                if (!query.trim()) {
                  setFilteredProducts(products);
                } else {
                  const filtered = products.filter(product => 
                    product.name?.toLowerCase().includes(query.toLowerCase()) ||
                    product.category?.toLowerCase().includes(query.toLowerCase()) ||
                    product.description?.toLowerCase().includes(query.toLowerCase())
                  );
                  setFilteredProducts(filtered);
                }
              }}
              className="pl-10 w-64"
            />
          </div>
          
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
                    <SelectItem value="Pan Corner">Pan Corner</SelectItem>
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
      </div>
      
      {searchQuery && (
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Found {filteredProducts.length} product(s) for "{searchQuery}"
            {filteredProducts.length !== products.length && (
              <Button 
                variant="link" 
                size="sm" 
                onClick={() => {
                  setSearchQuery('');
                  setFilteredProducts(products);
                }}
                className="ml-2 p-0 h-auto"
              >
                Clear search
              </Button>
            )}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {filteredProducts.map((product) => (
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
                  {(product.imageUrl || product.image_url) ? (
                    <img 
                      src={product.imageUrl || product.image_url} 
                      alt={product.name} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className={`flex items-center justify-center w-full h-full ${(product.imageUrl || product.image_url) ? 'hidden' : 'flex'}`}>
                    <Package className="w-12 h-12 text-muted-foreground" />
                  </div>
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
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteProduct(product.id, product.name)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && !loading && searchQuery && (
        <div className="text-center py-12">
          <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Products Found</h3>
          <p className="text-muted-foreground mb-4">No products match "{searchQuery}"</p>
          <Button onClick={() => {
            setSearchQuery('');
            setFilteredProducts(products);
          }} variant="outline">
            Clear Search
          </Button>
        </div>
      )}
      
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