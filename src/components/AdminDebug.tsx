import { Button } from "@/components/ui/button";

const AdminDebug = () => {
  const checkSession = () => {
    const adminSession = localStorage.getItem('adminSession');
    const customerSession = localStorage.getItem('customerSession');
    
    console.log('🔍 Admin Session:', adminSession);
    console.log('🔍 Customer Session:', customerSession);
    
    if (adminSession) {
      try {
        const data = JSON.parse(adminSession);
        console.log('📋 Admin Data:', data);
        alert(`Admin Session Found:\nPhone: ${data.phone}\nRole: ${data.role}\nName: ${data.name}`);
      } catch (e) {
        alert('Invalid admin session data');
      }
    } else {
      alert('No admin session found');
    }
  };

  const clearSessions = () => {
    localStorage.removeItem('adminSession');
    localStorage.removeItem('customerSession');
    alert('All sessions cleared');
  };

  const createAdminSession = () => {
    const adminSessionData = {
      phone: '7276035433',
      role: 'admin',
      name: 'Admin',
      loginTime: new Date().toISOString()
    };
    localStorage.setItem('adminSession', JSON.stringify(adminSessionData));
    console.log('✅ Manual admin session created:', adminSessionData);
    alert('Admin session created manually');
  };

  return (
    <div className="fixed bottom-4 right-4 space-y-2 z-50">
      <Button onClick={checkSession} variant="outline" size="sm">
        🔍 Check Session
      </Button>
      <Button onClick={clearSessions} variant="destructive" size="sm">
        🗑️ Clear Sessions
      </Button>
      <Button onClick={createAdminSession} variant="default" size="sm">
        👑 Create Admin Session
      </Button>
    </div>
  );
};

export default AdminDebug;