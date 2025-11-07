import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ShoppingCart, Package, Home, ArrowLeft, MapPin, Menu } from "lucide-react";
import { cartService } from "@/lib/cartService";
import { useState, useEffect } from "react";
import ProfileDropdown from "@/components/ProfileDropdown";
import CustomerLocation from "@/components/CustomerLocation";

import MobileBottomNav from "@/components/MobileBottomNav";
import AIAssistant from "@/components/AIAssistant";
import VoiceCommands from "@/components/VoiceCommands";

const CustomerLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [cartItemCount, setCartItemCount] = useState(0);
  
  const handleBackClick = () => {
    if (location.pathname === '/customer') {
      navigate('/');
    } else {
      navigate(-1);
    }
  };

  useEffect(() => {
    const updateCartCount = async () => {
      try {
        const count = await cartService.getCartItemCount();
        setCartItemCount(count);
      } catch (error) {
        console.error('Failed to get cart count:', error);
        setCartItemCount(0);
      }
    };

    updateCartCount();
    
    // Listen for cart updates
    window.addEventListener('cartUpdated', updateCartCount);
    
    // Google-style search setup
    const setupGoogleSearch = () => {
      const searchInput = document.getElementById('google-search') as HTMLInputElement;
      const voiceBtn = document.getElementById('voice-search-btn');
      const searchBtn = document.getElementById('search-btn');
      const suggestions = document.getElementById('search-suggestions');
      
      if (!searchInput || !voiceBtn || !searchBtn || !suggestions) return;
      
      // Perform search function
      const performSearch = (query: string) => {
        if (!query.trim()) return;
        
        console.log('🔍 Searching for:', query);
        
        // Hide suggestions
        suggestions.classList.add('hidden');
        
        // Trigger product search event
        const searchEvent = new CustomEvent('productSearch', { 
          detail: { 
            query: query.trim(),
            type: 'manual_search'
          } 
        });
        window.dispatchEvent(searchEvent);
        
        // Navigate to catalog with search
        if (location.pathname !== '/customer') {
          navigate(`/customer?search=${encodeURIComponent(query.trim())}`);
        }
      };
      
      // Search button click
      searchBtn.addEventListener('click', () => {
        performSearch(searchInput.value);
      });
      
      // Enter key search
      searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          performSearch(searchInput.value);
        }
      });
      
      // Show suggestions on focus
      searchInput.addEventListener('focus', () => {
        if (searchInput.value.length === 0) {
          suggestions.classList.remove('hidden');
        }
      });
      
      // Hide suggestions on blur (with delay for clicks)
      searchInput.addEventListener('blur', () => {
        setTimeout(() => {
          suggestions.classList.add('hidden');
        }, 200);
      });
      
      // Real-time search as user types
      searchInput.addEventListener('input', (e) => {
        const query = (e.target as HTMLInputElement).value;
        
        if (query.length === 0) {
          suggestions.classList.remove('hidden');
        } else {
          suggestions.classList.add('hidden');
        }
        
        if (query.length > 2) {
          // Debounced search
          clearTimeout((window as any).searchTimeout);
          (window as any).searchTimeout = setTimeout(() => {
            const searchEvent = new CustomEvent('productSearch', { 
              detail: { 
                query: query.trim(),
                type: 'live_search'
              } 
            });
            window.dispatchEvent(searchEvent);
          }, 300);
        }
      });
      
      // Suggestion clicks
      const suggestionItems = suggestions.querySelectorAll('.search-suggestion');
      suggestionItems.forEach(item => {
        item.addEventListener('click', () => {
          const text = item.textContent?.replace(/🥬|🍚|🥛|🍅/g, '').trim() || '';
          searchInput.value = text;
          performSearch(text);
        });
      });
      
      // Voice search setup
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        voiceBtn.style.display = 'none';
        return;
      }
      
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      let isListening = false;
      
      voiceBtn.addEventListener('click', () => {
        if (isListening) {
          recognition.stop();
          return;
        }
        
        recognition.start();
        isListening = true;
        voiceBtn.innerHTML = '🔴';
        voiceBtn.style.backgroundColor = '#fee2e2';
        searchInput.placeholder = 'Listening... Speak now!';
      });
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        searchInput.value = transcript;
        performSearch(transcript);
      };
      
      recognition.onend = () => {
        isListening = false;
        voiceBtn.innerHTML = '🎤';
        voiceBtn.style.backgroundColor = 'transparent';
        searchInput.placeholder = 'Search products, vegetables, groceries...';
      };
      
      recognition.onerror = () => {
        isListening = false;
        voiceBtn.innerHTML = '🎤';
        voiceBtn.style.backgroundColor = 'transparent';
        searchInput.placeholder = 'Search products, vegetables, groceries...';
      };
    };
    
    // Setup Google-style search after component mounts
    setTimeout(setupGoogleSearch, 100);
    
    return () => {
      window.removeEventListener('cartUpdated', updateCartCount);
    };
  }, []);

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-green-600 text-white shadow-xl safe-area-top">
        <div className="container mx-auto px-3 sm:px-4 md:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
              <Button 
                onClick={handleBackClick}
                variant="ghost" 
                size="sm" 
                className="text-primary-foreground hover:text-primary-foreground/80 flex-shrink-0 p-1"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
              <div className="flex flex-col min-w-0 flex-1">
                <h1 className="text-base sm:text-lg md:text-2xl font-bold truncate">🛒 Shirpur Delivery</h1>
                <CustomerLocation />
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-4 xl:space-x-6">
              <nav className="flex items-center space-x-2 xl:space-x-4">
                <Link to="/customer">
                  <Button 
                    variant={isActive('/customer') ? "secondary" : "ghost"} 
                    className={isActive('/customer') ? "bg-white text-blue-600" : "text-white hover:bg-white/20"}
                    size="sm"
                  >
                    <Home className="w-4 h-4 mr-1 xl:mr-2" />
                    <span className="hidden xl:inline">Catalog</span>
                  </Button>
                </Link>
                
                <Link to="/customer/cart">
                  <Button 
                    variant={isActive('/customer/cart') ? "secondary" : "ghost"} 
                    className={`relative ${isActive('/customer/cart') ? "bg-white text-blue-600" : "text-white hover:bg-white/20"}`}
                    size="sm"
                  >
                    <ShoppingCart className="w-4 h-4 mr-1 xl:mr-2" />
                    <span className="hidden xl:inline">Cart</span>
                    {cartItemCount > 0 && (
                      <Badge className="absolute -top-2 -right-2 bg-red-500 text-white min-w-[18px] h-4 flex items-center justify-center text-xs animate-pulse">
                        {cartItemCount}
                      </Badge>
                    )}
                  </Button>
                </Link>
                
                <Link to="/customer/orders">
                  <Button 
                    variant={isActive('/customer/orders') ? "secondary" : "ghost"} 
                    className={isActive('/customer/orders') ? "bg-white text-blue-600" : "text-white hover:bg-white/20"}
                    size="sm"
                  >
                    <Package className="w-4 h-4 mr-1 xl:mr-2" />
                    <span className="hidden xl:inline">Orders</span>
                  </Button>
                </Link>
                
                <Link to="/customer/track">
                  <Button 
                    variant={isActive('/customer/track') ? "secondary" : "ghost"} 
                    className={isActive('/customer/track') ? "bg-white text-blue-600" : "text-white hover:bg-white/20"}
                    size="sm"
                  >
                    <MapPin className="w-4 h-4 mr-1 xl:mr-2" />
                    <span className="hidden xl:inline">Track</span>
                  </Button>
                </Link>
              </nav>
              
              <ProfileDropdown />
            </div>

            {/* Mobile Navigation */}
            <div className="flex lg:hidden items-center space-x-2">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 btn-mobile">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-72 sm:w-80">
                  <div className="flex flex-col space-y-4 mt-6">
                    <Link to="/customer" className="w-full">
                      <Button 
                        variant={isActive('/customer') ? "default" : "ghost"} 
                        className="w-full justify-start"
                        size="lg"
                      >
                        <Home className="w-4 h-4 mr-3" />
                        Catalog
                      </Button>
                    </Link>
                    
                    <Link to="/customer/cart" className="w-full">
                      <Button 
                        variant={isActive('/customer/cart') ? "default" : "ghost"} 
                        className="w-full justify-start relative"
                        size="lg"
                      >
                        <ShoppingCart className="w-4 h-4 mr-3" />
                        Cart
                        {cartItemCount > 0 && (
                          <Badge className="ml-auto bg-red-500 text-white">
                            {cartItemCount}
                          </Badge>
                        )}
                      </Button>
                    </Link>
                    
                    <Link to="/customer/orders" className="w-full">
                      <Button 
                        variant={isActive('/customer/orders') ? "default" : "ghost"} 
                        className="w-full justify-start"
                        size="lg"
                      >
                        <Package className="w-4 h-4 mr-3" />
                        Orders
                      </Button>
                    </Link>
                    
                    <Link to="/customer/track" className="w-full">
                      <Button 
                        variant={isActive('/customer/track') ? "default" : "ghost"} 
                        className="w-full justify-start"
                        size="lg"
                      >
                        <MapPin className="w-4 h-4 mr-3" />
                        Track
                      </Button>
                    </Link>
                    
                    <div className="pt-4 border-t">
                      <ProfileDropdown />
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Google-style Search Box */}
      <div className="bg-white shadow-lg border-b">
        <div className="container mx-auto px-3 sm:px-4 md:px-6 py-4">
          <div className="relative max-w-2xl mx-auto">
            <div className="relative flex items-center bg-white border border-gray-300 rounded-full shadow-sm hover:shadow-md transition-shadow">
              <div className="absolute left-4 text-gray-400">
                🔍
              </div>
              <input
                id="google-search"
                type="text"
                placeholder="Search products, vegetables, groceries..."
                className="w-full h-12 pl-12 pr-20 text-base bg-transparent border-0 rounded-full focus:outline-none"
              />
              <div className="absolute right-2 flex items-center gap-1">
                <button
                  id="voice-search-btn"
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                  title="Voice Search"
                >
                  🎤
                </button>
                <button
                  id="search-btn"
                  className="w-8 h-8 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center transition-colors ml-1"
                  title="Search"
                >
                  →
                </button>
              </div>
            </div>
            
            {/* Search Suggestions */}
            <div id="search-suggestions" className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 hidden z-50">
              <div className="p-2">
                <div className="text-xs text-gray-500 mb-2">Popular searches:</div>
                <div className="space-y-1">
                  <div className="search-suggestion px-3 py-2 hover:bg-gray-100 cursor-pointer rounded text-sm">🥬 Fresh Vegetables</div>
                  <div className="search-suggestion px-3 py-2 hover:bg-gray-100 cursor-pointer rounded text-sm">🍚 Basmati Rice</div>
                  <div className="search-suggestion px-3 py-2 hover:bg-gray-100 cursor-pointer rounded text-sm">🥛 Dairy Products</div>
                  <div className="search-suggestion px-3 py-2 hover:bg-gray-100 cursor-pointer rounded text-sm">🍅 Tomatoes</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="pb-16 lg:pb-0">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav userType="customer" />
      
      {/* AI Assistant */}
      <AIAssistant />
      
      {/* Voice Commands */}
      <VoiceCommands />
    </div>
  );
};

export default CustomerLayout;