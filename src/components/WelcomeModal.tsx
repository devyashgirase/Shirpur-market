import { useEffect, useState } from 'react';
import { X, CheckCircle } from 'lucide-react';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  icon: string;
  role: 'customer' | 'admin' | 'delivery';
}

export const WelcomeModal = ({ isOpen, onClose, title, message, icon, role }: WelcomeModalProps) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShow(true);
    }
  }, [isOpen]);

  const handleClose = () => {
    setShow(false);
    setTimeout(onClose, 300);
  };

  const roleColors = {
    customer: 'from-blue-500 to-purple-600',
    admin: 'from-purple-500 to-pink-600', 
    delivery: 'from-green-500 to-blue-600'
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all duration-500 ${show ? 'opacity-100' : 'opacity-0'}`}>
      <div className={`relative bg-white rounded-3xl shadow-2xl max-w-lg w-full transform transition-all duration-700 ${show ? 'scale-100 translate-y-0 rotate-0' : 'scale-75 translate-y-8 rotate-3'}`}>
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Animated Header */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-8 rounded-t-2xl text-center relative overflow-hidden">
          {/* Floating Elements */}
          <div className="absolute top-4 left-4 w-3 h-3 bg-blue-300 rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
          <div className="absolute top-8 right-6 w-2 h-2 bg-green-300 rounded-full animate-bounce" style={{animationDelay: '0.5s'}}></div>
          <div className="absolute bottom-6 left-8 w-2 h-2 bg-yellow-300 rounded-full animate-bounce" style={{animationDelay: '1s'}}></div>
          
          {/* Animated Human Figure */}
          <div className="relative mx-auto mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse shadow-lg">
              <div className="text-4xl animate-bounce" style={{animationDelay: '0.2s'}}>👋</div>
            </div>
            {/* Speech Bubble */}
            <div className="absolute -top-2 -right-4 bg-white rounded-lg px-3 py-1 shadow-md animate-pulse" style={{animationDelay: '1s'}}>
              <div className="text-xs text-gray-600">Welcome!</div>
              <div className="absolute bottom-0 left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-2 animate-fade-in">{title}</h2>
          <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full animate-expand"></div>
        </div>

        {/* Content with Animation */}
        <div className="p-8 text-center bg-white">
          {/* Welcome Message */}
          <div className="mb-6 animate-slide-up" style={{animationDelay: '0.5s'}}>
            <div className="text-lg font-semibold text-gray-800 mb-3">🎉 Welcome to Our Store!</div>
            <div className="space-y-2 text-gray-600">
              {message.split('\\n').map((line, index) => (
                <p key={index} className="text-sm leading-relaxed animate-fade-in" style={{animationDelay: `${0.7 + index * 0.2}s`}}>
                  {line}
                </p>
              ))}
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-3 gap-4 mb-6 animate-slide-up" style={{animationDelay: '1s'}}>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl mb-1">🚚</div>
              <div className="text-xs text-gray-600">Fast Delivery</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl mb-1">🛒</div>
              <div className="text-xs text-gray-600">Easy Shopping</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl mb-1">💳</div>
              <div className="text-xs text-gray-600">Secure Payment</div>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handleClose}
            className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300 animate-slide-up"
            style={{animationDelay: '1.2s'}}
          >
            🛍️ Start Shopping Now
          </button>
        </div>

        {/* Animated CSS */}
        <style jsx>{`
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes slide-up {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes expand {
            from { width: 0; }
            to { width: 4rem; }
          }
          .animate-fade-in {
            animation: fade-in 0.6s ease-out forwards;
            opacity: 0;
          }
          .animate-slide-up {
            animation: slide-up 0.8s ease-out forwards;
            opacity: 0;
          }
          .animate-expand {
            animation: expand 1s ease-out forwards;
          }
        `}</style>
      </div>
    </div>
  );
};