import { useState, useEffect } from "react";
import { MapPin } from "lucide-react";

const CustomerLocation = () => {
  const [location, setLocation] = useState<string>("Getting location...");

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      // Try multiple geocoding services for better accuracy
      const services = [
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`,
        `https://geocode.xyz/${lat},${lng}?json=1`,
        `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=demo&limit=1`
      ];
      
      for (const serviceUrl of services) {
        try {
          const response = await fetch(serviceUrl);
          const data = await response.json();
          
          // BigDataCloud format
          if (data.locality || data.city) {
            return `${data.locality || data.city}, ${data.principalSubdivision || data.countryName || 'India'}`;
          }
          
          // Geocode.xyz format
          if (data.city && data.state) {
            return `${data.city}, ${data.state}`;
          }
          
          // OpenCage format
          if (data.results && data.results[0]) {
            const result = data.results[0].components;
            const city = result.city || result.town || result.village || result.suburb;
            const state = result.state || result.province;
            if (city && state) {
              return `${city}, ${state}`;
            }
          }
        } catch (e) {
          continue; // Try next service
        }
      }
      
      return `${lat.toFixed(3)}, ${lng.toFixed(3)}`;
    } catch {
      return "Location unavailable";
    }
  };

  useEffect(() => {
    if (navigator.geolocation) {
      setLocation("📍 Getting location...");
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          console.log('GPS Coordinates:', latitude, longitude);
          const address = await reverseGeocode(latitude, longitude);
          console.log('Resolved Address:', address);
          setLocation(address);
        },
        (error) => {
          console.error('Location error:', error);
          setLocation("Shirpur, Maharashtra");
        },
        { 
          enableHighAccuracy: true, 
          timeout: 15000, 
          maximumAge: 300000 // Cache for 5 minutes
        }
      );
    } else {
      setLocation("Shirpur, Maharashtra");
    }
  }, []);

  return (
    <div className="flex items-center space-x-1 text-white/90 text-xs sm:text-sm max-w-40 sm:max-w-64 md:max-w-80">
      <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
      <span className="truncate">{location}</span>
    </div>
  );
};

export default CustomerLocation;