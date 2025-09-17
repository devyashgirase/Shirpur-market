import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

interface RouteMapProps {
  start: { lat: number; lng: number } | null;
  end: { lat: number; lng: number };
  isActive: boolean;
}

const RouteMap = ({ start, end, isActive }: RouteMapProps) => {
  const map = useMap();

  useEffect(() => {
    if (!start || !isActive) return;

    // Create route line
    const routeLine = L.polyline([
      [start.lat, start.lng],
      [end.lat, end.lng]
    ], {
      color: '#4285f4',
      weight: 4,
      opacity: 0.8,
      dashArray: '10, 5'
    }).addTo(map);

    // Fit map to show both points
    const group = new L.FeatureGroup([routeLine]);
    map.fitBounds(group.getBounds().pad(0.1));

    return () => {
      map.removeLayer(routeLine);
    };
  }, [start, end, isActive, map]);

  return null;
};

export default RouteMap;