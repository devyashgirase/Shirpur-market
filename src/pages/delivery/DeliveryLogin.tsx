import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Truck, User, Lock } from 'lucide-react';
import { deliveryAuthService } from '@/lib/deliveryAuthService';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

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
      const success = await deliveryAuthService.login(userId, password);
      
      if (success) {
        toast({
          title: "Login Successful",
          description: "Welcome to delivery dashboard",
        });
        navigate('/delivery');
      } else {
        toast({
          title: "Login Failed",
          description: "Invalid credentials. Please check your User ID and password.",
          variant: "destructive"
        });
      }
    } catch (error) {
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
    <div className="min-h-screen relative flex items-center justify-center p-4 bg-gradient-to-br from-blue-600 via-blue-500 to-green-500">
      
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-32 h-32 bg-white rounded-full animate-pulse"></div>
        <div className="absolute bottom-32 right-16 w-24 h-24 bg-white rounded-full animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white rounded-full animate-pulse delay-500"></div>
      </div>

      {/* Delivery Agent Illustration */}
      <div className="absolute top-10 left-10 opacity-20">
        <svg width="120" height="120" viewBox="0 0 120 120" className="text-white">
          <circle cx="60" cy="40" r="20" fill="currentColor" />
          <rect x="45" y="55" width="30" height="40" rx="5" fill="currentColor" />
          <rect x="35" y="65" width="50" height="15" rx="3" fill="currentColor" />
          <text x="60" y="110" textAnchor="middle" className="text-xs font-bold" fill="currentColor">SHIRPUR</text>
          <text x="60" y="118" textAnchor="middle" className="text-xs" fill="currentColor">DELIVERY</text>
        </svg>
      </div>

      {/* Delivery Truck with Logo */}
      <div className="absolute bottom-20 right-20 opacity-30">
        <svg width="150" height="100" viewBox="0 0 150 100" className="text-white">
          <rect x="20" y="40" width="60" height="35" rx="5" fill="currentColor" />
          <rect x="80" y="45" width="30" height="30" rx="3" fill="currentColor" />
          <circle cx="40" cy="85" r="10" fill="currentColor" />
          <circle cx="90" cy="85" r="10" fill="currentColor" />
          <text x="50" y="58" textAnchor="middle" className="text-xs font-bold" fill="#3B82F6">SD</text>
          <rect x="25" y="20" width="50" height="15" rx="2" fill="#3B82F6" />
          <text x="50" y="30" textAnchor="middle" className="text-xs font-bold" fill="white">SHIRPUR DELIVERY</text>
        </svg>
      </div>

      {/* Login Card */}
      <Card className="w-full max-w-md relative z-10 bg-white/95 backdrop-blur-sm shadow-2xl">
        <CardHeader className="text-center">
          {/* Shirpur Delivery Logo */}
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center mb-4 shadow-lg">
            <div className="text-center">
              <Truck className="w-8 h-8 text-white mx-auto mb-1" />
              <div className="text-xs font-bold text-white leading-none">SD</div>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800">Shirpur Delivery Agent</CardTitle>
          <p className="text-gray-600">Enter your credentials to access delivery dashboard</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Agent ID</label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Enter your agent ID"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login to Shirpur Delivery'}
            </Button>
          </form>
          
          <div className="mt-4 space-y-3">
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800 text-center font-medium">
                <strong>Demo Agent Credentials:</strong>
              </p>
              <p className="text-sm text-green-700 text-center font-mono">
                Agent ID: DA123456
              </p>
              <p className="text-sm text-green-700 text-center font-mono">
                Password: delivery123
              </p>
            </div>
            <div className="text-center text-xs text-gray-600">
              <p>🚚 Shirpur Delivery System</p>
              <p>Only registered agents can access</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeliveryLogin;