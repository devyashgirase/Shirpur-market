import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Phone, Shield, Timer, User, ShoppingBag, Truck } from "lucide-react";
import { authService, User as AuthUser } from "@/lib/authService";

const OTPLogin = () => {
  const [step, setStep] = useState<'phone' | 'otp' | 'setup'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'customer' | 'admin' | 'delivery'>('customer');
  const [loading, setLoading] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  // Format phone number
  const formatPhone = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 10) {
      return cleaned;
    }
    return cleaned.slice(0, 10);
  };

  // Start OTP timer
  const startTimer = () => {
    setOtpTimer(300); // 5 minutes
    const interval = setInterval(() => {
      setOtpTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Send OTP
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length !== 10) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid 10-digit phone number",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    const result = await authService.sendOTP(phone);
    
    if (result.success) {
      setStep('otp');
      startTimer();
      toast({
        title: "OTP Sent",
        description: result.message,
      });
    } else {
      toast({
        title: "Failed to Send OTP",
        description: result.message,
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  // Verify OTP
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter the 6-digit OTP",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    const result = await authService.verifyOTP(phone, otp);
    
    if (result.success && result.user) {
      setCurrentUser(result.user);
      
      if (!result.user.is_first_login_complete) {
        setStep('setup');
        toast({
          title: "OTP Verified",
          description: "Please complete your profile setup",
        });
      } else {
        // Login successful
        authService.storeSession(result.user);
        
        // Show attractive welcome message
        const welcomeMessages = {
          customer: {
            title: '🎉 Welcome Back!',
            message: `Hello ${result.user.name || 'Valued Customer'}!\n\n🛒 Ready to explore fresh products?\n⚡ Fast delivery in 30 minutes!`,
            icon: '🛍️'
          },
          admin: {
            title: '👑 Admin Access Granted!',
            message: `Welcome ${result.user.name || 'Administrator'}!\n\n📊 Your dashboard awaits\n🚀 Manage your delivery empire!`,
            icon: '⚡'
          },
          delivery: {
            title: '🚚 Ready to Deliver!',
            message: `Hey ${result.user.name || 'Delivery Hero'}!\n\n📦 New orders are waiting\n💰 Start earning today!`,
            icon: '🎯'
          }
        };
        
        const welcome = welcomeMessages[result.user.role];
        
        // Sweet Alert welcome message
        setTimeout(() => {
          if (window.Swal) {
            window.Swal.fire({
              title: welcome.title,
              text: welcome.message,
              icon: 'success',
              iconHtml: welcome.icon,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: '#fff',
              confirmButtonColor: '#4F46E5',
              confirmButtonText: 'Let\'s Go! 🚀',
              showClass: {
                popup: 'animate__animated animate__bounceIn'
              },
              hideClass: {
                popup: 'animate__animated animate__fadeOut'
              },
              timer: 4000,
              timerProgressBar: true
            }).then(() => {
              // Navigate after alert
              const routes = {
                customer: '/customer',
                admin: '/admin',
                delivery: '/delivery'
              };
              navigate(routes[result.user.role]);
            });
          } else {
            // Fallback toast
            toast({
              title: welcome.title,
              description: welcome.message.replace(/\n/g, ' '),
            });
            
            setTimeout(() => {
              const routes = {
                customer: '/customer',
                admin: '/admin',
                delivery: '/delivery'
              };
              navigate(routes[result.user.role]);
            }, 2000);
          }
        }, 500);
      }
    } else {
      toast({
        title: "OTP Verification Failed",
        description: result.message,
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  // Complete setup
  const handleCompleteSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter your name",
        variant: "destructive"
      });
      return;
    }

    if (!currentUser) return;

    setLoading(true);
    const result = await authService.completeFirstLogin(currentUser.id, name, role);
    
    if (result.success) {
      // Update user session
      const updatedUser = { ...currentUser, name, role, is_first_login_complete: true };
      authService.storeSession(updatedUser);
      
      // Welcome message for new users
      const welcomeMessages = {
        customer: {
          title: '🎊 Welcome to Shirpur Delivery!',
          message: `Hi ${name}! 🙋‍♂️\n\nYour account is ready!\n🛒 Start shopping fresh products\n⚡ Get delivery in 30 minutes`,
          icon: '🎉'
        },
        admin: {
          title: '👑 Admin Account Created!',
          message: `Welcome ${name}! 🎯\n\nYou now have admin access\n📊 Manage your delivery business\n🚀 Control everything from here`,
          icon: '⚡'
        },
        delivery: {
          title: '🚚 Delivery Partner Onboard!',
          message: `Welcome ${name}! 🤝\n\nYou're now a delivery partner\n📦 Accept orders and earn money\n💰 Start your journey today`,
          icon: '🎯'
        }
      };
      
      const welcome = welcomeMessages[role];
      
      setTimeout(() => {
        if (window.Swal) {
          window.Swal.fire({
            title: welcome.title,
            text: welcome.message,
            icon: 'success',
            iconHtml: welcome.icon,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: '#fff',
            confirmButtonColor: '#4F46E5',
            confirmButtonText: 'Get Started! 🚀',
            showClass: {
              popup: 'animate__animated animate__bounceIn'
            },
            timer: 5000,
            timerProgressBar: true
          }).then(() => {
            const routes = {
              customer: '/customer',
              admin: '/admin',
              delivery: '/delivery'
            };
            navigate(routes[role]);
          });
        } else {
          toast({
            title: welcome.title,
            description: welcome.message.replace(/\n/g, ' '),
          });
          
          setTimeout(() => {
            const routes = {
              customer: '/customer',
              admin: '/admin',
              delivery: '/delivery'
            };
            navigate(routes[role]);
          }, 2000);
        }
      }, 500);
    } else {
      toast({
        title: "Setup Failed",
        description: result.message,
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  // Resend OTP
  const handleResendOTP = async () => {
    setLoading(true);
    const result = await authService.sendOTP(phone);
    
    if (result.success) {
      startTimer();
      toast({
        title: "OTP Resent",
        description: result.message,
      });
    } else {
      toast({
        title: "Failed to Resend OTP",
        description: result.message,
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Side - Illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-orange-400 to-red-500 items-center justify-center p-12">
        <div className="text-center text-white">
          <div className="w-64 h-64 mx-auto mb-8 relative">
            <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse"></div>
            <div className="absolute inset-4 bg-white/30 rounded-full animate-pulse delay-300"></div>
            <div className="absolute inset-8 bg-white rounded-full flex items-center justify-center">
              <span className="text-6xl text-orange-500">🍽️</span>
            </div>
          </div>
          <h2 className="text-4xl font-bold mb-4">Shirpur Delivery</h2>
          <p className="text-xl opacity-90">Fresh food delivered in 30 minutes</p>
        </div>
      </div>
      
      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl text-white">🍽️</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Shirpur Delivery</h1>
          </div>

          <div className="bg-white">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                {step === 'phone' && 'Login'}
                {step === 'otp' && 'Verify OTP'}
                {step === 'setup' && 'Complete Profile'}
              </h2>
              <p className="text-gray-600">
                {step === 'phone' && 'Enter your phone number to continue'}
                {step === 'otp' && `We've sent an OTP to +91 ${phone}`}
                {step === 'setup' && 'Tell us a bit about yourself'}
              </p>
            </div>
          
            <div>
            {/* Phone Number Step */}
            {step === 'phone' && (
              <form onSubmit={handleSendOTP} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Mobile Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Enter 10-digit mobile number"
                      value={phone}
                      onChange={(e) => setPhone(formatPhone(e.target.value))}
                      className="pl-10 h-12 text-base"
                      maxLength={10}
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500">We'll send you a 6-digit OTP</p>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-medium"
                  disabled={loading || phone.length !== 10}
                >
                  {loading ? "Sending OTP..." : "Send OTP"}
                </Button>
              </form>
            )}

            {/* OTP Verification Step */}
            {step === 'otp' && (
              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp">Enter OTP</Label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="otp"
                      type="text"
                      placeholder="Enter 6-digit OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="pl-10 h-12 text-base text-center tracking-widest"
                      maxLength={6}
                      required
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Sent to +91 {phone}</span>
                    {otpTimer > 0 && (
                      <div className="flex items-center text-blue-600">
                        <Timer className="w-3 h-3 mr-1" />
                        {formatTime(otpTimer)}
                      </div>
                    )}
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-medium"
                  disabled={loading || otp.length !== 6}
                >
                  {loading ? "Verifying..." : "Verify OTP"}
                </Button>

                {otpTimer === 0 && (
                  <Button 
                    type="button"
                    variant="outline"
                    className="w-full h-12"
                    onClick={handleResendOTP}
                    disabled={loading}
                  >
                    Resend OTP
                  </Button>
                )}

                <Button 
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => setStep('phone')}
                >
                  Change Phone Number
                </Button>
              </form>
            )}

            {/* Profile Setup Step */}
            {step === 'setup' && (
              <form onSubmit={handleCompleteSetup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-10 h-12 text-base"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Select Your Role</Label>
                  <div className="grid gap-3">
                    <button
                      type="button"
                      onClick={() => setRole('customer')}
                      className={`p-4 border rounded-lg flex items-center space-x-3 transition-colors ${
                        role === 'customer' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <ShoppingBag className="w-5 h-5 text-blue-600" />
                      <div className="text-left">
                        <p className="font-medium">Customer</p>
                        <p className="text-sm text-gray-500">Browse and order products</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRole('delivery')}
                      className={`p-4 border rounded-lg flex items-center space-x-3 transition-colors ${
                        role === 'delivery' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Truck className="w-5 h-5 text-green-600" />
                      <div className="text-left">
                        <p className="font-medium">Delivery Partner</p>
                        <p className="text-sm text-gray-500">Deliver orders to customers</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRole('admin')}
                      className={`p-4 border rounded-lg flex items-center space-x-3 transition-colors ${
                        role === 'admin' ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Shield className="w-5 h-5 text-purple-600" />
                      <div className="text-left">
                        <p className="font-medium">Admin</p>
                        <p className="text-sm text-gray-500">Manage system and orders</p>
                      </div>
                    </button>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-medium"
                  disabled={loading || !name.trim()}
                >
                  {loading ? "Setting up..." : "Get Started"}
                </Button>
              </form>
            )}
            </div>

            {/* Demo Info */}
            {step === 'phone' && (
              <div className="mt-6 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-sm text-orange-800 text-center">
                  <strong>Demo Mode:</strong> OTP will be displayed in an alert for testing
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTPLogin;