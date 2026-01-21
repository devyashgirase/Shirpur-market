import React from 'react';
import { MapPin, Navigation, Clock, Truck } from 'lucide-react';

interface SimpleMapProps {
  customerLocation: [number, number];
  agentLocation?: [number, number];
  deliveryAgent?: any;
  userType?: 'customer' | 'admin';
}

const SimpleMap: React.FC<SimpleMapProps> = ({ 
  customerLocation, 
  agentLocation, 
  deliveryAgent, 
  userType = 'customer' 
}) => {
  const distance = agentLocation ? 
    Math.sqrt(
      Math.pow(agentLocation[0] - customerLocation[0], 2) + 
      Math.pow(agentLocation[1] - customerLocation[1], 2)
    ) * 111 : 0; // Rough km conversion

  const isRealGPS = deliveryAgent?.id !== 999 && agentLocation;
  const accuracy = deliveryAgent?.accuracy || 'Unknown';

  return (
    <div className="relative bg-gradient-to-br from-blue-100 via-green-50 to-blue-100 rounded-lg overflow-hidden h-96 border-2 border-gray-200">
      {/* Background grid pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="grid grid-cols-12 grid-rows-12 h-full w-full">
          {Array.from({ length: 144 }).map((_, i) => (
            <div key={i} className="border border-gray-400"></div>
          ))}
        </div>
      </div>
      
      {/* Map Title */}
      <div className="absolute top-4 left-4 bg-white px-3 py-2 rounded-lg shadow-md z-10">
        <h3 className="font-bold text-gray-800 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-blue-500" />
          {userType === 'admin' ? 'Admin Live Tracking' : 'Live GPS Tracking'}
        </h3>
      </div>
      
      {/* GPS Status Indicator */}
      <div className="absolute top-4 right-4 z-10">
        <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 ${
          isRealGPS ? 'bg-green-500 text-white' : 'bg-orange-500 text-white'
        }`}>
          <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
          {isRealGPS ? '🛰️ REAL GPS' : '📍 DEMO MODE'}
        </div>
      </div>
      
      {/* Coordinates Display for Admin */}
      {userType === 'admin' && (
        <div className="absolute top-16 right-4 bg-white px-3 py-2 rounded-lg shadow-md z-10 text-xs max-w-xs">
          <div className="font-medium text-gray-800 mb-1">📍 GPS Coordinates</div>
          <div className="text-gray-600 space-y-1">
            <div><strong>Customer:</strong> {customerLocation[0].toFixed(6)}, {customerLocation[1].toFixed(6)}</div>
            {agentLocation && (
              <>
                <div><strong>Agent:</strong> {agentLocation[0].toFixed(6)}, {agentLocation[1].toFixed(6)}</div>
                <div><strong>Accuracy:</strong> {typeof accuracy === 'number' ? `${Math.round(accuracy)}m` : accuracy}</div>
              </>
            )}
          </div>
        </div>
      )}
      
      {/* Customer Location */}
      <div className="absolute top-1/4 left-1/3 transform -translate-x-1/2 -translate-y-1/2 z-20">
        <div className="relative">
          <div className="w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl shadow-lg animate-pulse border-4 border-white">
            🏠
          </div>
          <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-3 py-1 rounded-full shadow text-xs font-medium whitespace-nowrap">
            {userType === 'admin' ? 'Customer Location' : 'Your Location'}
          </div>
          {/* Ripple effect */}
          <div className="absolute inset-0 w-14 h-14 bg-blue-400 rounded-full animate-ping opacity-30"></div>
        </div>
      </div>
      
      {/* Delivery Agent Location */}
      {agentLocation && (
        <div className="absolute top-3/4 right-1/4 transform translate-x-1/2 -translate-y-1/2 z-20">
          <div className="relative">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white text-2xl shadow-lg border-4 border-white ${
              isRealGPS ? 'bg-green-500 animate-bounce' : 'bg-orange-500 animate-pulse'
            }`}>
              <Truck className="w-8 h-8" />
            </div>
            <div className={`absolute -bottom-12 left-1/2 transform -translate-x-1/2 text-white px-3 py-1 rounded-full shadow text-xs font-medium whitespace-nowrap ${
              isRealGPS ? 'bg-green-500' : 'bg-orange-500'
            }`}>
              {deliveryAgent?.name || 'Delivery Partner'}
            </div>
            {/* GPS signal indicator */}
            <div className={`absolute -top-2 -right-2 w-5 h-5 rounded-full animate-pulse ${
              isRealGPS ? 'bg-green-400' : 'bg-yellow-400'
            }`}>
              {isRealGPS ? '🛰️' : '📍'}
            </div>
          </div>
        </div>
      )}
      
      {/* Route Line */}
      {agentLocation && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
          <defs>
            <pattern id="dashed-line" patternUnits="userSpaceOnUse" width="20" height="4">
              <rect width="10" height="4" fill={isRealGPS ? "#10B981" : "#F59E0B"} />
              <rect x="10" width="10" height="4" fill="transparent" />
            </pattern>
          </defs>
          <line 
            x1="33%" y1="25%" 
            x2="75%" y2="75%" 
            stroke="url(#dashed-line)" 
            strokeWidth="4"
            className="animate-pulse"
          />
          {/* Direction arrow */}
          <polygon 
            points="280,290 290,285 290,295" 
            fill={isRealGPS ? "#10B981" : "#F59E0B"}
            className="animate-pulse"
          />
        </svg>
      )}
      
      {/* Distance and ETA Info */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
        <div className="bg-white px-4 py-2 rounded-lg shadow-md">
          <div className="text-sm font-medium text-gray-800 flex items-center gap-2">
            <Navigation className="w-4 h-4 text-blue-500" />
            Distance: ~{distance.toFixed(2)} km
          </div>
        </div>
        
        {agentLocation && (
          <div className={`text-white px-4 py-2 rounded-lg shadow-md ${
            isRealGPS ? 'bg-green-500' : 'bg-orange-500'
          }`}>
            <div className="text-sm font-medium flex items-center gap-2">
              <Clock className="w-4 h-4" />
              ETA: {Math.max(1, Math.round(distance * 2))} min
            </div>
          </div>
        )}
      </div>
      
      {/* Data Source Legend */}
      <div className="absolute bottom-4 right-4 bg-black bg-opacity-70 text-white px-3 py-2 rounded-lg text-xs">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span>Customer</span>
        </div>
        <div className="flex items-center gap-2 mb-1">
          <div className={`w-3 h-3 rounded-full ${isRealGPS ? 'bg-green-500' : 'bg-orange-500'}`}></div>
          <span>Delivery Agent</span>
        </div>
        <div className="text-xs text-gray-300 mt-1">
          {isRealGPS ? '🛰️ Live GPS Data' : '📍 Simulated Data'}
        </div>
      </div>
    </div>
  );
};

export default SimpleMap;