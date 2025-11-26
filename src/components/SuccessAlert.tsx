import { useEffect, useState } from 'react';
import { CheckCircle, ShoppingCart, Sparkles } from 'lucide-react';

interface SuccessAlertProps {
  isVisible: boolean;
  message: string;
  onClose: () => void;
}

const SuccessAlert = ({ isVisible, message, onClose }: SuccessAlertProps) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShow(true);
      // Auto close after 3 seconds
      const timer = setTimeout(() => {
        setShow(false);
        setTimeout(onClose, 300); // Wait for animation to complete
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible && !show) return null;

  return (
    <>
      {/* Confetti Effect */}
      {show && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random() * 2}s`
              }}
            >
              <Sparkles 
                className="w-4 h-4 text-yellow-400" 
                style={{
                  transform: `rotate(${Math.random() * 360}deg)`
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Success Alert */}
      <div 
        className={`fixed top-20 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ${
          show ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-10 opacity-0 scale-95'
        }`}
      >
        <div className="bg-white rounded-2xl shadow-2xl border border-green-200 p-6 max-w-sm mx-4">
          <div className="flex items-center space-x-4">
            {/* Animated Success Icon */}
            <div className="relative">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center animate-pulse">
                <CheckCircle className="w-8 h-8 text-green-600 animate-bounce" />
              </div>
              {/* Ring Animation */}
              <div className="absolute inset-0 w-12 h-12 border-2 border-green-400 rounded-full animate-ping opacity-75"></div>
            </div>
            
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-800 mb-1">
                🎉 Added to Cart!
              </h3>
              <p className="text-sm text-gray-600">{message}</p>
            </div>
            
            {/* Cart Icon with Badge */}
            <div className="relative">
              <ShoppingCart className="w-6 h-6 text-green-600 animate-bounce" />
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-xs text-white font-bold">+</span>
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4 w-full bg-gray-200 rounded-full h-1">
            <div 
              className="bg-green-500 h-1 rounded-full animate-pulse"
              style={{
                width: show ? '100%' : '0%',
                transition: 'width 3s linear'
              }}
            ></div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SuccessAlert;