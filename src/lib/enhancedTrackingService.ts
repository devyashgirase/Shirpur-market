// Enhanced Tracking Service with Advanced Features
export interface EnhancedLocationData {
  lat: number;
  lng: number;
  accuracy: number;
  timestamp: number;
  speed?: number;
  altitude?: number;
  heading?: number;
  address?: string;
}

export interface TrafficData {
  level: 'low' | 'medium' | 'high';
  delay: number;
  congestionPoints: EnhancedLocationData[];
  alternateRoutes: EnhancedLocationData[][];
}

export interface WeatherData {
  condition: string;
  temperature: number;
  humidity: number;
  visibility: number;
  windSpeed: number;
  impact: 'none' | 'low' | 'medium' | 'high';
}

export interface RouteAnalytics {
  totalDistance: number;
  estimatedTime: number;
  fuelConsumption: number;
  carbonFootprint: number;
  efficiency: number;
  optimizationSavings: {
    time: number;
    distance: number;
    fuel: number;
  };
}

export interface GeofenceZone {
  id: string;
  center: EnhancedLocationData;
  radius: number;
  type: 'pickup' | 'delivery' | 'restricted' | 'safe';
  name: string;
  isActive: boolean;
}

export interface DeliveryMetrics {
  averageSpeed: number;
  stopDuration: number;
  routeDeviation: number;
  customerSatisfaction: number;
  onTimePerformance: number;
}

export interface EnhancedTrackingUpdate {
  orderId: string;
  agentId: string;
  agentLocation: EnhancedLocationData;
  customerLocation: EnhancedLocationData;
  route: {
    current: EnhancedLocationData[];
    optimized: EnhancedLocationData[];
    alternate: EnhancedLocationData[];
  };
  estimatedArrival: number;
  distance: number;
  status: 'assigned' | 'picked_up' | 'on_the_way' | 'nearby' | 'delivered' | 'delayed' | 'rerouting';
  traffic: TrafficData;
  weather: WeatherData;
  analytics: RouteAnalytics;
  geofences: GeofenceZone[];
  metrics: DeliveryMetrics;
  alerts: Array<{
    type: 'traffic' | 'weather' | 'geofence' | 'delay' | 'route';
    message: string;
    severity: 'low' | 'medium' | 'high';
    timestamp: number;
  }>;
}

export class EnhancedTrackingService {
  private static trackingInterval: number | null = null;
  private static subscribers: Map<string, Function[]> = new Map();
  private static trackingData: Map<string, EnhancedTrackingUpdate> = new Map();
  private static geofences: GeofenceZone[] = [];

  // Initialize enhanced tracking
  static initializeTracking(): void {
    this.setupDefaultGeofences();
    this.startGlobalTracking();
  }

  // Setup default geofences for Shirpur area
  private static setupDefaultGeofences(): void {
    this.geofences = [
      {
        id: 'shirpur-market',
        center: { lat: 21.3486, lng: 74.8811, accuracy: 5, timestamp: Date.now() },
        radius: 200,
        type: 'pickup',
        name: 'Shirpur Market Area',
        isActive: true
      },
      {
        id: 'gandhi-chowk',
        center: { lat: 21.3500, lng: 74.8825, accuracy: 5, timestamp: Date.now() },
        radius: 150,
        type: 'delivery',
        name: 'Gandhi Chowk',
        isActive: true
      },
      {
        id: 'station-road',
        center: { lat: 21.3520, lng: 74.8840, accuracy: 5, timestamp: Date.now() },
        radius: 100,
        type: 'delivery',
        name: 'Station Road',
        isActive: true
      },
      {
        id: 'restricted-zone',
        center: { lat: 21.3450, lng: 74.8790, accuracy: 5, timestamp: Date.now() },
        radius: 300,
        type: 'restricted',
        name: 'Restricted Area',
        isActive: true
      }
    ];
  }

  // Start global tracking system
  private static startGlobalTracking(): void {
    if (this.trackingInterval) {
      clearInterval(this.trackingInterval);
    }

    this.trackingInterval = setInterval(() => {
      this.updateAllTrackingData();
    }, 5000); // Update every 5 seconds
  }

  // Update all active tracking data
  private static updateAllTrackingData(): void {
    this.trackingData.forEach((data, orderId) => {
      this.updateTrackingData(orderId);
    });
  }

  // Start enhanced tracking for specific order
  static startOrderTracking(orderId: string, agentId: string, customerLocation?: EnhancedLocationData): void {
    // Get real customer location if not provided
    if (!customerLocation) {
      this.getCurrentLocation().then(location => {
        if (location) {
          this.startOrderTracking(orderId, agentId, location);
        }
      });
      return;
    }

    const initialData: EnhancedTrackingUpdate = {
      orderId,
      agentId,
      agentLocation: this.generateMockAgentLocation(),
      customerLocation,
      route: {
        current: this.generateRoute(this.generateMockAgentLocation(), customerLocation),
        optimized: this.generateOptimizedRoute(this.generateMockAgentLocation(), customerLocation),
        alternate: this.generateAlternateRoute(this.generateMockAgentLocation(), customerLocation)
      },
      estimatedArrival: 15,
      distance: 2.5,
      status: 'assigned',
      traffic: this.generateTrafficData(),
      weather: this.generateWeatherData(),
      analytics: this.calculateRouteAnalytics(2.5, 15),
      geofences: this.geofences,
      metrics: this.generateDeliveryMetrics(),
      alerts: []
    };

    this.trackingData.set(orderId, initialData);
    this.notifySubscribers('trackingStarted', { orderId, data: initialData });
  }

  // Update tracking data for specific order
  private static updateTrackingData(orderId: string): void {
    const data = this.trackingData.get(orderId);
    if (!data) return;

    // Simulate agent movement
    const newAgentLocation = this.simulateMovement(data.agentLocation, data.customerLocation);
    const newDistance = this.calculateDistance(newAgentLocation, data.customerLocation);
    const newETA = Math.max(1, newDistance * 2 + Math.random() * 3);

    // Update route
    const updatedRoute = [...data.route.current.slice(-9), newAgentLocation];

    // Check geofence violations
    const geofenceAlerts = this.checkGeofenceViolations(newAgentLocation);

    // Update traffic conditions
    const updatedTraffic = this.updateTrafficData(data.traffic);

    // Calculate new metrics
    const updatedMetrics = this.updateDeliveryMetrics(data.metrics, newAgentLocation);

    const updatedData: EnhancedTrackingUpdate = {
      ...data,
      agentLocation: newAgentLocation,
      route: {
        ...data.route,
        current: updatedRoute
      },
      distance: newDistance,
      estimatedArrival: newETA,
      status: this.determineStatus(newDistance, data.status),
      traffic: updatedTraffic,
      weather: this.updateWeatherData(data.weather),
      analytics: this.calculateRouteAnalytics(newDistance, newETA),
      metrics: updatedMetrics,
      alerts: [...data.alerts.slice(-5), ...geofenceAlerts]
    };

    this.trackingData.set(orderId, updatedData);
    this.notifySubscribers('trackingUpdate', { orderId, data: updatedData });
  }

  // Generate mock agent location
  private static generateMockAgentLocation(): EnhancedLocationData {
    return {
      lat: 21.3486 + (Math.random() - 0.5) * 0.02,
      lng: 74.8811 + (Math.random() - 0.5) * 0.02,
      accuracy: 3 + Math.random() * 7,
      timestamp: Date.now(),
      speed: 20 + Math.random() * 15,
      altitude: 450 + Math.random() * 50,
      heading: Math.random() * 360
    };
  }

  // Simulate realistic movement
  private static simulateMovement(current: EnhancedLocationData, target: EnhancedLocationData): EnhancedLocationData {
    const speed = (current.speed || 25) / 3600; // Convert km/h to km/s
    const timeStep = 5; // 5 seconds
    const distance = speed * timeStep;

    const bearing = this.calculateBearing(current, target);
    const newPosition = this.moveTowards(current, bearing, distance);

    return {
      ...newPosition,
      accuracy: 3 + Math.random() * 7,
      timestamp: Date.now(),
      speed: Math.max(5, (current.speed || 25) + (Math.random() - 0.5) * 10),
      altitude: (current.altitude || 450) + (Math.random() - 0.5) * 10,
      heading: bearing + (Math.random() - 0.5) * 30
    };
  }

  // Calculate bearing between two points
  private static calculateBearing(from: EnhancedLocationData, to: EnhancedLocationData): number {
    const dLng = (to.lng - from.lng) * Math.PI / 180;
    const lat1 = from.lat * Math.PI / 180;
    const lat2 = to.lat * Math.PI / 180;

    const y = Math.sin(dLng) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);

    return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
  }

  // Move towards a bearing for a specific distance
  private static moveTowards(from: EnhancedLocationData, bearing: number, distance: number): EnhancedLocationData {
    const R = 6371; // Earth's radius in km
    const bearingRad = bearing * Math.PI / 180;
    const lat1 = from.lat * Math.PI / 180;
    const lng1 = from.lng * Math.PI / 180;

    const lat2 = Math.asin(
      Math.sin(lat1) * Math.cos(distance / R) +
      Math.cos(lat1) * Math.sin(distance / R) * Math.cos(bearingRad)
    );

    const lng2 = lng1 + Math.atan2(
      Math.sin(bearingRad) * Math.sin(distance / R) * Math.cos(lat1),
      Math.cos(distance / R) - Math.sin(lat1) * Math.sin(lat2)
    );

    return {
      lat: lat2 * 180 / Math.PI,
      lng: lng2 * 180 / Math.PI,
      accuracy: from.accuracy,
      timestamp: Date.now()
    };
  }

  // Generate route points
  private static generateRoute(start: EnhancedLocationData, end: EnhancedLocationData): EnhancedLocationData[] {
    const points: EnhancedLocationData[] = [];
    const steps = 10;

    for (let i = 0; i <= steps; i++) {
      const ratio = i / steps;
      points.push({
        lat: start.lat + (end.lat - start.lat) * ratio + (Math.random() - 0.5) * 0.001,
        lng: start.lng + (end.lng - start.lng) * ratio + (Math.random() - 0.5) * 0.001,
        accuracy: 5,
        timestamp: Date.now() - (steps - i) * 60000,
        speed: 20 + Math.random() * 10
      });
    }

    return points;
  }

  // Generate optimized route
  private static generateOptimizedRoute(start: EnhancedLocationData, end: EnhancedLocationData): EnhancedLocationData[] {
    return this.generateRoute(start, end).map(point => ({
      ...point,
      lat: point.lat + (Math.random() - 0.5) * 0.0005,
      lng: point.lng + (Math.random() - 0.5) * 0.0005
    }));
  }

  // Generate alternate route
  private static generateAlternateRoute(start: EnhancedLocationData, end: EnhancedLocationData): EnhancedLocationData[] {
    return this.generateRoute(start, end).map(point => ({
      ...point,
      lat: point.lat + (Math.random() - 0.5) * 0.002,
      lng: point.lng + (Math.random() - 0.5) * 0.002
    }));
  }

  // Generate traffic data
  private static generateTrafficData(): TrafficData {
    const levels: TrafficData['level'][] = ['low', 'medium', 'high'];
    const level = levels[Math.floor(Math.random() * levels.length)];
    
    return {
      level,
      delay: level === 'high' ? 5 + Math.random() * 10 : level === 'medium' ? 2 + Math.random() * 5 : Math.random() * 2,
      congestionPoints: [],
      alternateRoutes: []
    };
  }

  // Update traffic data
  private static updateTrafficData(current: TrafficData): TrafficData {
    const levels: TrafficData['level'][] = ['low', 'medium', 'high'];
    const shouldChange = Math.random() < 0.1; // 10% chance to change
    
    return {
      ...current,
      level: shouldChange ? levels[Math.floor(Math.random() * levels.length)] : current.level,
      delay: Math.max(0, current.delay + (Math.random() - 0.5) * 2)
    };
  }

  // Generate weather data
  private static generateWeatherData(): WeatherData {
    const conditions = ['Clear', 'Cloudy', 'Light Rain', 'Sunny', 'Overcast'];
    
    return {
      condition: conditions[Math.floor(Math.random() * conditions.length)],
      temperature: 25 + Math.random() * 10,
      humidity: 40 + Math.random() * 40,
      visibility: 8 + Math.random() * 4,
      windSpeed: Math.random() * 15,
      impact: 'none'
    };
  }

  // Update weather data
  private static updateWeatherData(current: WeatherData): WeatherData {
    return {
      ...current,
      temperature: current.temperature + (Math.random() - 0.5) * 2,
      humidity: Math.max(20, Math.min(90, current.humidity + (Math.random() - 0.5) * 10)),
      visibility: Math.max(2, Math.min(15, current.visibility + (Math.random() - 0.5) * 2))
    };
  }

  // Calculate route analytics
  private static calculateRouteAnalytics(distance: number, time: number): RouteAnalytics {
    const fuelConsumption = distance * 0.05; // 50ml per km
    const carbonFootprint = fuelConsumption * 2.3; // kg CO2
    
    return {
      totalDistance: distance,
      estimatedTime: time,
      fuelConsumption,
      carbonFootprint,
      efficiency: Math.max(60, 100 - (time / distance) * 10),
      optimizationSavings: {
        time: Math.random() * 5,
        distance: Math.random() * 0.5,
        fuel: Math.random() * 0.02
      }
    };
  }

  // Generate delivery metrics
  private static generateDeliveryMetrics(): DeliveryMetrics {
    return {
      averageSpeed: 20 + Math.random() * 15,
      stopDuration: Math.random() * 5,
      routeDeviation: Math.random() * 10,
      customerSatisfaction: 4.2 + Math.random() * 0.8,
      onTimePerformance: 85 + Math.random() * 15
    };
  }

  // Update delivery metrics
  private static updateDeliveryMetrics(current: DeliveryMetrics, location: EnhancedLocationData): DeliveryMetrics {
    return {
      ...current,
      averageSpeed: (current.averageSpeed + (location.speed || 25)) / 2,
      routeDeviation: Math.max(0, current.routeDeviation + (Math.random() - 0.5) * 2)
    };
  }

  // Check geofence violations
  private static checkGeofenceViolations(location: EnhancedLocationData): Array<{
    type: 'geofence';
    message: string;
    severity: 'low' | 'medium' | 'high';
    timestamp: number;
  }> {
    const alerts: Array<{
      type: 'geofence';
      message: string;
      severity: 'low' | 'medium' | 'high';
      timestamp: number;
    }> = [];

    this.geofences.forEach(geofence => {
      if (!geofence.isActive) return;

      const distance = this.calculateDistance(location, geofence.center);
      const isInside = distance <= geofence.radius / 1000; // Convert to km

      if (isInside && geofence.type === 'restricted') {
        alerts.push({
          type: 'geofence',
          message: `Entered restricted zone: ${geofence.name}`,
          severity: 'high',
          timestamp: Date.now()
        });
      } else if (isInside && geofence.type === 'delivery') {
        alerts.push({
          type: 'geofence',
          message: `Arrived at delivery zone: ${geofence.name}`,
          severity: 'low',
          timestamp: Date.now()
        });
      }
    });

    return alerts;
  }

  // Determine delivery status based on distance
  private static determineStatus(distance: number, currentStatus: string): EnhancedTrackingUpdate['status'] {
    if (distance < 0.05) return 'nearby';
    if (distance < 0.5) return 'on_the_way';
    if (currentStatus === 'assigned') return 'picked_up';
    return currentStatus as EnhancedTrackingUpdate['status'];
  }

  // Calculate distance between two points
  private static calculateDistance(point1: EnhancedLocationData, point2: EnhancedLocationData): number {
    const R = 6371; // Earth's radius in km
    const dLat = (point2.lat - point1.lat) * Math.PI / 180;
    const dLng = (point2.lng - point1.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  // Get enhanced tracking data
  static getEnhancedTrackingData(orderId: string): EnhancedTrackingUpdate | null {
    return this.trackingData.get(orderId) || null;
  }

  // Subscribe to tracking updates
  static subscribe(event: string, callback: Function): void {
    if (!this.subscribers.has(event)) {
      this.subscribers.set(event, []);
    }
    this.subscribers.get(event)!.push(callback);
  }

  // Unsubscribe from tracking updates
  static unsubscribe(event: string, callback: Function): void {
    const callbacks = this.subscribers.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  // Notify subscribers
  private static notifySubscribers(event: string, data: any): void {
    const callbacks = this.subscribers.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  // Stop tracking for specific order
  static stopOrderTracking(orderId: string): void {
    this.trackingData.delete(orderId);
    this.notifySubscribers('trackingStopped', { orderId });
  }

  // Stop all tracking
  static stopAllTracking(): void {
    if (this.trackingInterval) {
      clearInterval(this.trackingInterval);
      this.trackingInterval = null;
    }
    this.trackingData.clear();
  }

  // Get all active trackings
  static getAllActiveTrackings(): Map<string, EnhancedTrackingUpdate> {
    return new Map(this.trackingData);
  }

  // Add custom geofence
  static addGeofence(geofence: GeofenceZone): void {
    this.geofences.push(geofence);
  }

  // Remove geofence
  static removeGeofence(geofenceId: string): void {
    this.geofences = this.geofences.filter(g => g.id !== geofenceId);
  }

  // Get geofences
  static getGeofences(): GeofenceZone[] {
    return [...this.geofences];
  }
}