import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Phone, Mail, Truck, Star, LogOut, Edit, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { deliveryAuthService } from '@/lib/deliveryAuthService';
// i18n disabled

const DeliveryProfile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState(null);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const t = (key: string) => key;
  const currentLang = 'en';
  const changeLanguage = () => {};

  useEffect(() => {
    const loadCurrentAgent = async () => {
      const agent = await deliveryAuthService.getCurrentAgent();
      setCurrentUser(agent);
    };
    loadCurrentAgent();
  }, []);

  const handleLogout = () => {
    deliveryAuthService.logout();
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    });
    navigate('/delivery/login');
  };

  if (!currentUser) {
    navigate('/delivery/login');
    return null;
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <User className="w-6 h-6 text-blue-600" />
        <h1 className="text-2xl font-bold">{t('profile.title')}</h1>
      </div>

      {/* Profile Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">{currentUser.name}</h2>
                <p className="text-sm text-gray-600">Delivery Agent</p>
              </div>
            </CardTitle>
            <Badge className="bg-green-100 text-green-800">
              Active
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <User className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">Agent ID</p>
                <p className="font-medium">{currentUser.userId || currentUser.id}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Phone className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-medium">{currentUser.phone || 'Not provided'}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Mail className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{currentUser.email || 'Not provided'}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Truck className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">Vehicle</p>
                <p className="font-medium">{currentUser.vehicleType || 'Not specified'}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Card */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">0</div>
              <div className="text-sm text-gray-600">Total Deliveries</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">0</div>
              <div className="text-sm text-gray-600">Today's Deliveries</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="flex items-center justify-center gap-1 text-2xl font-bold text-yellow-600">
                <Star className="w-6 h-6" />
                4.8
              </div>
              <div className="text-sm text-gray-600">Rating</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">₹0</div>
              <div className="text-sm text-gray-600">Today's Earnings</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="space-y-3">
        <Button 
          variant="outline" 
          className="w-full justify-center bg-green-50 border-green-200 text-green-700 hover:bg-green-100 hover:border-green-300"
          onClick={() => setShowLanguageModal(true)}
        >
          <Globe className="w-4 h-4 mr-2" />
          {t('profile.changeLanguage')}
        </Button>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Button 
            variant="outline" 
            className="w-full justify-center bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 hover:border-blue-300"
            onClick={() => toast({ 
              title: "🔧 Coming Soon", 
              description: "Profile editing feature will be available in next update!" 
            })}
          >
            <Edit className="w-4 h-4 mr-2" />
            {t('profile.editProfile')}
          </Button>
          
          <Button 
            variant="destructive" 
            className="w-full justify-center bg-red-500 hover:bg-red-600 text-white shadow-md"
            onClick={() => {
              if (confirm('🚪 Are you sure you want to logout?')) {
                handleLogout();
              }
            }}
          >
            <LogOut className="w-4 h-4 mr-2" />
            {t('profile.logout')}
          </Button>
        </div>
      </div>
      {/* Language Selection Modal */}
      {showLanguageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-sm bg-white">
            <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white">
              <CardTitle className="flex items-center justify-between">
                <span>{t('profile.language')}</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-white hover:bg-white/20"
                  onClick={() => setShowLanguageModal(false)}
                >
                  ✕
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                {[
                  { code: 'en' as Language, name: 'English', native: 'English' },
                  { code: 'hi' as Language, name: 'Hindi', native: 'हिंदी' },
                  { code: 'mr' as Language, name: 'Marathi', native: 'मराठी' }
                ].map((lang) => (
                  <Button
                    key={lang.code}
                    variant={currentLang === lang.code ? "default" : "outline"}
                    className={`w-full justify-start ${
                      currentLang === lang.code 
                        ? 'bg-green-500 hover:bg-green-600 text-white' 
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                    onClick={() => {
                      changeLanguage(lang.code);
                      setShowLanguageModal(false);
                    }}
                  >
                    <Globe className="w-4 h-4 mr-3" />
                    <div className="text-left">
                      <div className="font-medium">{lang.native}</div>
                      <div className="text-xs opacity-70">{lang.name}</div>
                    </div>
                    {currentLang === lang.code && (
                      <div className="ml-auto text-green-200">✓</div>
                    )}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default DeliveryProfile;