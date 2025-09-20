import React, { useState, useEffect } from 'react';
import { CheckCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SweetAlertProps {
  show: boolean;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'warning';
  onClose: () => void;
  duration?: number;
}

export const SweetAlert: React.FC<SweetAlertProps> = ({
  show,
  title,
  message,
  type = 'success',
  onClose,
  duration = 3000
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    if (isClosing) return;
    setIsClosing(true);
    setIsVisible(false);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 300);
  };

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      setIsClosing(false);
      const timer = setTimeout(handleClose, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration]);

  if (!show && !isVisible) return null;

  return (
    <div className={cn(
      "fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm",
      isVisible ? "animate-in fade-in-0" : "animate-out fade-out-0"
    )}>
      <div className={cn(
        "bg-white rounded-2xl p-8 max-w-sm w-full mx-4 text-center shadow-2xl",
        isVisible ? "animate-in zoom-in-95 slide-in-from-bottom-4" : "animate-out zoom-out-95 slide-out-to-bottom-4"
      )}>
        <button
          onClick={handleClose}
          disabled={isClosing}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 disabled:opacity-50"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="mb-6">
          <div className="w-20 h-20 mx-auto mb-4 relative">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center animate-bounce">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
            <div className="absolute inset-0 w-20 h-20 bg-green-200 rounded-full animate-ping opacity-20"></div>
          </div>
        </div>
        
        <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        
        <button
          onClick={handleClose}
          disabled={isClosing}
          className="bg-green-500 hover:bg-green-600 disabled:bg-green-400 text-white px-8 py-3 rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
        >
          Great!
        </button>
      </div>
    </div>
  );
};

let alertQueue: Array<{ title: string; message: string; type?: 'success' | 'error' | 'warning' }> = [];
let showAlert: ((alert: { title: string; message: string; type?: 'success' | 'error' | 'warning' }) => void) | null = null;

export const sweetAlert = {
  success: (title: string, message: string) => {
    if (showAlert) {
      showAlert({ title, message, type: 'success' });
    } else {
      alertQueue.push({ title, message, type: 'success' });
    }
  }
};

export const SweetAlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentAlert, setCurrentAlert] = useState<{ title: string; message: string; type?: 'success' | 'error' | 'warning' } | null>(null);

  useEffect(() => {
    showAlert = (alert) => {
      setCurrentAlert(alert);
    };

    // Process queued alerts
    if (alertQueue.length > 0) {
      const alert = alertQueue.shift();
      if (alert) setCurrentAlert(alert);
    }

    return () => {
      showAlert = null;
    };
  }, []);

  return (
    <>
      {children}
      <SweetAlert
        show={!!currentAlert}
        title={currentAlert?.title || ''}
        message={currentAlert?.message || ''}
        type={currentAlert?.type}
        onClose={() => setCurrentAlert(null)}
      />
    </>
  );
};