import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Search, X, Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface ProductSearchProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

const ProductSearch = ({ onSearch, placeholder = "Search products..." }: ProductSearchProps) => {
  const [query, setQuery] = useState("");
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'hi-IN'; // Hindi support
      
      recognitionInstance.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        onSearch(transcript);
        setIsListening(false);
      };
      
      recognitionInstance.onerror = () => {
        setIsListening(false);
        toast({
          title: "Voice Error",
          description: "Could not recognize speech. Please try again.",
          variant: "destructive"
        });
      };
      
      recognitionInstance.onend = () => {
        setIsListening(false);
      };
      
      setRecognition(recognitionInstance);
    }
  }, [onSearch, toast]);

  const handleSearch = (value: string) => {
    setQuery(value);
    onSearch(value);
  };

  const clearSearch = () => {
    setQuery("");
    onSearch("");
  };

  const startVoiceSearch = () => {
    if (!recognition) {
      toast({
        title: "Voice Not Supported",
        description: "Your browser doesn't support voice search",
        variant: "destructive"
      });
      return;
    }
    
    setIsListening(true);
    recognition.start();
  };

  const stopVoiceSearch = () => {
    if (recognition) {
      recognition.stop();
    }
    setIsListening(false);
  };

  const openFullScreen = () => {
    setIsFullScreen(true);
  };

  const closeFullScreen = () => {
    setIsFullScreen(false);
  };

  if (isFullScreen) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-500 to-green-500 text-white">
          <h2 className="text-xl font-bold">🔍 Search Products</h2>
          <Button variant="ghost" size="sm" onClick={closeFullScreen} className="text-white hover:bg-white/20">
            <X className="h-6 w-6" />
          </Button>
        </div>
        
        {/* Search Input */}
        <div className="p-6">
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400" />
            <Input
              type="text"
              placeholder="Search rice, dal, vegetables, fruits..."
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-12 pr-20 h-14 text-lg border-2 border-gray-300 focus:border-blue-500 rounded-xl"
              autoFocus
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-2">
              {query && (
                <Button variant="ghost" size="sm" onClick={clearSearch} className="h-8 w-8 p-0">
                  <X className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant={isListening ? "destructive" : "default"}
                size="sm"
                onClick={isListening ? stopVoiceSearch : startVoiceSearch}
                className={`h-10 w-10 p-0 rounded-full ${isListening ? 'animate-pulse bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'}`}
              >
                {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </Button>
            </div>
          </div>
          
          {isListening && (
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 bg-red-100 text-red-800 px-4 py-2 rounded-full">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="font-medium">Listening... Speak now</span>
              </div>
            </div>
          )}
          
          {/* Quick Search Suggestions */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {['Rice', 'Dal', 'Oil', 'Vegetables', 'Fruits', 'Milk', 'Bread', 'Sugar', 'Tea'].map((item) => (
              <Button
                key={item}
                variant="outline"
                onClick={() => handleSearch(item)}
                className="h-12 text-left justify-start hover:bg-blue-50 hover:border-blue-300"
              >
                <Search className="h-4 w-4 mr-2" />
                {item}
              </Button>
            ))}
          </div>
        </div>
        
        {/* Voice Instructions */}
        <div className="mt-auto p-4 bg-gray-50 border-t">
          <div className="text-center text-sm text-gray-600">
            <p className="mb-2">🎤 <strong>Voice Search Tips:</strong></p>
            <p>• Speak clearly: "Rice", "Basmati rice", "Vegetables"</p>
            <p>• Supports Hindi: "चावल", "दाल", "सब्जी"</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      <Input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        onClick={openFullScreen}
        className="pl-10 pr-16 cursor-pointer"
        readOnly
      />
      <Button
        variant="ghost"
        size="sm"
        onClick={openFullScreen}
        className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 text-blue-500 hover:bg-blue-50"
      >
        <Search className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default ProductSearch;