import React from 'react';

const DeliveryBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Main gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-green-50" />
      
      {/* Animated delivery truck - MORE VISIBLE */}
      <div className="absolute top-20 right-10 animate-bounce">
        <svg width="120" height="90" viewBox="0 0 80 60" className="text-blue-600 opacity-90">
          <rect x="10" y="20" width="40" height="25" rx="3" fill="currentColor" />
          <rect x="50" y="25" width="20" height="20" rx="2" fill="currentColor" />
          <circle cx="25" cy="50" r="6" fill="currentColor" />
          <circle cx="60" cy="50" r="6" fill="currentColor" />
          <rect x="15" y="10" width="8" height="8" rx="1" fill="currentColor" />
        </svg>
      </div>

      {/* Floating packages - MORE VISIBLE */}
      <div className="absolute top-32 left-20 animate-pulse">
        <svg width="60" height="60" viewBox="0 0 40 40" className="text-orange-500 opacity-70">
          <rect x="5" y="10" width="30" height="25" rx="2" fill="currentColor" />
          <path d="M5 15 L20 25 L35 15" stroke="white" strokeWidth="2" fill="none" />
        </svg>
      </div>

      <div className="absolute bottom-40 right-32 animate-pulse delay-1000">
        <svg width="50" height="50" viewBox="0 0 35 35" className="text-green-500 opacity-60">
          <rect x="3" y="8" width="29" height="22" rx="2" fill="currentColor" />
          <path d="M3 12 L17.5 20 L32 12" stroke="white" strokeWidth="2" fill="none" />
        </svg>
      </div>

      {/* Location pins - MORE VISIBLE */}
      <div className="absolute top-1/3 left-1/4 animate-bounce delay-500">
        <svg width="40" height="50" viewBox="0 0 30 40" className="text-red-500 opacity-70">
          <path d="M15 0C6.7 0 0 6.7 0 15c0 15 15 25 15 25s15-10 15-25C30 6.7 23.3 0 15 0zm0 20c-2.8 0-5-2.2-5-5s2.2-5 5-5 5 2.2 5 5-2.2 5-5 5z" fill="currentColor"/>
        </svg>
      </div>

      <div className="absolute bottom-1/3 right-1/4 animate-bounce delay-700">
        <svg width="35" height="45" viewBox="0 0 25 35" className="text-purple-500 opacity-60">
          <path d="M12.5 0C5.6 0 0 5.6 0 12.5c0 12.5 12.5 22.5 12.5 22.5s12.5-10 12.5-22.5C25 5.6 19.4 0 12.5 0zm0 17.5c-2.8 0-5-2.2-5-5s2.2-5 5-5 5 2.2 5 5-2.2 5-5 5z" fill="currentColor"/>
        </svg>
      </div>

      {/* Delivery route lines - MORE VISIBLE */}
      <svg className="absolute inset-0 w-full h-full opacity-30">
        <defs>
          <pattern id="dots" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
            <circle cx="25" cy="25" r="3" fill="#3B82F6" />
          </pattern>
        </defs>
        <path 
          d="M100 200 Q300 100 500 300 T900 400" 
          stroke="url(#dots)" 
          strokeWidth="4" 
          fill="none"
          strokeDasharray="15,8"
          className="animate-pulse"
        />
      </svg>

      {/* Shirpur city silhouette - MORE VISIBLE */}
      <div className="absolute bottom-0 left-0 right-0 opacity-20">
        <svg width="100%" height="120" viewBox="0 0 1200 120" className="text-gray-700">
          <rect x="50" y="60" width="40" height="60" fill="currentColor" />
          <rect x="100" y="40" width="50" height="80" fill="currentColor" />
          <rect x="160" y="70" width="35" height="50" fill="currentColor" />
          <rect x="200" y="30" width="60" height="90" fill="currentColor" />
          <rect x="270" y="55" width="45" height="65" fill="currentColor" />
          <rect x="320" y="45" width="40" height="75" fill="currentColor" />
          <rect x="370" y="65" width="50" height="55" fill="currentColor" />
          <rect x="430" y="35" width="55" height="85" fill="currentColor" />
          <rect x="490" y="50" width="40" height="70" fill="currentColor" />
          <rect x="540" y="60" width="45" height="60" fill="currentColor" />
          <rect x="590" y="40" width="50" height="80" fill="currentColor" />
          <rect x="650" y="70" width="35" height="50" fill="currentColor" />
          <rect x="690" y="25" width="65" height="95" fill="currentColor" />
          <rect x="760" y="55" width="40" height="65" fill="currentColor" />
          <rect x="810" y="45" width="50" height="75" fill="currentColor" />
          <rect x="870" y="65" width="45" height="55" fill="currentColor" />
          <rect x="920" y="30" width="55" height="90" fill="currentColor" />
          <rect x="980" y="50" width="40" height="70" fill="currentColor" />
          <rect x="1030" y="60" width="45" height="60" fill="currentColor" />
          <rect x="1080" y="40" width="50" height="80" fill="currentColor" />
        </svg>
      </div>

      {/* Floating circles for depth - MORE VISIBLE */}
      <div className="absolute top-1/4 right-1/3 w-32 h-32 bg-blue-200 rounded-full opacity-40 animate-pulse"></div>
      <div className="absolute bottom-1/4 left-1/3 w-24 h-24 bg-green-200 rounded-full opacity-35 animate-pulse delay-1000"></div>
      <div className="absolute top-2/3 right-1/5 w-20 h-20 bg-orange-200 rounded-full opacity-45 animate-pulse delay-500"></div>

      {/* TEST ELEMENT - VERY VISIBLE */}
      <div className="absolute top-10 left-10 bg-red-500 text-white p-4 rounded-lg opacity-100 z-50">
        🚚 BACKGROUND ACTIVE
      </div>
    </div>
  );
};

export default DeliveryBackground;