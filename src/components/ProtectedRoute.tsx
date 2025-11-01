import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "@/lib/authService";
import { deliveryAuthService } from "@/lib/deliveryAuthService";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      
      // Check for delivery agent authentication
      if (allowedRoles.includes('delivery')) {
        const isDeliveryAuthenticated = await deliveryAuthService.isAuthenticated();
        
        if (isDeliveryAuthenticated) {
          setIsAuthorized(true);
          setIsLoading(false);
          return;
        }
      }
      
      // Check for regular OTP authentication
      const session = authService.getCurrentSession();
      
      if (!session || !authService.isLoggedIn()) {
        navigate('/', { replace: true });
        setIsLoading(false);
        return;
      }

      if (!allowedRoles.includes(session.role)) {
        navigate('/', { replace: true });
        setIsLoading(false);
        return;
      }

      if (!session.isFirstLoginComplete) {
        navigate('/', { replace: true });
        setIsLoading(false);
        return;
      }
      
      setIsAuthorized(true);
      setIsLoading(false);
    };
    
    checkAuth();
  }, [navigate, allowedRoles]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;