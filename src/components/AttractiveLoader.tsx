import { Truck, Package, ShoppingCart } from "lucide-react";

interface AttractiveLoaderProps {
  type?: 'customer' | 'admin' | 'delivery';
  message?: string;
}

const AttractiveLoader = ({ type = 'customer', message }: AttractiveLoaderProps) => {
  const getIcon = () => {
    switch (type) {
      case 'customer': return <ShoppingCart className="w-8 h-8" />;
      case 'admin': return <Package className="w-8 h-8" />;
      case 'delivery': return <Truck className="w-8 h-8" />;
      default: return <Package className="w-8 h-8" />;
    }
  };

  const getGradient = () => {
    switch (type) {
      case 'customer': return 'from-blue-500 to-green-500';
      case 'admin': return 'from-purple-500 to-blue-500';
      case 'delivery': return 'from-orange-500 to-red-500';
      default: return 'from-blue-500 to-green-500';
    }
  };

  const getMessage = () => {
    if (message) return message;
    switch (type) {
      case 'customer': return 'Loading products...';
      case 'admin': return 'Loading dashboard...';
      case 'delivery': return 'Loading tasks...';
      default: return 'Loading...';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
      <div className="text-center">
        <div className="relative mb-8">
          <div className={`w-20 h-20 bg-gradient-to-r ${getGradient()} rounded-full flex items-center justify-center text-white animate-pulse mx-auto`}>
            {getIcon()}
          </div>
          <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-blue-500 rounded-full animate-spin mx-auto"></div>
        </div>
        
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-800">{getMessage()}</h2>
          <div className="flex justify-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
          <p className="text-gray-600">Please wait while we fetch your data...</p>
        </div>
      </div>
    </div>
  );
};

export default AttractiveLoader;