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
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 transition-opacity duration-300 ${show ? 'opacity-100' : 'opacity-0'}`}>
      <div className={`relative bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-300 ${show ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}>
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with Gradient */}
        <div className={`bg-gradient-to-r ${roleColors[role]} p-6 rounded-t-2xl text-white text-center`}>
          <div className="text-6xl mb-3 animate-bounce">
            {icon}
          </div>
          <h2 className="text-2xl font-bold mb-2">{title}</h2>
        </div>

        {/* Content */}
        <div className="p-6 text-center">
          <div className="mb-4">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto animate-pulse" />
          </div>
          
          <div className="space-y-2 text-gray-700 mb-6">
            {message.split('\\n').map((line, index) => (
              <p key={index} className={`${index === 0 ? 'text-lg font-semibold' : 'text-sm'}`}>
                {line}
              </p>
            ))}
          </div>

          {/* Action Button */}
          <button
            onClick={handleClose}
            className={`w-full py-3 px-6 bg-gradient-to-r ${roleColors[role]} text-white font-semibold rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200`}
          >
            Get Started! 🚀
          </button>
        </div>

        {/* Animated Border */}
        <div className="absolute inset-0 rounded-2xl border-2 border-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-20 animate-pulse"></div>
      </div>
    </div>
  );
};