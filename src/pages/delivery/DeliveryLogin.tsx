import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Truck, User, Lock } from 'lucide-react';
import { deliveryAuthService } from '@/lib/deliveryAuthService';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import YashBranding from '@/components/YashBranding';

const DeliveryLogin = () => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('🔐 Attempting login with:', { userId, password });
      const success = await deliveryAuthService.login(userId, password);
      
      if (success) {
        toast({
          title: "Login Successful",
          description: "Welcome to delivery dashboard",
        });
        navigate('/delivery');
      } else {
        console.log('❌ Login failed for:', { userId, password });
        toast({
          title: "Login Failed",
          description: `Invalid credentials. User ID: ${userId}. Please check your credentials from WhatsApp.`,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      toast({
        title: "Error",
        description: "Login failed. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 via-orange-500 to-red-500 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-xl"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-yellow-300 rounded-full blur-lg"></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-red-300 rounded-full blur-2xl"></div>
      </div>

      <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
        <Card className="w-full max-w-md bg-white shadow-2xl border-0">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mb-4 shadow-lg">
            <Truck className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800">Delivery Partner Login</CardTitle>
          <p className="text-gray-600">Enter your credentials to start delivering</p>
        </CardHeader>
        <CardContent className="pt-0">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Agent ID</label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Enter your agent ID"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="pl-10 h-12 border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-12 border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                  required
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold rounded-lg shadow-lg"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login to Dashboard'}
            </Button>
          </form>
          
          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
            <p className="text-sm font-semibold text-orange-800 mb-3">🚚 Demo Credentials:</p>
            <div className="text-sm text-orange-700 space-y-1 mb-3">
              <p><strong>Agent ID:</strong> DA123456</p>
              <p><strong>Password:</strong> delivery123</p>
            </div>
            <button 
              type="button"
              onClick={() => {
                setUserId('DA123456');
                setPassword('delivery123');
              }}
              className="w-full text-sm bg-orange-500 text-white px-3 py-2 rounded-lg hover:bg-orange-600 transition-colors"
            >
              Use Demo Credentials
            </button>
          </div>

        </CardContent>
      </Card>
      
      {/* YASH Technologies Branding */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20">
        <YashBranding variant="compact" className="text-white/80" />
      </div>
      </div>
    </div>
  );
};

export default DeliveryLogin;