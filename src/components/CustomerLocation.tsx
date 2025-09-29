import { useState, useEffect } from "react";
import { MapPin } from "lucide-react";

const CustomerLocation = () => {
  const [location, setLocation] = useState<string>("Getting location...");

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation(`${latitude.toFixed(3)}, ${longitude.toFixed(3)}`);
        },
        () => setLocation("Location denied"),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setLocation("GPS not supported");
    }
  }, []);

  return (
    <div className="flex items-center space-x-1 text-white/90 text-xs sm:text-sm max-w-32 sm:max-w-48">
      <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
      <span className="truncate">{location}</span>
    </div>
  );
};

export default CustomerLocation;