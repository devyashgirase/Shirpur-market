import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Eye, EyeOff, Image, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ImageDropzone from "@/components/ImageDropzone";

interface CarouselItem {
  id: number;
  productId: number;
  productName: string;
  title: string;
  description: string;
  imageUrl: string;
  price: number;
  isActive: boolean;
  order: number;
}

const AdminCarousel = () => {
  const { toast } = useToast();
  const [carouselItems, setCarouselItems] = useState<CarouselItem[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [editingItem, setEditingItem] = useState<CarouselItem | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadCarouselItems();
    loadProducts();
  }, []);

  const loadCarouselItems = async () => {
    try {
      const saved = localStorage.getItem('carouselItems');
      if (saved) {
        const items = JSON.parse(saved);
        // Sort by order
        items.sort((a: CarouselItem, b: CarouselItem) => a.order - b.order);
        setCarouselItems(items);
      } else {
        // Default carousel items
        const defaultItems: CarouselItem[] = [
          {
            id: 1,
            productId: 1,
            productName: "Fresh Tomatoes",
            title: "🍅 Fresh Farm Tomatoes",
            description: "Premium quality red tomatoes straight from the farm",
            imageUrl: "https://images.unsplash.com/photo-1546470427-e5d491d7e4b8?w=800&h=400&fit=crop",
            price: 40,
            isActive: true,
            order: 1
          }
        ];
        setCarouselItems(defaultItems);
        localStorage.setItem('carouselItems', JSON.stringify(defaultItems));
      }
    } catch (error) {
      console.error('Error loading carousel items:', error);
      toast({ title: "Error loading carousel items", variant: "destructive" });
    }
  };

  const loadProducts = async () => {
    try {
      // Load from product master (same source as customer catalog)
      const savedProducts = localStorage.getItem('products');
      if (savedProducts) {
        const allProducts = JSON.parse(savedProducts);
        // Filter active products only
        const activeProducts = allProducts.filter((p: any) => p.is_active || p.isActive);
        setProducts(activeProducts);
      } else {
        // Try to load from Supabase or other sources
        const { CustomerDataService } = await import('@/lib/customerDataService');
        const customerProducts = await CustomerDataService.getAvailableProducts();
        
        const formattedProducts = customerProducts.map((p: any) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          imageUrl: p.image_url || p.imageUrl,
          category: p.category || p.category_id,
          description: p.description,
          stock_quantity: p.stock_quantity || p.stockQuantity,
          is_active: p.is_active || p.isActive
        })).filter((p: any) => p.is_active);
        
        setProducts(formattedProducts);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      toast({ title: "Error loading products from master", variant: "destructive" });
      setProducts([]);
    }
  };

  const saveCarouselItems = async (items: CarouselItem[]) => {
    try {
      // Save to localStorage for now (can be extended to Supabase)
      localStorage.setItem('carouselItems', JSON.stringify(items));
      setCarouselItems(items);
      
      // Trigger event for customer carousel to update
      window.dispatchEvent(new CustomEvent('carouselUpdated', { detail: items }));
    } catch (error) {
      console.error('Error saving carousel items:', error);
      toast({ title: "Error saving carousel items", variant: "destructive" });
    }
  };

  const handleSave = (item: Omit<CarouselItem, 'id'>) => {
    if (editingItem) {
      const updated = carouselItems.map(i => 
        i.id === editingItem.id ? { ...item, id: editingItem.id } : i
      );
      saveCarouselItems(updated);
      toast({ title: "Carousel item updated successfully" });
    } else {
      const newItem = { ...item, id: Date.now() };
      saveCarouselItems([...carouselItems, newItem]);
      toast({ title: "Carousel item added successfully" });
    }
    setEditingItem(null);
    setShowForm(false);
  };

  const handleDelete = (id: number) => {
    const updated = carouselItems.filter(i => i.id !== id);
    saveCarouselItems(updated);
    toast({ title: "Carousel item deleted" });
  };

  const toggleActive = (id: number) => {
    const updated = carouselItems.map(i => 
      i.id === id ? { ...i, isActive: !i.isActive } : i
    );
    saveCarouselItems(updated);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Carousel Management</h1>
        <Button onClick={() => setShowForm(true)} className="bg-blue-600">
          <Plus className="w-4 h-4 mr-2" />
          Add Carousel Item
        </Button>
      </div>

      {/* Carousel Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {carouselItems.map((item) => (
          <Card key={item.id} className="overflow-hidden">
            <div className="relative h-48 bg-gradient-to-r from-blue-500 to-purple-600">
              {item.imageUrl && (
                <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
              )}
              <div className="absolute inset-0 bg-black/40"></div>
              <div className="absolute top-2 right-2 flex gap-2">
                <Badge variant={item.isActive ? "default" : "secondary"}>
                  {item.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div className="absolute bottom-4 left-4 text-white">
                <h3 className="text-xl font-bold">{item.title}</h3>
                <p className="text-sm opacity-90">{item.description}</p>
                <p className="text-2xl font-bold text-yellow-300">₹{item.price}</p>
              </div>
            </div>
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Order: {item.order}</span>
                <Switch 
                  checked={item.isActive}
                  onCheckedChange={() => toggleActive(item.id)}
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setEditingItem(item);
                    setShowForm(true);
                  }}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => handleDelete(item.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                {editingItem ? "Edit Carousel Item" : "Add Carousel Item"}
                <Button variant="ghost" onClick={() => {
                  setShowForm(false);
                  setEditingItem(null);
                }}>
                  <X className="w-4 h-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CarouselForm 
                item={editingItem}
                products={products}
                onSave={handleSave}
                onCancel={() => {
                  setShowForm(false);
                  setEditingItem(null);
                }}
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

const CarouselForm = ({ 
  item, 
  products, 
  onSave, 
  onCancel 
}: {
  item: CarouselItem | null;
  products: any[];
  onSave: (item: Omit<CarouselItem, 'id'>) => void;
  onCancel: () => void;
}) => {
  const [formData, setFormData] = useState({
    productId: item?.productId || 0,
    productName: item?.productName || '',
    title: item?.title || '',
    description: item?.description || '',
    imageUrl: item?.imageUrl || '',
    price: item?.price || 0,
    isActive: item?.isActive ?? true,
    order: item?.order || 1
  });

  const handleProductChange = (productId: string) => {
    const product = products.find(p => p.id == productId);
    if (product) {
      setFormData({
        ...formData,
        productId: product.id,
        productName: product.name,
        title: product.name,
        description: product.description || `Fresh ${product.name} - Premium Quality`,
        price: product.price,
        // Don't auto-fill product image for banner - keep existing or empty for manual upload
        imageUrl: formData.imageUrl || ''
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Select Product</Label>
        <Select value={formData.productId.toString()} onValueChange={handleProductChange}>
          <SelectTrigger>
            <SelectValue placeholder="Choose a product" />
          </SelectTrigger>
          <SelectContent>
            {products.length > 0 ? products.map(product => (
              <SelectItem key={product.id} value={product.id.toString()}>
                <div className="flex items-center justify-between w-full">
                  <div className="flex flex-col">
                    <span className="font-medium">{product.name}</span>
                    <span className="text-xs text-gray-500">{product.category} • Stock: {product.stock_quantity || 0}</span>
                  </div>
                  <span className="text-green-600 font-semibold">₹{product.price}</span>
                </div>
              </SelectItem>
            )) : (
              <SelectItem value="no-products" disabled>
                No products available
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Title</Label>
        <Input 
          value={formData.title}
          onChange={(e) => setFormData({...formData, title: e.target.value})}
          required
        />
      </div>

      <div>
        <Label>Description</Label>
        <Textarea 
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          rows={3}
        />
      </div>

      <div>
        <Label>Banner Image</Label>
        <ImageDropzone 
          currentImage={formData.imageUrl}
          onImageUpload={(imageUrl) => {
            // Preserve all existing form data when uploading image
            setFormData(prevData => ({
              ...prevData,
              imageUrl: imageUrl
            }));
          }}
          className="mt-2"
        />
        <div className="mt-2">
          <Label className="text-sm text-gray-600">Or enter banner image URL (1200x400 recommended):</Label>
          <Input 
            value={formData.imageUrl}
            onChange={(e) => {
              // Preserve all existing form data when entering URL
              setFormData(prevData => ({
                ...prevData,
                imageUrl: e.target.value
              }));
            }}
            placeholder="https://example.com/banner-image.jpg"
            className="mt-1"
          />
          <p className="text-xs text-gray-500 mt-1">Use wide banner images (1200x400px) for best results</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Price</Label>
          <Input 
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
            required
          />
        </div>
        <div>
          <Label>Display Order</Label>
          <Input 
            type="number"
            value={formData.order}
            onChange={(e) => setFormData({...formData, order: parseInt(e.target.value)})}
            min="1"
            required
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch 
          checked={formData.isActive}
          onCheckedChange={(checked) => setFormData({...formData, isActive: checked})}
        />
        <Label>Active</Label>
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" className="bg-blue-600">
          <Save className="w-4 h-4 mr-2" />
          Save
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default AdminCarousel;