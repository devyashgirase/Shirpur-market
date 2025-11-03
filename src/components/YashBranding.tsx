import React from 'react';

interface YashBrandingProps {
  className?: string;
  variant?: 'default' | 'compact' | 'footer';
}

const YashBranding: React.FC<YashBrandingProps> = ({ 
  className = "", 
  variant = "default" 
}) => {
  if (variant === 'compact') {
    return (
      <div className={`flex items-center justify-center space-x-2 ${className}`}>
        <img 
          src="/yash-logo.svg" 
          alt="YASH Technologies" 
          className="w-8 h-4 object-contain rounded-full"
        />
      </div>
    );
  }

  if (variant === 'footer') {
    return (
      <div className={`text-center bg-white/50 backdrop-blur-sm rounded-lg p-4 border border-gray-200 ${className}`}>
        <p className="text-sm text-gray-600 mb-3 font-medium">Powered by</p>
        <div className="flex items-center justify-center space-x-3 mb-2">
          {/* YASH Technologies Logo */}
          <div className="relative">
            <img 
              src="/yash-logo.svg" 
              alt="YASH Technologies Logo" 
              className="w-16 h-8 object-contain rounded-full shadow-lg"
            />

          </div>
          <div className="text-left">
            <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              YASH Technologies
            </span>
            <p className="text-xs text-gray-500">Global IT Solutions & Innovation</p>
          </div>
        </div>
        <div className="text-xs text-gray-600 space-y-1">
          <p className="font-medium">Developed by YASH Technologies</p>
          <p className="text-gray-500">Innovative Solutions for Modern Business</p>
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div className={`text-center ${className}`}>
      <div className="flex items-center justify-center mb-4">
        {/* Main YASH Technologies Logo */}
        <div className="relative">
          {/* Outer glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-green-400 rounded-2xl blur-lg opacity-30"></div>
          
          {/* Main logo container */}
          <img 
            src="/yash-logo.svg" 
            alt="YASH Technologies Logo" 
            className="relative w-32 h-16 object-contain rounded-full shadow-xl"
          />
          

        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
          YASH Technologies
        </h3>
        <p className="text-sm text-gray-600 font-medium">Global IT Solutions & Innovation</p>
        <div className="text-xs text-gray-500 space-y-1">
          <p>Developed by YASH Technologies</p>
          <p>Innovative Solutions for Modern Business</p>
        </div>
      </div>
    </div>
  );
};

export default YashBranding;