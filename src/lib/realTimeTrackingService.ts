import { supabase } from './supabase';

export interface LiveLocation {
  lat: number;
  lng: number;
  timestamp: number;
  speed?: number;
  heading?: number;
}

export interface DeliveryAgent {
  id: string;
  name: string;
  phone: string;
  currentLocation: LiveLocation;
  isOnline: boolean;
  activeOrderId?: string;
}

class RealTimeTrackingService {
  private locationUpdateInterval: NodeJS.Timeout | null = null;
  private subscribers: Map<string, (data: any) => void> = new Map();

  // Start real-time location tracking for delivery agent
  startLocationTracking(agentId: string) {
    if (this.locationUpdateInterval) {
      clearInterval(this.locationUpdateInterval);
    }

    this.locationUpdateInterval = setInterval(() => {
      this.updateAgentLocation(agentId);
    }, 5000); // Update every 5 seconds

    // Also update immediately
    this.updateAgentLocation(agentId);
  }

  // Stop location tracking
  stopLocationTracking() {
    if (this.locationUpdateInterval) {
      clearInterval(this.locationUpdateInterval);
      this.locationUpdateInterval = null;
    }
  }

  // Update agent location using GPS
  private async updateAgentLocation(agentId: string) {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const location: LiveLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          timestamp: Date.now(),
          speed: position.coords.speed || 0,
          heading: position.coords.heading || 0
        };

        await this.saveLocationToDatabase(agentId, location);
        this.notifySubscribers('locationUpdate', { agentId, location });
      },
      (error) => {
        console.error('GPS Error:', error);
        // Use simulated location for demo
        this.simulateLocationUpdate(agentId);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
    );
  }

  // Simulate location updates for demo
  private async simulateLocationUpdate(agentId: string) {
    const baseLocation = { lat: 21.3487, lng: 74.8831 };
    const time = Date.now() / 10000;
    
    const location: LiveLocation = {
      lat: baseLocation.lat + Math.sin(time) * 0.01,
      lng: baseLocation.lng + Math.cos(time) * 0.01,
      timestamp: Date.now(),
      speed: Math.random() * 30 + 10, // 10-40 km/h
      heading: (time * 10) % 360
    };

    await this.saveLocationToDatabase(agentId, location);
    this.notifySubscribers('locationUpdate', { agentId, location });
  }

  // Save location to database
  private async saveLocationToDatabase(agentId: string, location: LiveLocation) {
    try {
      await supabase
        .from('delivery_tracking')
        .upsert({
          agent_id: agentId,
          latitude: location.lat,
          longitude: location.lng,
          speed: location.speed,
          heading: location.heading,
          timestamp: new Date(location.timestamp).toISOString(),
          updated_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Failed to save location:', error);
    }
  }

  // Get current location of agent
  async getAgentLocation(agentId: string): Promise<LiveLocation | null> {
    try {
      const { data, error } = await supabase
        .from('delivery_tracking')
        .select('*')
        .eq('agent_id', agentId)
        .order('timestamp', { ascending: false })
        .limit(1);

      if (error || !data || data.length === 0) return null;

      const record = data[0];
      return {
        lat: record.latitude,
        lng: record.longitude,
        timestamp: new Date(record.timestamp).getTime(),
        speed: record.speed,
        heading: record.heading
      };
    } catch (error) {
      console.error('Failed to get agent location:', error);
      return null;
    }
  }

  // Subscribe to real-time updates
  subscribe(event: string, callback: (data: any) => void) {
    const id = Math.random().toString(36);
    this.subscribers.set(id, callback);
    return id;
  }

  // Unsubscribe from updates
  unsubscribe(id: string) {
    this.subscribers.delete(id);
  }

  // Notify all subscribers
  private notifySubscribers(event: string, data: any) {
    this.subscribers.forEach(callback => {
      try {
        callback({ event, data });
      } catch (error) {
        console.error('Subscriber callback error:', error);
      }
    });
  }

  // Get all active delivery agents with locations
  async getActiveAgents(): Promise<DeliveryAgent[]> {
    try {
      const { data, error } = await supabase
        .from('delivery_agents')
        .select(`
          *,
          delivery_tracking!inner(*)
        `)
        .eq('is_active', true)
        .order('delivery_tracking.timestamp', { ascending: false });

      if (error) throw error;

      return data.map(agent => ({
        id: agent.id,
        name: agent.name,
        phone: agent.phone,
        currentLocation: {
          lat: agent.delivery_tracking[0]?.latitude || 21.3487,
          lng: agent.delivery_tracking[0]?.longitude || 74.8831,
          timestamp: new Date(agent.delivery_tracking[0]?.timestamp || Date.now()).getTime(),
          speed: agent.delivery_tracking[0]?.speed || 0,
          heading: agent.delivery_tracking[0]?.heading || 0
        },
        isOnline: true,
        activeOrderId: agent.active_order_id
      }));
    } catch (error) {
      console.error('Failed to get active agents:', error);
      return [];
    }
  }

  // Calculate ETA based on current location and destination
  calculateETA(currentLocation: LiveLocation, destination: { lat: number; lng: number }): number {
    const distance = this.calculateDistance(
      currentLocation.lat, currentLocation.lng,
      destination.lat, destination.lng
    );
    
    const avgSpeed = currentLocation.speed || 25; // km/h
    const etaMinutes = (distance / avgSpeed) * 60;
    
    return Math.round(etaMinutes);
  }

  // Calculate distance between two points
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + 
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }
}

export const realTimeTrackingService = new RealTimeTrackingService();