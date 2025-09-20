import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface DynamicPriceProps {
  currentPrice: number;
  productId: string;
  className?: string;
}

const DynamicPrice = ({ currentPrice, productId, className = '' }: DynamicPriceProps) => {
  const [previousPrice, setPreviousPrice] = useState(currentPrice);
  const [priceChange, setPriceChange] = useState<'up' | 'down' | 'same'>('same');
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    if (currentPrice !== previousPrice) {
      if (currentPrice > previousPrice) {
        setPriceChange('up');
      } else if (currentPrice < previousPrice) {
        setPriceChange('down');
      } else {
        setPriceChange('same');
      }
      
      setShowAnimation(true);
      setTimeout(() => setShowAnimation(false), 2000);
      setPreviousPrice(currentPrice);
    }
  }, [currentPrice, previousPrice]);

  const getPriceChangeIcon = () => {
    switch (priceChange) {
      case 'up':
        return <TrendingUp className="w-3 h-3 text-red-500" />;
      case 'down':
        return <TrendingDown className="w-3 h-3 text-green-500" />;
      default:
        return <Minus className="w-3 h-3 text-gray-400" />;
    }
  };

  const getPriceChangeColor = () => {
    switch (priceChange) {
      case 'up':
        return 'text-red-600';
      case 'down':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const getPriceBadgeVariant = () => {
    switch (priceChange) {
      case 'up':
        return 'destructive';
      case 'down':
        return 'default';
      default:
        return 'secondary';
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span 
        className={`font-bold text-lg transition-all duration-300 ${
          showAnimation ? 'animate-pulse scale-110' : ''
        } ${getPriceChangeColor()}`}
      >
        ₹{currentPrice.toFixed(2)}
      </span>
      
      {priceChange !== 'same' && (
        <Badge 
          variant={getPriceBadgeVariant()}
          className={`flex items-center gap-1 text-xs transition-all duration-300 ${
            showAnimation ? 'animate-bounce' : ''
          }`}
        >
          {getPriceChangeIcon()}
          {priceChange === 'up' ? '+' : '-'}₹{Math.abs(currentPrice - previousPrice).toFixed(2)}
        </Badge>
      )}
      
      <Badge variant="outline" className="text-xs text-gray-500">
        Live
      </Badge>
    </div>
  );
};

export default DynamicPrice;