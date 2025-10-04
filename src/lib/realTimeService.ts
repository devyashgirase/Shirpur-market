// Mock SignalR service for deployment
class RealTimeService {
  private listeners: Map<string, Function[]> = new Map();
  private currentUserType: string | null = null;

  async connect(userType: 'admin' | 'delivery' | 'customer', userId?: string) {
    this.currentUserType = userType;
    console.log(`Mock connection established for ${userType}`);
    return Promise.resolve();
  }

  subscribe(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  getUserType() {
    return this.currentUserType;
  }

  private notifyListeners(event: string, data: any) {
    const callbacks = this.listeners.get(event) || [];
    callbacks.forEach(callback => callback(data));
  }

  disconnect() {
    console.log('Mock disconnection');
  }
}

export const realTimeService = new RealTimeService();