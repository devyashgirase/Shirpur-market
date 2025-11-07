import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';

const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi! I\'m your Shirpur Delivery AI assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    
    // Simple AI responses
    const responses = [
      'I can help you find products, track orders, or answer questions about delivery.',
      'Our fresh vegetables are delivered within 30 minutes!',
      'You can track your order in real-time using the Track section.',
      'We have great deals on rice, vegetables, and groceries today!',
      'Is there a specific product you\'re looking for?'
    ];
    
    setTimeout(() => {
      const aiResponse = { role: 'assistant', content: responses[Math.floor(Math.random() * responses.length)] };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  const startVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    
    setIsListening(true);
    recognition.start();
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
    };
    
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageMessage = { 
          role: 'user', 
          content: `📸 Image uploaded: ${file.name}`,
          image: e.target?.result as string
        };
        setMessages(prev => [...prev, imageMessage]);
        
        setTimeout(() => {
          const aiResponse = { role: 'assistant', content: 'I can see your image! How can I help you with this product?' };
          setMessages(prev => [...prev, aiResponse]);
        }, 1000);
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 w-14 h-14 rounded-full bg-blue-500 hover:bg-blue-600 text-white shadow-lg z-50"
      >
        🤖
      </Button>
    );
  }

  return (
    <div className="fixed bottom-20 right-4 w-80 h-96 bg-white rounded-lg shadow-xl border z-50 flex flex-col">
      <div className="bg-blue-500 text-white p-3 rounded-t-lg flex justify-between items-center">
        <span className="font-semibold">🤖 AI Assistant</span>
        <Button onClick={() => setIsOpen(false)} variant="ghost" size="sm" className="text-white hover:bg-blue-600">
          ✕
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs p-2 rounded-lg text-sm ${
              msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100'
            }`}>
              {(msg as any).image && <img src={(msg as any).image} alt="Uploaded" className="w-full h-20 object-cover rounded mb-1" />}
              {msg.content}
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-3 border-t">
        <div className="flex gap-2 mb-2">
          <Button onClick={startVoiceInput} size="sm" variant="outline" disabled={isListening}>
            {isListening ? '🔴' : '🎙️'}
          </Button>
          <Button onClick={() => fileInputRef.current?.click()} size="sm" variant="outline">
            📸
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type or speak your message..."
            className="flex-1 p-2 border rounded text-sm"
          />
          <Button onClick={handleSend} size="sm">
            Send
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;