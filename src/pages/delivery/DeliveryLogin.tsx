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
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-green-600 relative flex items-center justify-center p-4">
      
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/60"></div>

      {/* Login Card */}
      <Card className="w-full max-w-md relative z-10 bg-white/95 backdrop-blur-sm shadow-2xl">
        <CardHeader className="text-center">
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
          

        </CardContent>
      </Card>
    </div>
  );
};

export default DeliveryLogin;