import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "@/lib/authService";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const navigate = useNavigate();

  useEffect(() => {
    const session = authService.getCurrentSession();
    
    if (!session || !authService.isLoggedIn()) {
      navigate('/');
      return;
    }

    if (!allowedRoles.includes(session.role)) {
      navigate('/');
      return;
    }

    if (!session.isFirstLoginComplete) {
      navigate('/');
      return;
    }
  }, [navigate, allowedRoles]);

  const session = authService.getCurrentSession();
  
  if (!session || !authService.isLoggedIn() || !allowedRoles.includes(session.role) || !session.isFirstLoginComplete) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;