import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, ShoppingCart, Sparkles } from "lucide-react";
import { personalizationService } from "@/lib/personalizationService";
import { addToCart, type Product } from "@/lib/mockData";
import { sweetAlert } from "@/components/ui/sweet-alert";

interface PersonalizedRecommendationsProps {
  products: Product[];
}

const PersonalizedRecommendations = ({ products }: PersonalizedRecommendationsProps) => {
  const [recommendations, setRecommendations] = useState<any[]>([]);

  useEffect(() => {
    const recs = personalizationService.getRecommendationsWithReasons(products, 6);
    setRecommendations(recs);
  }, [products]);

  const handleAddToCart = (product: Product) => {
    if (product.stock_qty > 0) {
      addToCart(product, 1);
      
      sweetAlert.success(
        "Added to Cart!",
        `${product.name} has been added to your cart successfully`
      );
      
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    }
  };

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl md:text-3xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          <Sparkles className="inline w-6 h-6 mr-2 text-purple-600" />
          Just for You
        </h2>
        <p className="text-gray-600 text-sm md:text-base">Personalized recommendations based on your preferences</p>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
        {recommendations.map((rec) => (
          <Card key={rec.product.id} className="bg-gradient-to-br from-purple-50 via-white to-pink-50 border-2 border-purple-200 hover:border-purple-400 transition-all duration-300 transform hover:scale-105 hover:shadow-xl group">
            <CardContent className="p-3 md:p-4">
              <div className="relative mb-3">
                {/* Product Image */}
                <div className="aspect-square bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl overflow-hidden mb-2 group-hover:shadow-lg transition-all duration-300">
                  {rec.product.image_url ? (
                    <img 
                      src={rec.product.image_url} 
                      alt={rec.product.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl md:text-4xl">
                      ✨
                    </div>
                  )}
                </div>
                
                {/* Special Badge */}
                <Badge className="absolute -top-1 -right-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs animate-pulse shadow-lg">
                  <Sparkles className="w-2 h-2 mr-1" />
                  For You
                </Badge>
              </div>
              
              {/* Product Info */}
              <div className="space-y-2">
                <h3 className="font-bold text-sm md:text-base text-gray-800 line-clamp-2 min-h-[2.5rem]">
                  {rec.product.name}
                </h3>
                
                <p className="text-xs text-purple-600 line-clamp-1 italic">
                  {rec.reason}
                </p>
                
                {/* Price */}
                <div className="flex items-center justify-between">
                  <p className="text-lg md:text-xl font-bold text-green-600">
                    ₹{rec.product.price}
                  </p>
                  {rec.product.stock_qty > 0 && (
                    <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                      In Stock
                    </Badge>
                  )}
                </div>
                
                {/* Add to Cart Button */}
                <Button 
                  onClick={() => handleAddToCart(rec.product)}
                  size="sm"
                  disabled={rec.product.stock_qty === 0}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold rounded-xl transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  {rec.product.stock_qty === 0 ? (
                    'Out of Stock'
                  ) : (
                    <>
                      <ShoppingCart className="w-3 h-3 mr-1" />
                      <span className="hidden sm:inline">Add to Cart</span>
                      <span className="sm:hidden">Add</span>
                      <span className="ml-1">✨</span>
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PersonalizedRecommendations;