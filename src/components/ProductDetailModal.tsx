import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Heart, Plus, Minus, X } from 'lucide-react';
import { cartService } from '@/lib/cartService';
import { useToast } from '@/hooks/use-toast';
import SuccessAlert from './SuccessAlert';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category_id: string;
  stock_qty: number;
  is_active: boolean;
}

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

const ProductDetailModal = ({ product, isOpen, onClose }: ProductDetailModalProps) => {
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  if (!product) return null;

  const handleAddToCart = async () => {
    setIsLoading(true);
    try {
      const success = await cartService.addToCart(product.id, quantity);
      if (success) {
        setSuccessMessage(`${quantity}x ${product.name} added to your cart`);
        setShowSuccess(true);
        window.dispatchEvent(new CustomEvent('cartUpdated'));
        setTimeout(() => onClose(), 2000); // Close modal after 2 seconds
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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{product.name}</span>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Product Image */}
          <div className="aspect-video w-full overflow-hidden rounded-lg">
            <img 
              src={product.image_url || '/placeholder.svg'} 
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/placeholder.svg';
              }}
            />
          </div>

          {/* Product Info */}
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{product.name}</h2>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-green-600 fill-current" />
                    <span className="text-sm font-medium">4.{Math.floor(Math.random() * 5) + 1}</span>
                  </div>
                  <span className="text-gray-400">•</span>
                  <span className="text-sm text-gray-600">{Math.floor(Math.random() * 20) + 25}-{Math.floor(Math.random() * 20) + 35} mins</span>
                </div>
              </div>
              <Heart className="w-6 h-6 text-gray-300 hover:text-red-500 cursor-pointer transition-colors" />
            </div>

            <p className="text-gray-600 leading-relaxed">
              {product.description || `Delicious ${product.name} made with fresh ingredients. Perfect for any meal of the day.`}
            </p>

            {/* Price and Stock */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold text-gray-800">₹{product.price}</span>
                <Badge variant={product.stock_qty > 0 ? "default" : "destructive"}>
                  {product.stock_qty > 0 ? `${product.stock_qty} available` : 'Out of stock'}
                </Badge>
              </div>
            </div>

            {/* Offers */}
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-orange-600">
                <span className="text-sm font-bold">🏷️ OFFERS</span>
              </div>
              <div className="mt-2 space-y-1">
                <p className="text-sm text-orange-700">• 20% off up to ₹50</p>
                <p className="text-sm text-orange-700">• Free delivery on orders above ₹199</p>
              </div>
            </div>

            {/* Quantity Selector */}
            {product.stock_qty > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-medium">Quantity:</span>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="w-8 text-center font-medium">{quantity}</span>
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => setQuantity(Math.min(product.stock_qty, quantity + 1))}
                      disabled={quantity >= product.stock_qty}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <Button 
                  onClick={handleAddToCart}
                  disabled={isLoading || product.stock_qty === 0}
                  className="bg-green-600 hover:bg-green-700 text-white px-8"
                >
                  {isLoading ? 'Adding...' : `Add to Cart - ₹${product.price * quantity}`}
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
      
      {/* Success Alert */}
      <SuccessAlert 
        isVisible={showSuccess}
        message={successMessage}
        onClose={() => setShowSuccess(false)}
      />
    </Dialog>
  );
};

export default ProductDetailModal;