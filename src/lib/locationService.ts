import { supabaseApi } from './supabase';

export class LocationService {
  private static watchId: number | null = null;
  private static isTracking = false;
  
  // Start tracking delivery agent location
  static async startTracking(agentId: string, orderId?: string) {
    if (this.isTracking) {
      console.log('📍 Location tracking already active');
      return;
    }
    
    if (!navigator.geolocation) {
      console.error('❌ Geolocation not supported');
      return false;
    }
    
    console.log('📍 Starting GPS tracking for agent:', agentId);
    this.isTracking = true;
    
    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 30000 // 30 seconds
    };
    
    this.watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        console.log('📍 GPS Update:', { latitude, longitude, accuracy: position.coords.accuracy });
        
        try {
          // Update agent location in Supabase
          await supabaseApi.updateAgentLocation(agentId, latitude, longitude, orderId);
          console.log('✅ Location updated in database');
          
          // Dispatch event for real-time UI updates
          window.dispatchEvent(new CustomEvent('locationUpdate', {
            detail: { agentId, latitude, longitude, timestamp: new Date().toISOString() }
          }));
          
        } catch (error) {
          console.error('❌ Failed to update location:', error);
        }
      },
      (error) => {
        console.error('❌ GPS Error:', error.message);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            console.error('Location access denied by user');
            break;
          case error.POSITION_UNAVAILABLE:
            console.error('Location information unavailable');
            break;
          case error.TIMEOUT:
            console.error('Location request timeout');
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
      console.log('📍 GPS tracking stopped');
    }
  }
  
  // Get current location once
  static async getCurrentLocation(): Promise<{ lat: number; lng: number } | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Failed to get current location:', error);
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
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