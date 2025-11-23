interface User {
  id: string;
  name: string;
  phone: string;
  role: 'customer' | 'admin' | 'delivery';
}

interface SessionData {
  user: User;
  token: string;
  expiry: number;
  isLoggedIn: boolean;
}

class SessionManager {
  private currentSession: SessionData | null = null;
  private readonly SESSION_KEY = 'userSession';
  private readonly TOKEN_EXPIRY_HOURS = 720; // 30 days

  constructor() {
    this.loadSession();
    this.validateSession();
  }

  private loadSession() {
    const stored = localStorage.getItem(this.SESSION_KEY);
    if (stored) {
      try {
        this.currentSession = JSON.parse(stored);
      } catch (error) {
        console.error('Failed to parse session:', error);
        this.clearSession();
      }
    }
  }

  private saveSession() {
    if (this.currentSession) {
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(this.currentSession));
      localStorage.setItem('customerPhone', this.currentSession.user.phone);
      localStorage.setItem('isLoggedIn', 'true');
      
      // Set role-specific flags
      if (this.currentSession.user.role === 'customer') {
        localStorage.setItem('isCustomerLoggedIn', 'true');
      } else if (this.currentSession.user.role === 'admin') {
        localStorage.setItem('isAdminLoggedIn', 'true');
        localStorage.setItem('adminPhone', this.currentSession.user.phone);
      }
    }
  }

  private clearSession() {
    this.currentSession = null;
    localStorage.removeItem(this.SESSION_KEY);
    localStorage.removeItem('customerPhone');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('isCustomerLoggedIn');
    localStorage.removeItem('isAdminLoggedIn');
    localStorage.removeItem('adminPhone');
  }

  private generateToken(): string {
    return `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getTokenExpiry(): number {
    return Date.now() + (this.TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);
  }

  validateSession(): boolean {
    if (!this.currentSession) return false;

    if (Date.now() > this.currentSession.expiry) {
      console.log('Session expired');
      this.clearSession();
      return false;
    }

    return true;
  }

  createSession(user: User): void {
    this.currentSession = {
      user,
      token: this.generateToken(),
      expiry: this.getTokenExpiry(),
      isLoggedIn: true
    };
    this.saveSession();
  }

  destroySession(): void {
    this.clearSession();
  }

  getCurrentUser(): User | null {
    if (!this.validateSession()) return null;
    return this.currentSession?.user || null;
  }

  getToken(): string | null {
    if (!this.validateSession()) return null;
    return this.currentSession?.token || null;
  }

  isLoggedIn(): boolean {
    return this.validateSession() && this.currentSession?.isLoggedIn === true;
  }

  refreshToken(): boolean {
    if (!this.validateSession()) return false;
    
    if (this.currentSession) {
      this.currentSession.token = this.generateToken();
      this.currentSession.expiry = this.getTokenExpiry();
      this.saveSession();
      return true;
    }
    return false;
  }
}

export const sessionManager = new SessionManager();