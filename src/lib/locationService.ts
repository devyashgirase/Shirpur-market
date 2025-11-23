// Enhanced location service with detailed address
export class LocationService {
  static async getCurrentLocationWithDetails() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          try {
            // Get detailed address using reverse geocoding
            const address = await this.reverseGeocode(latitude, longitude);
            
            resolve({
              lat: latitude,
              lng: longitude,
              accuracy: position.coords.accuracy,
              address: address,
              timestamp: new Date().toISOString()
            });
          } catch (error) {
            // Fallback with basic coordinates
            resolve({
              lat: latitude,
              lng: longitude,
              accuracy: position.coords.accuracy,
              address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
              timestamp: new Date().toISOString()
            });
          }
        },
        (error) => reject(error),
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    });
  }

  static async reverseGeocode(lat: number, lng: number): Promise<string> {
    try {
      // Using Nominatim (free OpenStreetMap service)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'Shirpur-Market-App'
          }
        }
      );
      
      if (!response.ok) throw new Error('Geocoding failed');
      
      const data = await response.json();
      
      if (data && data.address) {
        const addr = data.address;
        const parts = [];
        
        // Building details
        if (addr.house_number) parts.push(addr.house_number);
        if (addr.building) parts.push(addr.building);
        if (addr.shop) parts.push(addr.shop);
        if (addr.office) parts.push(addr.office);
        
        // Street details
        if (addr.road) parts.push(addr.road);
        if (addr.neighbourhood) parts.push(addr.neighbourhood);
        if (addr.suburb) parts.push(addr.suburb);
        
        // Area details
        if (addr.city || addr.town || addr.village) {
          parts.push(addr.city || addr.town || addr.village);
        }
        if (addr.state) parts.push(addr.state);
        if (addr.postcode) parts.push(addr.postcode);
        
        return parts.join(', ') || data.display_name;
      }
      
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    }
  }

  static async searchAddress(query: string) {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'Shirpur-Market-App'
          }
        }
      );
      
      if (!response.ok) throw new Error('Address search failed');
      
      const data = await response.json();
      
      return data.map((item: any) => ({
        display_name: item.display_name,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        address: item.address
      }));
    } catch (error) {
      console.error('Address search failed:', error);
      return [];
    }
  }
}