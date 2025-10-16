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
    <div className="min-h-screen relative flex items-center justify-center p-4 bg-gradient-to-br from-blue-600 via-blue-500 to-green-500 overflow-hidden">
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        {/* Moving Circles */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full animate-bounce"></div>
        <div className="absolute bottom-32 right-16 w-24 h-24 bg-white/15 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white/20 rounded-full animate-ping delay-500"></div>
        
        {/* Floating Packages */}
        <div className="absolute top-40 right-32 animate-bounce delay-700">
          <div className="w-12 h-12 bg-orange-400/30 rounded transform rotate-12 animate-pulse"></div>
        </div>
        <div className="absolute bottom-40 left-32 animate-bounce delay-300">
          <div className="w-10 h-10 bg-green-400/30 rounded transform -rotate-12 animate-pulse"></div>
        </div>
        
        {/* Moving Delivery Routes */}
        <svg className="absolute inset-0 w-full h-full">
          <path 
            d="M0 200 Q200 100 400 300 T800 200" 
            stroke="rgba(255,255,255,0.1)" 
            strokeWidth="3" 
            fill="none" 
            strokeDasharray="20,10"
            className="animate-pulse"
          />
          <path 
            d="M100 400 Q300 300 600 500 T1000 400" 
            stroke="rgba(255,255,255,0.08)" 
            strokeWidth="2" 
            fill="none" 
            strokeDasharray="15,8"
            className="animate-pulse delay-1000"
          />
        </svg>
      </div>

      {/* Animated Delivery Agent */}
      <div className="absolute top-10 left-10 opacity-30 animate-bounce">
        <svg width="120" height="120" viewBox="0 0 120 120" className="text-white">
          <circle cx="60" cy="40" r="20" fill="currentColor" className="animate-pulse" />
          <rect x="45" y="55" width="30" height="40" rx="5" fill="currentColor" />
          <rect x="35" y="65" width="50" height="15" rx="3" fill="currentColor" className="animate-pulse delay-500" />
          <text x="60" y="110" textAnchor="middle" className="text-xs font-bold animate-pulse" fill="currentColor">SHIRPUR</text>
          <text x="60" y="118" textAnchor="middle" className="text-xs animate-pulse delay-300" fill="currentColor">DELIVERY</text>
        </svg>
      </div>

      {/* Animated Delivery Truck */}
      <div className="absolute bottom-20 right-20 opacity-40 animate-bounce delay-500">
        <svg width="150" height="100" viewBox="0 0 150 100" className="text-white">
          <rect x="20" y="40" width="60" height="35" rx="5" fill="currentColor" className="animate-pulse" />
          <rect x="80" y="45" width="30" height="30" rx="3" fill="currentColor" className="animate-pulse delay-300" />
          <circle cx="40" cy="85" r="10" fill="currentColor" className="animate-spin" />
          <circle cx="90" cy="85" r="10" fill="currentColor" className="animate-spin delay-200" />
          <text x="50" y="58" textAnchor="middle" className="text-xs font-bold animate-pulse" fill="#3B82F6">SD</text>
          <rect x="25" y="20" width="50" height="15" rx="2" fill="#3B82F6" className="animate-pulse delay-700" />
          <text x="50" y="30" textAnchor="middle" className="text-xs font-bold animate-pulse delay-1000" fill="white">SHIRPUR DELIVERY</text>
        </svg>
      </div>

      {/* Floating Location Pins */}
      <div className="absolute top-1/3 right-1/3 animate-bounce delay-200 opacity-25">
        <svg width="40" height="50" viewBox="0 0 40 50" className="text-red-400">
          <path d="M20 0C9 0 0 9 0 20c0 20 20 30 20 30s20-10 20-30C40 9 31 0 20 0zm0 25c-2.8 0-5-2.2-5-5s2.2-5 5-5 5 2.2 5 5-2.2 5-5 5z" fill="currentColor" className="animate-pulse"/>
        </svg>
      </div>

      <div className="absolute bottom-1/3 left-1/3 animate-bounce delay-800 opacity-20">
        <svg width="35" height="45" viewBox="0 0 35 45" className="text-purple-400">
          <path d="M17.5 0C7.8 0 0 7.8 0 17.5c0 17.5 17.5 27.5 17.5 27.5s17.5-10 17.5-27.5C35 7.8 27.2 0 17.5 0zm0 22.5c-2.8 0-5-2.2-5-5s2.2-5 5-5 5 2.2 5 5-2.2 5-5 5z" fill="currentColor" className="animate-pulse delay-500"/>
        </svg>
      </div>

      {/* Login Card with Entrance Animation */}
      <Card className="w-full max-w-md relative z-10 bg-white/95 backdrop-blur-sm shadow-2xl animate-fade-in-up">
        <CardHeader className="text-center">
          {/* Animated Shirpur Delivery Logo */}
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center mb-4 shadow-lg animate-pulse">
            <div className="text-center">
              <Truck className="w-8 h-8 text-white mx-auto mb-1 animate-bounce" />
              <div className="text-xs font-bold text-white leading-none animate-pulse delay-300">SD</div>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800 animate-fade-in">Shirpur Delivery Agent</CardTitle>
          <p className="text-gray-600 animate-fade-in delay-200">Enter your credentials to access delivery dashboard</p>
        </CardHeader>
        <CardContent className="animate-fade-in delay-300">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Agent ID</label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400 animate-pulse" />
                <Input
                  type="text"
                  placeholder="Enter your agent ID"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="pl-10 transition-all duration-300 focus:scale-105"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400 animate-pulse delay-200" />
                <Input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 transition-all duration-300 focus:scale-105"
                  required
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 transform transition-all duration-300 hover:scale-105 animate-pulse"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Logging in...
                </div>
              ) : (
                'Login to Shirpur Delivery'
              )}
            </Button>
          </form>
          
          <div className="mt-4 space-y-3 animate-fade-in delay-500">
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg animate-pulse">
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
            <div className="text-center text-xs text-gray-600 animate-fade-in delay-700">
              <p className="animate-pulse">🚚 Shirpur Delivery System</p>
              <p>Only registered agents can access</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out;
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-500 { animation-delay: 0.5s; }
        .delay-700 { animation-delay: 0.7s; }
      `}</style>
    </div>
  );
};

export default DeliveryLogin;