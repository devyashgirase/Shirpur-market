import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminSessionCheck = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAdminAccess = () => {
      // Simple check - if user came from admin login, allow access
      const isAdminLoggedIn = localStorage.getItem('isAdminLoggedIn');
      const adminPhone = localStorage.getItem('adminPhone');
      
      if (isAdminLoggedIn === 'true' && adminPhone === '7276035433') {
        console.log('✅ Admin access granted');
        setIsAuthorized(true);
        return;
      }
      
      console.log('❌ No admin access');
      navigate('/', { replace: true });
    };

    checkAdminAccess();
  }, [navigate]);

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AdminSessionCheck;