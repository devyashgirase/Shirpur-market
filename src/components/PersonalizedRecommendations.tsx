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
        <p className="text-gray-600">Personalized recommendations based on your preferences</p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {recommendations.map((rec) => (
          <Card key={rec.product.id} className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 hover:border-purple-400 transition-all duration-300 transform hover:scale-105 hover:shadow-xl">
            <CardContent className="p-4 text-center">
              <div className="relative">
                <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full flex items-center justify-center text-2xl animate-pulse">
                  {rec.product.image_url ? (
                    <img src={rec.product.image_url} alt={rec.product.name} className="w-full h-full object-cover rounded-full" />
                  ) : (
                    '✨'
                  )}
                </div>
                <Badge className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs animate-pulse">
                  <Sparkles className="w-3 h-3 mr-1" />
                  For You
                </Badge>
              </div>
              <h3 className="font-bold text-sm mb-1 text-gray-800 line-clamp-2">{rec.product.name}</h3>
              <p className="text-xs text-purple-600 mb-2 line-clamp-1">{rec.reason}</p>
              <p className="text-lg font-bold text-green-600 mb-3">₹{rec.product.price}</p>
              <Button 
                onClick={() => handleAddToCart(rec.product)}
                size="sm"
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold rounded-full transform hover:scale-110 transition-all duration-200"
              >
                <Plus className="w-3 h-3 mr-1" />
                Add ✨
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PersonalizedRecommendations;