import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Phone, Shield, Timer, User, ShoppingBag, Truck } from "lucide-react";
import { authService, User as AuthUser } from "@/lib/authService";
import { SimpleFreeOtp, OTPResult } from "@/lib/simpleFreeOtp";
import YashBranding from "@/components/YashBranding";

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
    const result: OTPResult = await SimpleFreeOtp.sendOTP(phone, otp);
    
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
    const isValidOTP = SimpleFreeOtp.verifyOTP(phone, otp);
    
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
        
        // Show animated welcome popup with real-time effects
        setTimeout(() => {
          const popup = document.createElement('div');
          popup.className = 'fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-fadeIn';
          popup.innerHTML = `
            <div class="bg-gradient-to-br from-white via-blue-50 to-purple-50 rounded-3xl p-8 max-w-sm mx-4 text-center shadow-2xl transform animate-slideUp border-4 border-gradient-to-r from-blue-400 to-purple-400">
              <!-- Floating particles -->
              <div class="absolute inset-0 overflow-hidden rounded-3xl">
                <div class="particle particle-1"></div>
                <div class="particle particle-2"></div>
                <div class="particle particle-3"></div>
                <div class="particle particle-4"></div>
                <div class="particle particle-5"></div>
              </div>
              
              <!-- Animated cartoon with glow effect -->
              <div class="relative z-10">
                <div class="mb-4 glow-effect flex justify-center" id="cartoon-container"></div>
                <div class="w-20 h-1 bg-gradient-to-r from-orange-400 to-red-400 mx-auto mb-4 rounded-full animate-pulse"></div>
                
                <h2 class="text-2xl font-bold bg-gradient-to-r from-orange-500 via-red-500 to-purple-500 bg-clip-text text-transparent mb-3 animate-text-glow">
                  Welcome to Shirpur Delivery!
                </h2>
                
                <div class="text-gray-700 mb-6 space-y-2 animate-fadeInUp">
                  ${welcome.message.split('\n').map((line, index) => `<p class="${line.includes('Hello') || line.includes('Welcome') || line.includes('Hey') ? 'font-semibold text-lg animate-pulse' : 'text-sm'} animate-slideInLeft" style="animation-delay: ${index * 0.2}s">${line}</p>`).join('')}
                </div>
                
                <!-- Progress bar animation -->
                <div class="w-full bg-gray-200 rounded-full h-2 mb-4 overflow-hidden">
                  <div class="bg-gradient-to-r from-orange-400 to-red-400 h-2 rounded-full animate-progress"></div>
                </div>
                
                <button class="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg animate-button-glow">
                  Continue 🚀
                </button>
              </div>
            </div>
          `;
          
          // Add advanced CSS animations
          const style = document.createElement('style');
          style.textContent = `
            @keyframes fadeIn { 
              from { opacity: 0; backdrop-filter: blur(0px); } 
              to { opacity: 1; backdrop-filter: blur(5px); } 
            }
            @keyframes slideUp { 
              from { transform: translateY(100px) scale(0.8) rotateX(20deg); opacity: 0; } 
              to { transform: translateY(0) scale(1) rotateX(0deg); opacity: 1; } 
            }
            @keyframes fadeInUp {
              from { transform: translateY(20px); opacity: 0; }
              to { transform: translateY(0); opacity: 1; }
            }
            @keyframes slideInLeft {
              from { transform: translateX(-30px); opacity: 0; }
              to { transform: translateX(0); opacity: 1; }
            }
            @keyframes bounce-slow {
              0%, 20%, 50%, 80%, 100% { transform: translateY(0) scale(1); }
              40% { transform: translateY(-10px) scale(1.1); }
              60% { transform: translateY(-5px) scale(1.05); }
            }
            @keyframes progress {
              from { width: 0%; }
              to { width: 100%; }
            }
            @keyframes text-glow {
              0%, 100% { text-shadow: 0 0 5px rgba(249, 115, 22, 0.5); }
              50% { text-shadow: 0 0 20px rgba(249, 115, 22, 0.8), 0 0 30px rgba(239, 68, 68, 0.6); }
            }
            @keyframes button-glow {
              0%, 100% { box-shadow: 0 4px 15px rgba(249, 115, 22, 0.3); }
              50% { box-shadow: 0 8px 25px rgba(249, 115, 22, 0.6), 0 0 30px rgba(239, 68, 68, 0.4); }
            }
            @keyframes float {
              0%, 100% { transform: translateY(0px) rotate(0deg); }
              33% { transform: translateY(-10px) rotate(120deg); }
              66% { transform: translateY(5px) rotate(240deg); }
            }
            
            .animate-fadeIn { animation: fadeIn 0.5s ease-out; }
            .animate-slideUp { animation: slideUp 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
            .animate-fadeInUp { animation: fadeInUp 0.8s ease-out 0.3s both; }
            .animate-slideInLeft { animation: slideInLeft 0.6s ease-out both; }
            .animate-bounce-slow { animation: bounce-slow 2s infinite; }
            .animate-progress { animation: progress 3s ease-out; }
            .animate-text-glow { animation: text-glow 2s ease-in-out infinite; }
            .animate-button-glow { animation: button-glow 2s ease-in-out infinite; }
            
            .glow-effect {
              filter: drop-shadow(0 0 10px rgba(249, 115, 22, 0.5));
            }
            
            .particle {
              position: absolute;
              width: 6px;
              height: 6px;
              background: linear-gradient(45deg, #f97316, #ef4444);
              border-radius: 50%;
              animation: float 3s ease-in-out infinite;
            }
            .particle-1 { top: 20%; left: 20%; animation-delay: 0s; }
            .particle-2 { top: 30%; right: 20%; animation-delay: 0.5s; }
            .particle-3 { bottom: 30%; left: 30%; animation-delay: 1s; }
            .particle-4 { bottom: 20%; right: 30%; animation-delay: 1.5s; }
            .particle-5 { top: 50%; left: 10%; animation-delay: 2s; }
          `;
          document.head.appendChild(style);
          document.body.appendChild(popup);
          
          // Add role-specific cartoon with new warm welcome design
          const cartoonContainer = popup.querySelector('#cartoon-container');
          if (cartoonContainer) {
            let cartoonSVG = '';
            if (user.role === 'customer') {
              cartoonSVG = `<svg width="120" height="120" viewBox="0 0 120 120" class="animate-bounce-slow">
                <!-- Professional proportional customer -->
                <g>
                  <!-- Head -->
                  <circle cx="60" cy="30" r="15" fill="#FBBF24" stroke="#F59E0B" stroke-width="1.5"/>
                  
                  <!-- Hair -->
                  <path d="M47 20 Q60 12 73 20 Q70 16 60 16 Q50 16 47 20" fill="#8B4513"/>
                  
                  <!-- Eyes -->
                  <circle cx="55" cy="28" r="1.5" fill="#000"/>
                  <circle cx="65" cy="28" r="1.5" fill="#000"/>
                  
                  <!-- Smile -->
                  <path d="M53 34 Q60 38 67 34" stroke="#000" stroke-width="1.5" fill="none" stroke-linecap="round"/>
                  
                  <!-- Body -->
                  <rect x="50" y="43" width="20" height="30" rx="10" fill="#3B82F6"/>
                  
                  <!-- Arms -->
                  <circle cx="42" cy="50" r="4" fill="#FBBF24"/>
                  <circle cx="78" cy="50" r="4" fill="#FBBF24"/>
                  
                  <!-- Shopping bags -->
                  <rect x="30" y="55" width="10" height="12" rx="2" fill="#EF4444"/>
                  <rect x="80" y="55" width="10" height="12" rx="2" fill="#10B981"/>
                  <path d="M32 55 Q35 52 38 55" stroke="#EF4444" stroke-width="1.5" fill="none"/>
                  <path d="M82 55 Q85 52 88 55" stroke="#10B981" stroke-width="1.5" fill="none"/>
                  
                  <!-- Legs -->
                  <rect x="54" y="73" width="5" height="18" rx="2.5" fill="#1F2937"/>
                  <rect x="61" y="73" width="5" height="18" rx="2.5" fill="#1F2937"/>
                  
                  <!-- Shoes -->
                  <ellipse cx="56.5" cy="93" rx="6" ry="3" fill="#000"/>
                  <ellipse cx="63.5" cy="93" rx="6" ry="3" fill="#000"/>
                </g>
              </svg>`;
            } else if (user.role === 'delivery') {
              cartoonSVG = `<svg width="120" height="120" viewBox="0 0 120 120" class="animate-bounce-slow">
                <circle cx="60" cy="35" r="18" fill="#FBBF24" stroke="#F59E0B" stroke-width="2"/>
                <path d="M42 25 Q60 10 78 25 Q78 30 60 28 Q42 30 42 25" fill="#EF4444"/>
                <rect x="55" y="15" width="10" height="8" rx="2" fill="#FFF"/>
                <circle cx="54" cy="32" r="2" fill="#000"/>
                <circle cx="66" cy="32" r="2" fill="#000"/>
                <path d="M52 38 Q60 44 68 38" stroke="#000" stroke-width="2" fill="none"/>
                <rect x="48" y="50" width="24" height="35" rx="12" fill="#1F2937"/>
                <rect x="52" y="54" width="16" height="8" fill="#FBBF24"/>
                <circle cx="40" cy="60" r="6" fill="#FBBF24"/>
                <circle cx="80" cy="60" r="6" fill="#FBBF24"/>
                <rect x="82" y="58" width="15" height="12" rx="2" fill="#8B4513"/>
                <rect x="52" y="85" width="6" height="20" fill="#1F2937"/>
                <rect x="62" y="85" width="6" height="20" fill="#1F2937"/>
                <ellipse cx="55" cy="108" rx="8" ry="4" fill="#000"/>
                <ellipse cx="65" cy="108" rx="8" ry="4" fill="#000"/>
              </svg>`;
            } else if (user.role === 'admin') {
              cartoonSVG = `<svg width="120" height="120" viewBox="0 0 120 120" class="animate-bounce-slow">
                <circle cx="60" cy="35" r="18" fill="#FBBF24" stroke="#F59E0B" stroke-width="2"/>
                <path d="M45 25 Q60 12 75 25 Q75 22 60 20 Q45 22 45 25" fill="#4B5563"/>
                <circle cx="54" cy="32" r="6" fill="none" stroke="#000" stroke-width="2"/>
                <circle cx="66" cy="32" r="6" fill="none" stroke="#000" stroke-width="2"/>
                <circle cx="54" cy="32" r="2" fill="#000"/>
                <circle cx="66" cy="32" r="2" fill="#000"/>
                <path d="M52 38 Q60 44 68 38" stroke="#000" stroke-width="2" fill="none"/>
                <rect x="48" y="50" width="24" height="35" rx="12" fill="#1F2937"/>
                <polygon points="60,50 65,55 60,75 55,55" fill="#EF4444"/>
                <rect x="52" y="50" width="16" height="25" fill="#FFF"/>
                <circle cx="40" cy="60" r="6" fill="#FBBF24"/>
                <circle cx="80" cy="60" r="6" fill="#FBBF24"/>
                <rect x="82" y="55" width="12" height="18" rx="2" fill="#8B4513"/>
                <rect x="52" y="85" width="6" height="20" fill="#1F2937"/>
                <rect x="62" y="85" width="6" height="20" fill="#1F2937"/>
                <ellipse cx="55" cy="108" rx="8" ry="4" fill="#000"/>
                <ellipse cx="65" cy="108" rx="8" ry="4" fill="#000"/>
              </svg>`;
            }
            cartoonContainer.innerHTML = cartoonSVG;
          }
          
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
          
          // Auto redirect after 5 seconds to enjoy animations
          setTimeout(() => {
            if (document.body.contains(popup)) {
              popup.querySelector('button').click();
            }
          }, 5000);
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
      
      // Show animated welcome popup with cartoon (same as existing user flow)
      setTimeout(() => {
        const popup = document.createElement('div');
        popup.className = 'fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-fadeIn';
        popup.innerHTML = `
          <div class="bg-gradient-to-br from-white via-blue-50 to-purple-50 rounded-3xl p-8 max-w-sm mx-4 text-center shadow-2xl transform animate-slideUp border-4 border-gradient-to-r from-blue-400 to-purple-400">
            <!-- Floating particles -->
            <div class="absolute inset-0 overflow-hidden rounded-3xl">
              <div class="particle particle-1"></div>
              <div class="particle particle-2"></div>
              <div class="particle particle-3"></div>
              <div class="particle particle-4"></div>
              <div class="particle particle-5"></div>
            </div>
            
            <!-- Animated cartoon with glow effect -->
            <div class="relative z-10">
              <div class="mb-4 glow-effect flex justify-center" id="cartoon-container-setup"></div>
              <div class="w-20 h-1 bg-gradient-to-r from-orange-400 to-red-400 mx-auto mb-4 rounded-full animate-pulse"></div>
              
              <h2 class="text-2xl font-bold bg-gradient-to-r from-orange-500 via-red-500 to-purple-500 bg-clip-text text-transparent mb-3 animate-text-glow">
                Welcome to Shirpur Delivery!
              </h2>
              
              <div class="text-gray-700 mb-6 space-y-2 animate-fadeInUp">
                ${welcome.message.split('\n').map((line, index) => `<p class="${line.includes('Hi') || line.includes('Welcome') ? 'font-semibold text-lg animate-pulse' : 'text-sm'} animate-slideInLeft" style="animation-delay: ${index * 0.2}s">${line}</p>`).join('')}
              </div>
              
              <!-- Progress bar animation -->
              <div class="w-full bg-gray-200 rounded-full h-2 mb-4 overflow-hidden">
                <div class="bg-gradient-to-r from-orange-400 to-red-400 h-2 rounded-full animate-progress"></div>
              </div>
              
              <button class="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg animate-button-glow">
                Get Started 🚀
              </button>
            </div>
          </div>
        `;
        
        // Add advanced CSS animations (reuse existing styles)
        const style = document.createElement('style');
        style.textContent = `
          @keyframes fadeIn { 
            from { opacity: 0; backdrop-filter: blur(0px); } 
            to { opacity: 1; backdrop-filter: blur(5px); } 
          }
          @keyframes slideUp { 
            from { transform: translateY(100px) scale(0.8) rotateX(20deg); opacity: 0; } 
            to { transform: translateY(0) scale(1) rotateX(0deg); opacity: 1; } 
          }
          @keyframes fadeInUp {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          @keyframes slideInLeft {
            from { transform: translateX(-30px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
          @keyframes bounce-slow {
            0%, 20%, 50%, 80%, 100% { transform: translateY(0) scale(1); }
            40% { transform: translateY(-10px) scale(1.1); }
            60% { transform: translateY(-5px) scale(1.05); }
          }
          @keyframes progress {
            from { width: 0%; }
            to { width: 100%; }
          }
          @keyframes text-glow {
            0%, 100% { text-shadow: 0 0 5px rgba(249, 115, 22, 0.5); }
            50% { text-shadow: 0 0 20px rgba(249, 115, 22, 0.8), 0 0 30px rgba(239, 68, 68, 0.6); }
          }
          @keyframes button-glow {
            0%, 100% { box-shadow: 0 4px 15px rgba(249, 115, 22, 0.3); }
            50% { box-shadow: 0 8px 25px rgba(249, 115, 22, 0.6), 0 0 30px rgba(239, 68, 68, 0.4); }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            33% { transform: translateY(-10px) rotate(120deg); }
            66% { transform: translateY(5px) rotate(240deg); }
          }
          
          .animate-fadeIn { animation: fadeIn 0.5s ease-out; }
          .animate-slideUp { animation: slideUp 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
          .animate-fadeInUp { animation: fadeInUp 0.8s ease-out 0.3s both; }
          .animate-slideInLeft { animation: slideInLeft 0.6s ease-out both; }
          .animate-bounce-slow { animation: bounce-slow 2s infinite; }
          .animate-progress { animation: progress 3s ease-out; }
          .animate-text-glow { animation: text-glow 2s ease-in-out infinite; }
          .animate-button-glow { animation: button-glow 2s ease-in-out infinite; }
          
          .glow-effect {
            filter: drop-shadow(0 0 10px rgba(249, 115, 22, 0.5));
          }
          
          .particle {
            position: absolute;
            width: 6px;
            height: 6px;
            background: linear-gradient(45deg, #f97316, #ef4444);
            border-radius: 50%;
            animation: float 3s ease-in-out infinite;
          }
          .particle-1 { top: 20%; left: 20%; animation-delay: 0s; }
          .particle-2 { top: 30%; right: 20%; animation-delay: 0.5s; }
          .particle-3 { bottom: 30%; left: 30%; animation-delay: 1s; }
          .particle-4 { bottom: 20%; right: 30%; animation-delay: 1.5s; }
          .particle-5 { top: 50%; left: 10%; animation-delay: 2s; }
        `;
        document.head.appendChild(style);
        document.body.appendChild(popup);
        
        // Add role-specific cartoon with new warm welcome design
        const cartoonContainer = popup.querySelector('#cartoon-container-setup');
        if (cartoonContainer) {
          let cartoonSVG = '';
          if (role === 'customer') {
            cartoonSVG = `<svg width="120" height="120" viewBox="0 0 120 120" class="animate-bounce-slow">
              <!-- Professional proportional customer -->
              <g>
                <!-- Head -->
                <circle cx="60" cy="30" r="15" fill="#FBBF24" stroke="#F59E0B" stroke-width="1.5"/>
                
                <!-- Hair -->
                <path d="M47 20 Q60 12 73 20 Q70 16 60 16 Q50 16 47 20" fill="#8B4513"/>
                
                <!-- Eyes -->
                <circle cx="55" cy="28" r="1.5" fill="#000"/>
                <circle cx="65" cy="28" r="1.5" fill="#000"/>
                
                <!-- Smile -->
                <path d="M53 34 Q60 38 67 34" stroke="#000" stroke-width="1.5" fill="none" stroke-linecap="round"/>
                
                <!-- Body -->
                <rect x="50" y="43" width="20" height="30" rx="10" fill="#3B82F6"/>
                
                <!-- Arms -->
                <circle cx="42" cy="50" r="4" fill="#FBBF24"/>
                <circle cx="78" cy="50" r="4" fill="#FBBF24"/>
                
                <!-- Shopping bags -->
                <rect x="30" y="55" width="10" height="12" rx="2" fill="#EF4444"/>
                <rect x="80" y="55" width="10" height="12" rx="2" fill="#10B981"/>
                <path d="M32 55 Q35 52 38 55" stroke="#EF4444" stroke-width="1.5" fill="none"/>
                <path d="M82 55 Q85 52 88 55" stroke="#10B981" stroke-width="1.5" fill="none"/>
                
                <!-- Legs -->
                <rect x="54" y="73" width="5" height="18" rx="2.5" fill="#1F2937"/>
                <rect x="61" y="73" width="5" height="18" rx="2.5" fill="#1F2937"/>
                
                <!-- Shoes -->
                <ellipse cx="56.5" cy="93" rx="6" ry="3" fill="#000"/>
                <ellipse cx="63.5" cy="93" rx="6" ry="3" fill="#000"/>
              </g>
            </svg>`;
          } else if (role === 'delivery') {
            cartoonSVG = `<svg width="120" height="120" viewBox="0 0 120 120" class="animate-bounce-slow">
              <circle cx="60" cy="35" r="18" fill="#FBBF24" stroke="#F59E0B" stroke-width="2"/>
              <path d="M42 25 Q60 10 78 25 Q78 30 60 28 Q42 30 42 25" fill="#EF4444"/>
              <rect x="55" y="15" width="10" height="8" rx="2" fill="#FFF"/>
              <circle cx="54" cy="32" r="2" fill="#000"/>
              <circle cx="66" cy="32" r="2" fill="#000"/>
              <path d="M52 38 Q60 44 68 38" stroke="#000" stroke-width="2" fill="none"/>
              <rect x="48" y="50" width="24" height="35" rx="12" fill="#1F2937"/>
              <rect x="52" y="54" width="16" height="8" fill="#FBBF24"/>
              <circle cx="40" cy="60" r="6" fill="#FBBF24"/>
              <circle cx="80" cy="60" r="6" fill="#FBBF24"/>
              <rect x="82" y="58" width="15" height="12" rx="2" fill="#8B4513"/>
              <rect x="52" y="85" width="6" height="20" fill="#1F2937"/>
              <rect x="62" y="85" width="6" height="20" fill="#1F2937"/>
              <ellipse cx="55" cy="108" rx="8" ry="4" fill="#000"/>
              <ellipse cx="65" cy="108" rx="8" ry="4" fill="#000"/>
            </svg>`;
          } else if (role === 'admin') {
            cartoonSVG = `<svg width="120" height="120" viewBox="0 0 120 120" class="animate-bounce-slow">
              <circle cx="60" cy="35" r="18" fill="#FBBF24" stroke="#F59E0B" stroke-width="2"/>
              <path d="M45 25 Q60 12 75 25 Q75 22 60 20 Q45 22 45 25" fill="#4B5563"/>
              <circle cx="54" cy="32" r="6" fill="none" stroke="#000" stroke-width="2"/>
              <circle cx="66" cy="32" r="6" fill="none" stroke="#000" stroke-width="2"/>
              <circle cx="54" cy="32" r="2" fill="#000"/>
              <circle cx="66" cy="32" r="2" fill="#000"/>
              <path d="M52 38 Q60 44 68 38" stroke="#000" stroke-width="2" fill="none"/>
              <rect x="48" y="50" width="24" height="35" rx="12" fill="#1F2937"/>
              <polygon points="60,50 65,55 60,75 55,55" fill="#EF4444"/>
              <rect x="52" y="50" width="16" height="25" fill="#FFF"/>
              <circle cx="40" cy="60" r="6" fill="#FBBF24"/>
              <circle cx="80" cy="60" r="6" fill="#FBBF24"/>
              <rect x="82" y="55" width="12" height="18" rx="2" fill="#8B4513"/>
              <rect x="52" y="85" width="6" height="20" fill="#1F2937"/>
              <rect x="62" y="85" width="6" height="20" fill="#1F2937"/>
              <ellipse cx="55" cy="108" rx="8" ry="4" fill="#000"/>
              <ellipse cx="65" cy="108" rx="8" ry="4" fill="#000"/>
            </svg>`;
          }
          cartoonContainer.innerHTML = cartoonSVG;
        }
        
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
            navigate(routes[role]);
          }, 200);
        };
        
        // Auto redirect after 5 seconds
        setTimeout(() => {
          if (document.body.contains(popup)) {
            popup.querySelector('button').click();
          }
        }, 5000);
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
    const result: OTPResult = await SimpleFreeOtp.sendOTP(phone, otp);
    
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
    <div className="min-h-screen bg-white flex flex-col lg:flex-row">
      {/* Top/Left Side - Illustration */}
      <div className="w-full lg:w-1/2 bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center p-6 lg:p-12 min-h-[40vh] lg:min-h-screen">
        <div className="text-center text-white">
          <div className="w-32 h-32 lg:w-64 lg:h-64 mx-auto mb-4 lg:mb-8 relative">
            <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse"></div>
            <div className="absolute inset-2 lg:inset-4 bg-white/30 rounded-full animate-pulse delay-300"></div>
            <div className="absolute inset-4 lg:inset-8 bg-white rounded-full flex items-center justify-center">
              <span className="text-3xl lg:text-6xl text-orange-500">🍽️</span>
            </div>
          </div>
          <h2 className="text-2xl lg:text-4xl font-bold mb-2 lg:mb-4">Shirpur Delivery</h2>
          <p className="text-sm lg:text-xl opacity-90">Fresh food delivered in 30 minutes</p>
        </div>
      </div>
      
      {/* Bottom/Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 lg:p-8">
        <div className="w-full max-w-md">

          <div className="bg-white">
            <div className="mb-6 lg:mb-8">
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2">
                {step === 'phone' && 'Login'}
                {step === 'otp' && 'Verify OTP'}
                {step === 'setup' && 'Complete Profile'}
              </h2>
              <p className="text-gray-600 text-sm lg:text-base">
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

                {/* Delivery Agent Login Button */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <Button 
                    type="button"
                    variant="outline"
                    className="w-full h-12 border-green-200 text-green-700 hover:bg-green-50"
                    onClick={() => navigate('/delivery/login')}
                  >
                    <Truck className="w-4 h-4 mr-2" />
                    Delivery Agent Login
                  </Button>

                </div>
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


          </div>
          
          {/* YASH Technologies Branding */}
          <YashBranding variant="footer" className="mt-8" />
        </div>
      </div>
    </div>
  );
};

export default OTPLogin;