import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { User, Lock, Truck, Shield, ShoppingBag, UserCheck } from "lucide-react";
import { deliveryAuthService } from "@/lib/deliveryAuthService";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const credentials = {
    customer: { username: "customer", password: "customer123", route: "/customer" },
    admin: { username: "admin", password: "admin123", route: "/admin" },
    delivery: { username: "delivery", password: "delivery123", route: "/delivery" }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Check if it's a delivery agent login (starts with DA)
      if (username.startsWith('DA')) {
        const success = await deliveryAuthService.login(username, password);
        
        if (success) {
          localStorage.setItem('userRole', 'delivery');
          localStorage.setItem('isLoggedIn', 'true');
          
          toast({
            title: "Login Successful!",
            description: "Welcome to delivery dashboard!",
          });
          
          setTimeout(() => {
            navigate('/delivery');
          }, 1000);
        } else {
          toast({
            title: "Login Failed",
            description: "Invalid delivery agent credentials or account not approved",
            variant: "destructive"
          });
        }
      } else {
        // Check demo credentials
        const userType = Object.entries(credentials).find(([_, cred]) => 
          cred.username === username && cred.password === password
        );

        if (userType) {
          const [role, cred] = userType;
          
          localStorage.setItem('userRole', role);
          localStorage.setItem('isLoggedIn', 'true');
          
          toast({
            title: "Login Successful!",
            description: `Welcome ${role}!`,
          });
          
          setTimeout(() => {
            navigate(cred.route);
          }, 1000);
        } else {
          toast({
            title: "Login Failed",
            description: "Invalid username or password",
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Login failed. Please try again.",
        variant: "destructive"
      });
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4 safe-area-top safe-area-bottom">
      <div className="w-full max-w-sm sm:max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg">
            <span className="text-2xl sm:text-3xl font-bold text-white">S</span>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-2">Shirpur Delivery</h1>
          <p className="text-sm sm:text-base text-gray-600">Sign in to your account</p>
        </div>

        {/* Login Card */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-4 sm:pb-6">
            <CardTitle className="text-xl sm:text-2xl text-center font-semibold">Welcome Back</CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium">Username / User ID</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter username or DA123456"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10 h-11 sm:h-12 text-base"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-11 sm:h-12 text-base"
                    required
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-11 sm:h-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium btn-mobile"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Demo Credentials */}
        <div className="mt-6 sm:mt-8 space-y-3 sm:space-y-4">
          <p className="text-center text-xs sm:text-sm text-gray-600 font-medium">Login Options:</p>
          
          <div className="grid gap-2 sm:gap-3">
            <Card className="p-3 sm:p-4 bg-blue-50 border-blue-200 hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-3">
                <ShoppingBag className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm sm:text-base font-medium text-blue-800">Customer</p>
                  <p className="text-xs sm:text-sm text-blue-600 font-mono">customer / customer123</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-3 sm:p-4 bg-purple-50 border-purple-200 hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5 text-purple-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm sm:text-base font-medium text-purple-800">Admin</p>
                  <p className="text-xs sm:text-sm text-purple-600 font-mono">admin / admin123</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-3 sm:p-4 bg-green-50 border-green-200 hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-3">
                <Truck className="w-5 h-5 text-green-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm sm:text-base font-medium text-green-800">Delivery (Demo)</p>
                  <p className="text-xs sm:text-sm text-green-600 font-mono">delivery / delivery123</p>
                </div>
              </div>
            </Card>

            <Card className="p-3 sm:p-4 bg-orange-50 border-orange-200 hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-3">
                <UserCheck className="w-5 h-5 text-orange-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm sm:text-base font-medium text-orange-800">Delivery Agent</p>
                  <p className="text-xs sm:text-sm text-orange-600 font-mono">Use DA123456 format + SMS password</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;