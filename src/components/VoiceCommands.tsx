import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const VoiceCommands = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    let isActive = false;

    const startListening = () => {
      if (isActive) return;
      isActive = true;
      recognition.start();
    };

    const stopListening = () => {
      if (!isActive) return;
      isActive = false;
      recognition.stop();
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
      
      // Voice commands
      if (transcript.includes('go to cart') || transcript.includes('open cart')) {
        navigate('/customer/cart');
      } else if (transcript.includes('go to orders') || transcript.includes('my orders')) {
        navigate('/customer/orders');
      } else if (transcript.includes('go home') || transcript.includes('go to catalog')) {
        navigate('/customer');
      } else if (transcript.includes('track order') || transcript.includes('track my order')) {
        navigate('/customer/track');
      } else if (transcript.includes('search for')) {
        const searchTerm = transcript.replace('search for', '').trim();
        const searchEvent = new CustomEvent('voiceSearch', { detail: { query: searchTerm } });
        window.dispatchEvent(searchEvent);
      }
    };

    // Global voice activation
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === ' ') {
        e.preventDefault();
        startListening();
        
        // Show voice indicator
        const indicator = document.createElement('div');
        indicator.innerHTML = '🎙️ Listening for commands...';
        indicator.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg z-50';
        document.body.appendChild(indicator);
        
        setTimeout(() => {
          stopListening();
          indicator.remove();
        }, 5000);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      stopListening();
    };
  }, [navigate]);

  return null;
};

export default VoiceCommands;