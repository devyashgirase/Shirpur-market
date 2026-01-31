import React, { useEffect, useRef, useState } from 'react';
import { LocationService } from '@/lib/locationService';

interface LeafletMapProps {
  customerLocation: [number, number];
  customerAddress: string;
  agentLocation?: [number, number];
  deliveryAgent?: any;
  userType?: 'customer' | 'admin';
  orderId?: string;
}

const LeafletMap: React.FC<LeafletMapProps> = ({ 
  customerLocation, 
  customerAddress,
  agentLocation, 
  deliveryAgent, 
  userType = 'customer',
  orderId
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const customerMarkerRef = useRef<any>(null);
  const agentMarkerRef = useRef<any>(null);
  const routeLineRef = useRef<any>(null);
  
  const [customerAddressName, setCustomerAddressName] = useState(customerAddress);
  const [agentAddressName, setAgentAddressName] = useState('Loading...');
  const [distance, setDistance] = useState(0);

  // Load Leaflet dynamically
  const loadLeaflet = async () => {
    if (!(window as any).L) {
      // Load CSS
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);

      // Load JS
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      
      return new Promise((resolve) => {
        script.onload = resolve;
        document.head.appendChild(script);
      });
    }
  };

  // Initialize map
  const initializeMap = async () => {
    if (!mapRef.current) return;
    
    await loadLeaflet();
    const L = (window as any).L;

    // Remove existing map
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
    }

    // Create map
    const map = L.map(mapRef.current, {
      center: customerLocation,
      zoom: 15,
      zoomControl: true,
      scrollWheelZoom: true
    });

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map);

    mapInstanceRef.current = map;
    
    // Add customer marker
    addCustomerMarker(L, map);
    
    // Add agent marker if available and has real GPS
    if (agentLocation && deliveryAgent?.current_lat && deliveryAgent?.current_lng) {
      addAgentMarker(L, map);
      drawRoute(L, map);
    }

    // Fit bounds to show both markers
    if (agentLocation && deliveryAgent?.current_lat && deliveryAgent?.current_lng) {
      const group = L.featureGroup([
        L.marker(customerLocation),
        L.marker(agentLocation)
      ]);
      map.fitBounds(group.getBounds().pad(0.1));
    }
  };

  // Add customer marker with address
  const addCustomerMarker = async (L: any, map: any) => {
    // Get detailed address for customer location
    const detailedAddress = await LocationService.reverseGeocode(customerLocation[0], customerLocation[1]);
    setCustomerAddressName(detailedAddress);

    const customerIcon = L.divIcon({
      html: `<div style="
        background: #3B82F6; 
        width: 40px; 
        height: 40px; 
        border-radius: 50%; 
        display: flex; 
        align-items: center; 
        justify-content: center; 
        color: white; 
        font-size: 20px; 
        border: 4px solid white; 
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        position: relative;
      ">🏠</div>`,
      className: 'customer-marker',
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });

    customerMarkerRef.current = L.marker(customerLocation, { icon: customerIcon })
      .addTo(map)
      .bindPopup(`
        <div style="min-width: 200px;">
          <h3 style="margin: 0 0 8px 0; color: #1f2937; font-size: 16px;">
            🏠 ${userType === 'admin' ? 'Customer' : 'Your'} Delivery Address
          </h3>
          <p style="margin: 4px 0; color: #4b5563; font-size: 14px;">
            <strong>📍 Address:</strong><br/>
            ${customerAddress}
          </p>
          <p style="margin: 4px 0; color: #6b7280; font-size: 12px;">
            <strong>🗺️ Location:</strong><br/>
            ${detailedAddress}
          </p>
          <p style="margin: 4px 0; color: #9ca3af; font-size: 11px;">
            📐 ${customerLocation[0].toFixed(6)}, ${customerLocation[1].toFixed(6)}
          </p>
        </div>
      `);
  };

  // Add agent marker with live location - ONLY REAL GPS
  const addAgentMarker = async (L: any, map: any) => {
    if (!agentLocation || !deliveryAgent?.current_lat || !deliveryAgent?.current_lng) return;

    // Get detailed address for agent location
    const detailedAddress = await LocationService.reverseGeocode(agentLocation[0], agentLocation[1]);
    setAgentAddressName(detailedAddress);
    
    const agentIcon = L.divIcon({
      html: `<div style="
        background: #10B981; 
        width: 40px; 
        height: 40px; 
        border-radius: 50%; 
        display: flex; 
        align-items: center; 
        justify-content: center; 
        color: white; 
        font-size: 20px; 
        border: 4px solid white; 
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        animation: bounce 1s infinite;
      ">🚚</div>
      <style>
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-10px); }
          60% { transform: translateY(-5px); }
        }
      </style>`,
      className: 'agent-marker',
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });

    // Remove existing agent marker
    if (agentMarkerRef.current) {
      map.removeLayer(agentMarkerRef.current);
    }

    agentMarkerRef.current = L.marker(agentLocation, { icon: agentIcon })
      .addTo(map)
      .bindPopup(`
        <div style="min-width: 200px;">
          <h3 style="margin: 0 0 8px 0; color: #1f2937; font-size: 16px;">
            🚚 ${deliveryAgent?.name || 'Delivery Agent'}
          </h3>
          <p style="margin: 4px 0; color: #4b5563; font-size: 14px;">
            <strong>📍 Current Location:</strong><br/>
            ${detailedAddress}
          </p>
          <p style="margin: 4px 0; color: #6b7280; font-size: 12px;">
            <strong>📱 Phone:</strong> ${deliveryAgent?.phone || 'N/A'}
          </p>
          <p style="margin: 4px 0; color: #10b981; font-size: 12px;">
            <strong>🛰️ Live GPS Tracking</strong>
          </p>
          <p style="margin: 4px 0; color: #9ca3af; font-size: 11px;">
            📐 ${agentLocation[0].toFixed(6)}, ${agentLocation[1].toFixed(6)}
          </p>
          <p style="margin: 4px 0; color: #9ca3af; font-size: 11px;">
            🕒 ${deliveryAgent?.last_updated ? new Date(deliveryAgent.last_updated).toLocaleTimeString() : 'N/A'}
          </p>
        </div>
      `);
  };

  // Draw route between customer and agent - ONLY FOR REAL GPS
  const drawRoute = (L: any, map: any) => {
    if (!agentLocation || !deliveryAgent?.current_lat || !deliveryAgent?.current_lng) return;

    // Remove existing route
    if (routeLineRef.current) {
      map.removeLayer(routeLineRef.current);
    }
    
    routeLineRef.current = L.polyline([customerLocation, agentLocation], {
      color: '#10B981',
      weight: 4,
      opacity: 0.8,
      dashArray: '10, 10'
    }).addTo(map);

    // Calculate distance
    const dist = LocationService.calculateDistance(
      customerLocation[0], customerLocation[1],
      agentLocation[0], agentLocation[1]
    );
    setDistance(dist);
  };

  // Update agent location - ONLY REAL GPS
  const updateAgentLocation = async (newLocation: [number, number]) => {
    if (!mapInstanceRef.current) return;
    
    const L = (window as any).L;
    await addAgentMarker(L, mapInstanceRef.current);
    drawRoute(L, mapInstanceRef.current);
  };

  // Listen for location updates - ONLY REAL GPS
  useEffect(() => {
    const handleLocationUpdate = (event: CustomEvent) => {
      const { latitude, longitude, orderId: eventOrderId, isRealGPS } = event.detail;
      
      // Only process real GPS data
      if (!isRealGPS) return;
      
      if (eventOrderId === orderId || !orderId) {
        updateAgentLocation([latitude, longitude]);
      }
    };

    const handleTrackingStarted = (event: CustomEvent) => {
      const { location, orderId: eventOrderId, isRealGPS } = event.detail;
      
      // Only process real GPS data
      if (!isRealGPS) return;
      
      if (eventOrderId === orderId || !orderId) {
        updateAgentLocation([location.lat, location.lng]);
      }
    };

    window.addEventListener('locationUpdate', handleLocationUpdate as EventListener);
    window.addEventListener('trackingStarted', handleTrackingStarted as EventListener);

    return () => {
      window.removeEventListener('locationUpdate', handleLocationUpdate as EventListener);
      window.removeEventListener('trackingStarted', handleTrackingStarted as EventListener);
    };
  }, [orderId]);

  // Initialize map on mount
  useEffect(() => {
    initializeMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }
    };
  }, [customerLocation]);

  // Update agent marker when location changes - ONLY REAL GPS
  useEffect(() => {
    if (mapInstanceRef.current && agentLocation && deliveryAgent?.current_lat && deliveryAgent?.current_lng) {
      const L = (window as any).L;
      addAgentMarker(L, mapInstanceRef.current);
      drawRoute(L, mapInstanceRef.current);
    }
  }, [agentLocation, deliveryAgent]);

  // Only show if agent has real GPS data
  const hasRealGPS = agentLocation && deliveryAgent?.current_lat && deliveryAgent?.current_lng;

  return (
    <div className="relative w-full h-96 rounded-lg overflow-hidden border-2 border-gray-200">
      <div ref={mapRef} className="w-full h-full" />
      
      {/* Status overlay - ONLY REAL GPS */}
      {hasRealGPS && (
        <div className="absolute top-4 right-4 z-[1000]">
          <div className="px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 bg-green-500 text-white">
            <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
            🛰️ LIVE GPS
          </div>
        </div>
      )}

      {/* Info panel */}
      <div className="absolute bottom-4 left-4 right-4 z-[1000]">
        <div className="bg-white rounded-lg shadow-lg p-3 space-y-2">
          <div className="flex justify-between items-center">
            <div className="text-sm">
              <span className="font-medium">📏 Distance:</span> {distance.toFixed(2)} km
            </div>
            {hasRealGPS && (
              <div className="text-sm font-medium text-green-600">
                ⏱️ ETA: {Math.max(1, Math.round(distance * 2))} min
              </div>
            )}
          </div>
          
          <div className="text-xs text-gray-600 space-y-1">
            <div><strong>🏠 Customer:</strong> {customerAddressName}</div>
            {hasRealGPS && (
              <div><strong>🚚 Agent:</strong> {agentAddressName}</div>
            )}
          </div>
        </div>
      </div>

      {/* Admin coordinates - ONLY REAL GPS */}
      {userType === 'admin' && (
        <div className="absolute top-4 left-4 bg-white px-3 py-2 rounded-lg shadow-md z-[1000] text-xs max-w-xs">
          <div className="font-medium mb-1">📍 Live GPS Coordinates</div>
          <div className="text-gray-600 space-y-1">
            <div><strong>🏠 Customer:</strong> {customerLocation[0].toFixed(6)}, {customerLocation[1].toFixed(6)}</div>
            {hasRealGPS && (
              <div><strong>🚚 Agent:</strong> {agentLocation[0].toFixed(6)}, {agentLocation[1].toFixed(6)}</div>
            )}
            <div className="text-xs text-blue-600 mt-1">
              🛰️ Real-time GPS tracking only
            </div>
          </div>
        </div>
      )}

      {/* No tracking message */}
      {!hasRealGPS && agentLocation && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[1000]">
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded-lg text-center">
            <div className="font-medium mb-1">⚠️ Waiting for Live GPS</div>
            <div className="text-sm">Delivery agent needs to start GPS tracking</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeafletMap;