// Real-time Route Analysis Service
export interface RouteAnalysis {
  distance: number;
  duration: number;
  estimatedArrival: string;
  traffic: {
    level: 'light' | 'moderate' | 'heavy';
    delay: number;
  };
  route: {
    lat: number;
    lng: number;
  }[];
  efficiency: number;
  fuelConsumption: number;
  carbonFootprint: number;
}

export class RealTimeRouteAnalysisService {
  private static instance: RealTimeRouteAnalysisService;
  private routeCache = new Map<string, RouteAnalysis>();
  private updateInterval: NodeJS.Timeout | null = null;

  static getInstance(): RealTimeRouteAnalysisService {
    if (!this.instance) {
      this.instance = new RealTimeRouteAnalysisService();
    }
    return this.instance;
  }

  // Calculate real distance using Haversine formula
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  // Generate realistic route points
  private generateRoutePoints(startLat: number, startLng: number, endLat: number, endLng: number): {lat: number, lng: number}[] {
    const points = [];
    const steps = 8;
    
    for (let i = 0; i <= steps; i++) {
      const ratio = i / steps;
      // Add some curve to make it realistic
      const curve = Math.sin(ratio * Math.PI) * 0.002;
      points.push({
        lat: startLat + (endLat - startLat) * ratio + curve,
        lng: startLng + (endLng - startLng) * ratio + curve
      });
    }
    
    return points;
  }

  // Calculate traffic based on time and distance
  private calculateTraffic(distance: number): { level: 'light' | 'moderate' | 'heavy', delay: number } {
    const hour = new Date().getHours();
    const isRushHour = (hour >= 8 && hour <= 10) || (hour >= 17 && hour <= 19);
    const isWeekend = new Date().getDay() === 0 || new Date().getDay() === 6;
    
    let level: 'light' | 'moderate' | 'heavy' = 'light';
    let delay = 0;
    
    if (isRushHour && !isWeekend) {
      level = distance > 5 ? 'heavy' : 'moderate';
      delay = distance * (level === 'heavy' ? 3 : 1.5);
    } else if (distance > 10) {
      level = 'moderate';
      delay = distance * 1;
    } else {
      delay = distance * 0.5;
    }
    
    return { level, delay };
  }

  // Get real-time route analysis
  async getRouteAnalysis(
    agentLat: number, 
    agentLng: number, 
    customerLat: number, 
    customerLng: number,
    orderId: string
  ): Promise<RouteAnalysis> {
    const cacheKey = `${orderId}-${agentLat.toFixed(4)}-${agentLng.toFixed(4)}`;
    
    // Check cache (valid for 30 seconds)
    const cached = this.routeCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Calculate real distance
    const distance = this.calculateDistance(agentLat, agentLng, customerLat, customerLng);
    
    // Calculate traffic
    const traffic = this.calculateTraffic(distance);
    
    // Calculate duration (base speed 30 km/h + traffic delay)
    const baseTime = (distance / 30) * 60; // minutes
    const duration = baseTime + traffic.delay;
    
    // Calculate estimated arrival
    const arrivalTime = new Date();
    arrivalTime.setMinutes(arrivalTime.getMinutes() + duration);
    
    // Generate route points
    const route = this.generateRoutePoints(agentLat, agentLng, customerLat, customerLng);
    
    // Calculate efficiency (based on direct distance vs route distance)
    const routeDistance = route.reduce((total, point, index) => {
      if (index === 0) return 0;
      const prev = route[index - 1];
      return total + this.calculateDistance(prev.lat, prev.lng, point.lat, point.lng);
    }, 0);
    
    const efficiency = Math.max(60, Math.min(95, (distance / routeDistance) * 100));
    
    // Calculate fuel consumption (L/100km for motorcycle: ~3L)
    const fuelConsumption = (distance * 3) / 100;
    
    // Calculate carbon footprint (kg CO2 per liter of fuel: ~2.3kg)
    const carbonFootprint = fuelConsumption * 2.3;
    
    const analysis: RouteAnalysis = {
      distance,
      duration,
      estimatedArrival: arrivalTime.toLocaleTimeString('en-IN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      traffic,
      route,
      efficiency,
      fuelConsumption,
      carbonFootprint
    };
    
    // Cache for 30 seconds
    this.routeCache.set(cacheKey, analysis);
    setTimeout(() => this.routeCache.delete(cacheKey), 30000);
    
    return analysis;
  }

  // Start real-time updates
  startRealTimeUpdates(
    orderId: string,
    getAgentLocation: () => { lat: number, lng: number },
    getCustomerLocation: () => { lat: number, lng: number },
    onUpdate: (analysis: RouteAnalysis) => void
  ): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    this.updateInterval = setInterval(async () => {
      try {
        const agentLoc = getAgentLocation();
        const customerLoc = getCustomerLocation();
        
        if (agentLoc && customerLoc) {
          const analysis = await this.getRouteAnalysis(
            agentLoc.lat,
            agentLoc.lng,
            customerLoc.lat,
            customerLoc.lng,
            orderId
          );
          onUpdate(analysis);
        }
      } catch (error) {
        console.error('Route analysis update failed:', error);
      }
    }, 5000); // Update every 5 seconds
  }

  // Stop real-time updates
  stopRealTimeUpdates(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  // Get route optimization suggestions
  getOptimizationSuggestions(analysis: RouteAnalysis): string[] {
    const suggestions = [];
    
    if (analysis.traffic.level === 'heavy') {
      suggestions.push('🚦 Heavy traffic detected - Consider alternate route');
    }
    
    if (analysis.efficiency < 75) {
      suggestions.push('📍 Route efficiency low - GPS recalculation recommended');
    }
    
    if (analysis.distance > 10) {
      suggestions.push('⛽ Long distance - Monitor fuel levels');
    }
    
    const hour = new Date().getHours();
    if (hour >= 20 || hour <= 6) {
      suggestions.push('🌙 Night delivery - Extra safety precautions');
    }
    
    return suggestions;
  }
}

export const realTimeRouteAnalysis = RealTimeRouteAnalysisService.getInstance();