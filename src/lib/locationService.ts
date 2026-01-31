import { supabaseApi } from './supabase';

export class LocationService {
  private static watchId: number | null = null;
  private static isTracking = false;
  private static currentAgentId: string | null = null;
  
  // Start tracking delivery agent location with enhanced real-time updates
  static async startTracking(agentId: string, orderId?: string) {
    if (this.isTracking && this.currentAgentId === agentId) {
      console.log('📍 Location tracking already active for agent:', agentId);
      return true;
    }
    
    if (!navigator.geolocation) {
      console.error('❌ Geolocation not supported');
      return false;
    }
    
    console.log('📍 Starting enhanced GPS tracking for agent:', agentId);
    this.isTracking = true;
    this.currentAgentId = agentId;
    
    const options = {
      enableHighAccuracy: true,
      timeout: 8000,
      maximumAge: 15000 // 15 seconds
    };
    
    this.watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const timestamp = new Date().toISOString();
        
        console.log('📍 GPS Update:', { 
          agentId, 
          latitude: latitude.toFixed(6), 
          longitude: longitude.toFixed(6), 
          accuracy: Math.round(accuracy),
          timestamp 
        });
        
        try {
          // Update agent location in Supabase database
          const updateResult = await supabaseApi.updateAgentLocation(agentId, latitude, longitude, orderId);
          
          if (updateResult) {
            console.log('✅ Location updated in database successfully');
          } else {
            console.warn('⚠️ Database update returned no result');
          }
          
          // Dispatch real-time event for immediate UI updates
          window.dispatchEvent(new CustomEvent('locationUpdate', {
            detail: { 
              agentId, 
              latitude, 
              longitude, 
              accuracy,
              timestamp,
              orderId 
            }
          }));
          
          // Also dispatch for tracking components
          window.dispatchEvent(new CustomEvent('trackingStarted', {
            detail: {
              orderId: orderId || 'unknown',
              location: { lat: latitude, lng: longitude },
              agentId,
              agentName: 'Delivery Agent',
              status: 'out_for_delivery',
              accuracy,
              timestamp
            }
          }));
          
        } catch (error) {
          console.error('❌ Failed to update location:', error);
        }
      },
      (error) => {
        console.error('❌ GPS Error:', error.message);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            console.error('🚫 Location access denied by user');
            this.isTracking = false;
            break;
          case error.POSITION_UNAVAILABLE:
            console.error('📍 Location information unavailable');
            break;
          case error.TIMEOUT:
            console.error('⏱️ Location request timeout');
            break;
        }
      },
      options
    );
    
    return true;
  }
  
  // Stop tracking location
  static stopTracking() {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
      this.isTracking = false;
      this.currentAgentId = null;
      console.log('📍 GPS tracking stopped');
    }
  }
  
  // Get current location once with enhanced accuracy
  static async getCurrentLocation(): Promise<{ lat: number; lng: number; accuracy?: number } | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        console.error('❌ Geolocation not available');
        resolve(null);
        return;
      }
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const result = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy
          };
          console.log('📍 Current location obtained:', result);
          resolve(result);
        },
        (error) => {
          console.error('❌ Failed to get current location:', error.message);
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 8000,
          maximumAge: 30000
        }
      );
    });
  }
  
  // Calculate distance between two points
  static calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }
  
  // Enhanced reverse geocoding with CORS proxy
  static async reverseGeocode(lat: number, lng: number): Promise<string> {
    try {
      // Use CORS proxy for production
      const proxyUrl = 'https://api.allorigins.win/raw?url=';
      const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
      
      const response = await fetch(proxyUrl + encodeURIComponent(nominatimUrl));
      
      if (response.ok) {
        const data = await response.json();
        if (data && data.display_name) {
          const address = data.address || {};
          const parts = [];
          
          if (address.house_number) parts.push(address.house_number);
          if (address.road) parts.push(address.road);
          if (address.neighbourhood || address.suburb) parts.push(address.neighbourhood || address.suburb);
          if (address.city || address.town || address.village) parts.push(address.city || address.town || address.village);
          
          const formattedAddress = parts.length > 0 ? parts.join(', ') : data.display_name;
          console.log('📍 Reverse geocoded:', { lat, lng, address: formattedAddress });
          return formattedAddress;
        }
      }
    } catch (error) {
      console.error('❌ Reverse geocoding failed:', error);
    }
    
    // Fallback to coordinates
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
  
  // Get tracking status
  static getTrackingStatus() {
    return {
      isTracking: this.isTracking,
      agentId: this.currentAgentId,
      watchId: this.watchId
    };
  }
  
  // Check if location services are available
  static isLocationAvailable(): boolean {
    return 'geolocation' in navigator;
  }
  
  // Request location permission
  static async requestLocationPermission(): Promise<boolean> {
    if (!this.isLocationAvailable()) {
      return false;
    }
    
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 5000
        });
      });
      
      console.log('📍 Location permission granted');
      return true;
    } catch (error) {
      console.error('📍 Location permission denied:', error);
      return false;
    }
  }
}