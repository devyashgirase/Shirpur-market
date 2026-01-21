import React, { useEffect, useRef } from 'react';

interface OpenStreetMapProps {
  customerLocation: [number, number];
  agentLocation?: [number, number];
  deliveryAgent?: any;
  userType?: 'customer' | 'admin';
}

const OpenStreetMap: React.FC<OpenStreetMapProps> = ({ 
  customerLocation, 
  agentLocation, 
  deliveryAgent, 
  userType = 'customer' 
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Create Leaflet map
    const initMap = async () => {
      // Dynamically import Leaflet
      const L = (window as any).L || await import('leaflet');
      
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }

      // Initialize map
      const map = L.map(mapRef.current).setView(customerLocation, 15);

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      // Customer marker
      const customerIcon = L.divIcon({
        html: '<div style="background: #3B82F6; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 16px; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">🏠</div>',
        className: 'custom-marker',
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      });

      L.marker(customerLocation, { icon: customerIcon })
        .addTo(map)
        .bindPopup(`<b>${userType === 'admin' ? 'Customer Order Address' : 'Your Delivery Address'}</b><br/>🏠 ${customerLocation[0].toFixed(6)}, ${customerLocation[1].toFixed(6)}<br/>📍 Geocoded from order address`);

      // Agent marker if available
      if (agentLocation) {
        const isRealGPS = deliveryAgent?.id !== 999;
        const agentIcon = L.divIcon({
          html: `<div style="background: ${isRealGPS ? '#10B981' : '#F59E0B'}; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 16px; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); animation: bounce 1s infinite;">🚚</div>`,
          className: 'custom-marker',
          iconSize: [30, 30],
          iconAnchor: [15, 15]
        });

        const agentMarker = L.marker(agentLocation, { icon: agentIcon }).addTo(map);
        
        let popupContent = `<b>${deliveryAgent?.name || 'Delivery Partner'}</b><br/>`;
        popupContent += `📍 Current Location: ${agentLocation[0].toFixed(6)}, ${agentLocation[1].toFixed(6)}<br/>`;
        popupContent += `${isRealGPS ? '🛰️ Live GPS Tracking' : '📍 Demo Mode'}<br/>`;
        popupContent += `🔄 Last Update: ${deliveryAgent?.last_updated ? new Date(deliveryAgent.last_updated).toLocaleTimeString() : 'N/A'}`;
        
        if (userType === 'admin' && deliveryAgent?.accuracy) {
          popupContent += `<br/>📶 GPS Accuracy: ${Math.round(deliveryAgent.accuracy)}m`;
        }
        
        agentMarker.bindPopup(popupContent);

        // Draw route line
        const routeLine = L.polyline([customerLocation, agentLocation], {
          color: isRealGPS ? '#10B981' : '#F59E0B',
          weight: 4,
          opacity: 0.8,
          dashArray: '10, 10'
        }).addTo(map);

        // Fit map to show both markers
        const group = L.featureGroup([
          L.marker(customerLocation),
          L.marker(agentLocation)
        ]);
        map.fitBounds(group.getBounds().pad(0.1));
      }

      mapInstanceRef.current = map;
    };

    // Load Leaflet CSS and JS
    if (!(window as any).L) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);

      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = initMap;
      document.head.appendChild(script);
    } else {
      initMap();
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }
    };
  }, [customerLocation, agentLocation, deliveryAgent, userType]);

  const distance = agentLocation ? 
    Math.sqrt(
      Math.pow(agentLocation[0] - customerLocation[0], 2) + 
      Math.pow(agentLocation[1] - customerLocation[1], 2)
    ) * 111 : 0;

  const isRealGPS = deliveryAgent?.id !== 999 && agentLocation;

  return (
    <div className="relative h-96 rounded-lg overflow-hidden border-2 border-gray-200">
      <div ref={mapRef} className="w-full h-full" />
      
      {/* Status overlay */}
      <div className="absolute top-4 right-4 z-[1000]">
        <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 ${
          isRealGPS ? 'bg-green-500 text-white' : 'bg-orange-500 text-white'
        }`}>
          <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
          {isRealGPS ? '🛰️ LIVE GPS' : '📍 DEMO'}
        </div>
      </div>

      {/* Info panel */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center z-[1000]">
        <div className="bg-white px-3 py-2 rounded-lg shadow-md text-sm">
          🛣️ Live Distance: {distance.toFixed(3)} km
        </div>
        
        {agentLocation && (
          <div className={`text-white px-3 py-2 rounded-lg shadow-md text-sm ${
            isRealGPS ? 'bg-green-500' : 'bg-orange-500'
          }`}>
            ⏱️ Live ETA: {Math.max(1, Math.round(distance * 2))} min
          </div>
        )}
      </div>

      {/* Admin coordinates */}
      {userType === 'admin' && (
        <div className="absolute top-4 left-4 bg-white px-3 py-2 rounded-lg shadow-md z-[1000] text-xs max-w-xs">
          <div className="font-medium mb-1">📍 Live GPS Coordinates</div>
          <div className="text-gray-600 space-y-1">
            <div><strong>🏠 Order Address:</strong> {customerLocation[0].toFixed(6)}, {customerLocation[1].toFixed(6)}</div>
            {agentLocation && (
              <div><strong>🚚 Agent Live:</strong> {agentLocation[0].toFixed(6)}, {agentLocation[1].toFixed(6)}</div>
            )}
            <div className="text-xs text-blue-600 mt-1">
              {isRealGPS ? '🛰️ Real-time GPS tracking' : '📍 Simulated tracking'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OpenStreetMap;