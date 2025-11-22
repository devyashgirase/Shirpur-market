import { sessionManager } from './sessionManager';

export interface User {
  id: string;
  phone: string;
  name?: string;
  role: 'customer' | 'admin' | 'delivery';
  is_first_login_complete?: boolean;
  last_login?: string;
}

class AuthService {
  private users: User[] = [];

  constructor() {
    this.loadUsers();
  }

  private loadUsers() {
    const stored = localStorage.getItem('users');
    if (stored) {
      this.users = JSON.parse(stored);
    } else {
      this.users = [
        { id: '1', name: 'Admin User', phone: '1234567890', role: 'admin' },
        { id: '2', name: 'Customer User', phone: '9876543210', role: 'customer' },
        { id: '3', name: 'Delivery Agent', phone: '5555555555', role: 'delivery' }
      ];
      this.saveUsers();
    }
  }

  private saveUsers() {
    localStorage.setItem('users', JSON.stringify(this.users));
  }

  async login(phone: string, password: string): Promise<boolean> {
    const user = this.users.find(u => u.phone === phone);
    if (user && password === '123456') {
      sessionManager.createSession(user);
      return true;
    }
    return false;
  }

  async register(name: string, phone: string, password: string, role: 'customer' | 'admin' | 'delivery' = 'customer'): Promise<boolean> {
    if (this.users.find(u => u.phone === phone)) {
      return false;
    }

    const newUser: User = {
      id: Date.now().toString(),
      name,
      phone,
      role
    };

    this.users.push(newUser);
    this.saveUsers();
    
    sessionManager.createSession(newUser);
    return true;
  }

  logout() {
    const currentUser = this.getCurrentUser();
    sessionManager.destroySession();
    
    // Clear simple session flags
    if (currentUser?.role === 'admin') {
      localStorage.removeItem('isAdminLoggedIn');
      localStorage.removeItem('adminPhone');
    } else if (currentUser?.role === 'customer') {
      localStorage.removeItem('isCustomerLoggedIn');
      localStorage.removeItem('customerPhone');
    }
  }

  getCurrentUser(): User | null {
    return sessionManager.getCurrentUser();
  }

  isLoggedIn(): boolean {
    return sessionManager.isLoggedIn();
  }

  hasRole(role: 'customer' | 'admin' | 'delivery'): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }

  getToken(): string | null {
    return sessionManager.getToken();
  }

  refreshSession(): boolean {
    return sessionManager.refreshToken();
  }

  // Get user by phone (needed for main login compatibility)
  async getUserByPhone(phone: string): Promise<any> {
    return this.users.find(u => u.phone === phone) || null;
  }

  // Save user (needed for main login compatibility)
  saveUser(user: any) {
    const existingIndex = this.users.findIndex(u => u.phone === user.phone);
    if (existingIndex >= 0) {
      this.users[existingIndex] = user;
    } else {
      this.users.push(user);
    }
    this.saveUsers();
  }

  // Store session (needed for main login compatibility)
  storeSession(user: any) {
    sessionManager.createSession(user);
  }

  // Complete first login (needed for main login compatibility)
  async completeFirstLogin(userId: any, name: string, role: string): Promise<{success: boolean, message: string}> {
    try {
      const user = this.users.find(u => u.id == userId);
      if (user) {
        user.name = name;
        user.role = role;
        user.is_first_login_complete = true;
        this.saveUsers();
        return { success: true, message: 'Profile completed successfully' };
      }
      return { success: false, message: 'User not found' };
    } catch (error) {
      return { success: false, message: 'Failed to complete setup' };
    }
  }

  // Get current session (needed for ProtectedRoute compatibility)
  getCurrentSession(): any {
    const user = this.getCurrentUser();
    if (user) {
      return {
        role: user.role,
        isFirstLoginComplete: user.is_first_login_complete !== false,
        phone: user.phone,
        name: user.name
      };
    }
    return null;
  }
}

export const authService = new AuthService();
export type { User as AuthUser };