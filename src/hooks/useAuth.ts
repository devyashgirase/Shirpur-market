import { useState, useEffect } from 'react';
import { authService } from '@/lib/authService';

export interface UserSession {
  id: number;
  phone: string;
  name?: string;
  role: 'customer' | 'admin' | 'delivery';
  isFirstLoginComplete: boolean;
  loginTime: string;
}

export const useAuth = () => {
  const [session, setSession] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const currentSession = authService.getCurrentSession();
    setSession(currentSession);
    setIsLoading(false);
  }, []);

  const logout = () => {
    authService.clearSession();
    setSession(null);
  };

  const updateSession = (newSession: UserSession) => {
    setSession(newSession);
    authService.storeSession({
      id: newSession.id,
      phone: newSession.phone,
      name: newSession.name,
      role: newSession.role,
      is_first_login_complete: newSession.isFirstLoginComplete
    });
  };

  return {
    session,
    isLoggedIn: !!session,
    isLoading,
    logout,
    updateSession
  };
};