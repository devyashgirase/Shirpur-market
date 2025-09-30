import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Phone, Shield, Timer, User, ShoppingBag, Truck } from "lucide-react";
import { authService, User as AuthUser } from "@/lib/authService";
import { SimpleFreeOtp, OTPResult } from "@/lib/simpleFreeOtp";

const OTPLogin = () => {
  const [step, setStep] = useState<'phone' | 'otp' | 'setup'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'customer' | 'admin' | 'delivery'>('customer');
  const [loading, setLoading] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [otpError, setOtpError] = useState<string>('');
  const [whatsappLink, setWhatsappLink] = useState<string>('');
  
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
    setOtpError('');
    
    // Generate and send OTP using free service
    const otp = SimpleFreeOtp.generateOTP();
    const result: OTPResult = await SimpleFreeOtp.sendOTP(`+91${phone}`, otp);
    
    if (result.success) {
      setStep('otp');
      startTimer();
      
      if (result.whatsappLink) {
        setWhatsappLink(result.whatsappLink);
      }
      
      // Show OTP in alert for testing (remove in production)
      if (window.alert) {
        window.alert(`Your OTP is: ${otp}\n\nThis is shown for testing purposes.\nIn production, you'll receive it via SMS.`);
      }
      
      toast({
        title: "OTP Sent!",
        description: result.message,
        variant: result.errorCode === 'SMS_LIMIT_REACHED' ? 'default' : 'default'
      });
    } else {
      setOtpError(result.message);
      toast({
        title: "OTP Sending Failed",
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
    
    // Verify OTP using SimpleFreeOtp service
    const isValidOTP = SimpleFreeOtp.verifyOTP(`+91${phone}`, otp);
    
    if (isValidOTP) {
      // Get or create user
      let user = await authService.getUserByPhone(phone);
      
      if (!user) {
        // Create new user
        user = {
          id: Date.now(),
          phone,
          role: 'customer',
          is_first_login_complete: false
        };
      }
      
      // Update last login and save user
      user.last_login = new Date().toISOString();
      authService.saveUser(user);
      
      setCurrentUser(user);
      
      if (!user.is_first_login_complete) {
        setStep('setup');
        toast({
          title: "OTP Verified Successfully!",
          description: "Please complete your profile setup",
        });
      } else {
        // Login successful - proceed with existing flow
        authService.storeSession(user);
        
        const welcomeMessages = {
          customer: {
            title: '🎉 Welcome Back!',
            message: `Hello ${user.name || 'Valued Customer'}!\n\n🛒 Ready to explore fresh products?\n⚡ Fast delivery in 30 minutes!`,
            icon: '🛍️'
          },
          admin: {
            title: '👑 Admin Access Granted!',
            message: `Welcome ${user.name || 'Administrator'}!\n\n📊 Your dashboard awaits\n🚀 Manage your delivery empire!`,
            icon: '⚡'
          },
          delivery: {
            title: '🚚 Ready to Deliver!',
            message: `Hey ${user.name || 'Delivery Hero'}!\n\n📦 New orders are waiting\n💰 Start earning today!`,
            icon: '🎯'
          }
        };
        
        const welcome = welcomeMessages[user.role];
        
        // Show animated welcome popup
        setTimeout(() => {
          const popup = document.createElement('div');
          popup.className = 'fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fadeIn';
          popup.innerHTML = `
            <div class="bg-gradient-to-br from-white to-gray-50 rounded-3xl p-8 max-w-sm mx-4 text-center shadow-2xl transform animate-slideUp">
              <div class="text-7xl mb-4 animate-bounce">${welcome.icon}</div>
              <h2 class="text-2xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent mb-3">${welcome.title}</h2>
              <div class="text-gray-700 mb-6 space-y-1">
                ${welcome.message.split('\n').map(line => `<p class="${line.includes('Hello') || line.includes('Welcome') || line.includes('Hey') ? 'font-semibold text-lg' : 'text-sm'}">${line}</p>`).join('')}
              </div>
              <button class="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg">
                Continue 🚀
              </button>
            </div>
          `;
          
          // Add CSS animations
          const style = document.createElement('style');
          style.textContent = `
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes slideUp { from { transform: translateY(50px) scale(0.9); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; } }
            .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
            .animate-slideUp { animation: slideUp 0.4s ease-out; }
          `;
          document.head.appendChild(style);
          document.body.appendChild(popup);
          
          // Handle button click
          popup.querySelector('button').onclick = () => {
            popup.style.animation = 'fadeIn 0.2s ease-out reverse';
            setTimeout(() => {
              popup.remove();
              style.remove();
              const routes = {
                customer: '/customer',
                admin: '/admin',
                delivery: '/delivery'
              };
              navigate(routes[user.role]);
            }, 200);
          };
          
          // Auto redirect after 4 seconds
          setTimeout(() => {
            if (document.body.contains(popup)) {
              popup.querySelector('button').click();
            }
          }, 4000);
        }, 1000);
      }
    } else {
      toast({
        title: "Invalid OTP",
        description: "The OTP you entered is incorrect or expired. Please try again.",
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
    setOtpError('');
    
    // Generate and send new OTP
    const otp = SimpleFreeOtp.generateOTP();
    const result: OTPResult = await SimpleFreeOtp.sendOTP(`+91${phone}`, otp);
    
    if (result.success) {
      startTimer();
      
      if (result.whatsappLink) {
        setWhatsappLink(result.whatsappLink);
      }
      
      // Show OTP in alert for testing
      if (window.alert) {
        window.alert(`Your new OTP is: ${otp}\n\nThis is shown for testing purposes.`);
      }
      
      toast({
        title: "OTP Resent!",
        description: result.message,
      });
    } else {
      setOtpError(result.message);
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
                {/* Error Display */}
                {otpError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <span className="text-red-600 text-sm">❌</span>
                      <p className="text-sm text-red-800">{otpError}</p>
                    </div>
                    {whatsappLink && (
                      <div className="mt-2">
                        <a 
                          href={whatsappLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-sm text-green-600 hover:text-green-700 underline"
                        >
                          📱 Get OTP via WhatsApp
                        </a>
                      </div>
                    )}
                  </div>
                )}
                
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

                <div className="space-y-2">
                  {otpTimer === 0 && (
                    <Button 
                      type="button"
                      variant="outline"
                      className="w-full h-12"
                      onClick={handleResendOTP}
                      disabled={loading}
                    >
                      {loading ? "Resending..." : "Resend OTP"}
                    </Button>
                  )}
                  
                  {whatsappLink && (
                    <a 
                      href={whatsappLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block w-full"
                    >
                      <Button 
                        type="button"
                        variant="outline"
                        className="w-full h-12 border-green-200 text-green-700 hover:bg-green-50"
                      >
                        📱 Get OTP via WhatsApp
                      </Button>
                    </a>
                  )}
                </div>

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
              <div className="mt-6 space-y-3">
                <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-sm text-orange-800 text-center">
                    <strong>Demo Mode:</strong> OTP will be displayed in an alert for testing
                  </p>
                </div>
                
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-blue-800 text-center">
                    <strong>Free SMS:</strong> 1 SMS per day via TextBelt. Unlimited via WhatsApp backup.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTPLogin;