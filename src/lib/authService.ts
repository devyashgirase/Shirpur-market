// Auth service using only localStorage - no external dependencies

export interface User {
  id: number;
  phone: string;
  name?: string;
  role: 'customer' | 'admin' | 'delivery';
  is_first_login_complete: boolean;
  last_login?: string;
}

export interface OTPVerification {
  id: number;
  phone: string;
  otp: string;
  expires_at: string;
  attempts: number;
  is_verified: boolean;
}

class AuthService {
  private readonly OTP_EXPIRY_MINUTES = 5;
  private readonly MAX_OTP_ATTEMPTS = 3;

  // Get current user from session
  getCurrentUser(): User | null {
    try {
      const session = this.getCurrentSession();
      if (!session) return null;
      
      return {
        id: session.id,
        phone: session.phone,
        name: session.name,
        role: session.role,
        is_first_login_complete: session.isFirstLoginComplete || false,
        last_login: session.loginTime
      };
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  // Generate 6-digit OTP
  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Send OTP via SMS (mock implementation)
  private async sendSMS(phone: string, otp: string): Promise<boolean> {
    try {
      // Mock SMS service - replace with actual SMS provider
      console.log(`SMS sent to ${phone}: Your OTP is ${otp}`);
      
      // For demo purposes, show OTP in console
      alert(`Demo OTP for ${phone}: ${otp}`);
      
      return true;
    } catch (error) {
      console.error('SMS sending failed:', error);
      return false;
    }
  }

  // Send OTP to phone number
  async sendOTP(phone: string): Promise<{ success: boolean; message: string }> {
    try {
      const otp = this.generateOTP();
      const expiresAt = new Date(Date.now() + this.OTP_EXPIRY_MINUTES * 60 * 1000);

      // Store OTP in localStorage for demo (replace with API call for production)
      const otpData = {
        phone,
        otp,
        expires_at: expiresAt.toISOString(),
        attempts: 0,
        is_verified: false,
        created_at: new Date().toISOString()
      };
      
      localStorage.setItem(`otp_${phone}`, JSON.stringify(otpData));

      // Send SMS
      const smsSent = await this.sendSMS(phone, otp);
      
      if (!smsSent) {
        return {
          success: false,
          message: 'Failed to send OTP. Please try again.'
        };
      }

      return {
        success: true,
        message: 'OTP sent successfully'
      };
    } catch (error) {
      console.error('Send OTP error:', error);
      return {
        success: false,
        message: 'Failed to send OTP'
      };
    }
  }

  // Verify OTP
  async verifyOTP(phone: string, otp: string): Promise<{ success: boolean; message: string; user?: User }> {
    try {
      // Get OTP from localStorage
      const otpDataStr = localStorage.getItem(`otp_${phone}`);
      if (!otpDataStr) {
        return {
          success: false,
          message: 'No OTP found for this phone number'
        };
      }

      const otpData = JSON.parse(otpDataStr);
      
      // Check if OTP is expired
      if (new Date() > new Date(otpData.expires_at)) {
        localStorage.removeItem(`otp_${phone}`);
        return {
          success: false,
          message: 'OTP has expired'
        };
      }

      // Check if OTP matches
      if (otpData.otp !== otp) {
        otpData.attempts = (otpData.attempts || 0) + 1;
        if (otpData.attempts >= this.MAX_OTP_ATTEMPTS) {
          localStorage.removeItem(`otp_${phone}`);
          return {
            success: false,
            message: 'Too many attempts. Please request a new OTP.'
          };
        }
        localStorage.setItem(`otp_${phone}`, JSON.stringify(otpData));
        return {
          success: false,
          message: 'Invalid OTP'
        };
      }

      // Mark OTP as verified and remove from storage
      localStorage.removeItem(`otp_${phone}`);

      // Check if user exists in localStorage
      let user = this.getUserFromStorage(phone);

      // If user doesn't exist, create new user
      if (!user) {
        user = {
          id: Date.now(),
          phone,
          role: 'customer',
          is_first_login_complete: false
        };
        this.saveUserToStorage(user);
      }

      // Update last login
      user.last_login = new Date().toISOString();
      this.saveUserToStorage(user);

      return {
        success: true,
        message: 'OTP verified successfully',
        user
      };
    } catch (error) {
      console.error('Verify OTP error:', error);
      return {
        success: false,
        message: 'OTP verification failed'
      };
    }
  }

  // Complete first-time login setup
  async completeFirstLogin(userId: number, name: string, role?: 'customer' | 'admin' | 'delivery'): Promise<{ success: boolean; message: string }> {
    try {
      const users = this.getAllUsersFromStorage();
      const userIndex = users.findIndex(u => u.id === userId);
      
      if (userIndex === -1) {
        return {
          success: false,
          message: 'User not found'
        };
      }

      users[userIndex].name = name;
      users[userIndex].is_first_login_complete = true;
      if (role) {
        users[userIndex].role = role;
      }

      localStorage.setItem('users', JSON.stringify(users));

      return {
        success: true,
        message: 'Profile setup completed'
      };
    } catch (error) {
      console.error('Complete first login error:', error);
      return {
        success: false,
        message: 'Failed to complete setup'
      };
    }
  }

  // Get user by phone
  async getUserByPhone(phone: string): Promise<User | null> {
    try {
      return this.getUserFromStorage(phone);
    } catch (error) {
      console.error('Get user error:', error);
      return null;
    }
  }

  // Check if user has completed first login
  async hasCompletedFirstLogin(phone: string): Promise<boolean> {
    const user = await this.getUserByPhone(phone);
    return user?.is_first_login_complete || false;
  }

  // Store session
  storeSession(user: User): void {
    localStorage.setItem('userSession', JSON.stringify({
      id: user.id,
      phone: user.phone,
      name: user.name,
      role: user.role,
      isFirstLoginComplete: user.is_first_login_complete,
      loginTime: new Date().toISOString()
    }));
  }

  // Get current session
  getCurrentSession(): any {
    const session = localStorage.getItem('userSession');
    return session ? JSON.parse(session) : null;
  }

  // Clear session
  clearSession(): void {
    localStorage.removeItem('userSession');
  }

  // Check if user is logged in
  isLoggedIn(): boolean {
    const session = this.getCurrentSession();
    return !!session;
  }

  // Save user (public method)
  saveUser(user: User): void {
    this.saveUserToStorage(user);
  }

  // Helper methods for localStorage user management
  private getUserFromStorage(phone: string): User | null {
    const users = this.getAllUsersFromStorage();
    return users.find(u => u.phone === phone) || null;
  }

  private saveUserToStorage(user: User): void {
    const users = this.getAllUsersFromStorage();
    const existingIndex = users.findIndex(u => u.phone === user.phone);
    
    if (existingIndex >= 0) {
      users[existingIndex] = user;
    } else {
      users.push(user);
    }
    
    localStorage.setItem('users', JSON.stringify(users));
  }

  private getAllUsersFromStorage(): User[] {
    const usersStr = localStorage.getItem('users');
    return usersStr ? JSON.parse(usersStr) : [];
  }
}

export const authService = new AuthService();