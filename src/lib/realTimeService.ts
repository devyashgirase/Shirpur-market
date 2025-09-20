import * as signalR from '@microsoft/signalr';

class RealTimeService {
  private connection: signalR.HubConnection | null = null;
  private listeners: Map<string, Function[]> = new Map();
  private currentUserType: string | null = null;

  async connect(userType: 'admin' | 'delivery' | 'customer', userId?: string) {
    if (this.connection) return;

    this.currentUserType = userType;
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl('http://localhost:5000/notificationHub')
      .build();

    await this.connection.start();
    await this.connection.invoke('JoinGroup', userType, userId);

    // Role-specific notification handlers
    if (userType === 'admin') {
      this.connection.on('AdminNotification', (notification) => {
        this.notifyListeners('AdminNotification', notification);
      });
    } else if (userType === 'delivery') {
      this.connection.on('DeliveryNotification', (notification) => {
        this.notifyListeners('DeliveryNotification', notification);
      });
    } else if (userType === 'customer') {
      this.connection.on('CustomerNotification', (notification) => {
        this.notifyListeners('CustomerNotification', notification);
      });
    }
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
    if (this.connection) {
      this.connection.stop();
      this.connection = null;
    }
  }
}

export const realTimeService = new RealTimeService();