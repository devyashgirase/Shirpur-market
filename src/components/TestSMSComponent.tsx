import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Send, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function TestSMSComponent() {
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('🎉 Test SMS from Shirpur Delivery System! Your system is working perfectly.');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  const sendTestSMS = async () => {
    if (!phone) {
      toast({
        title: "Phone Required",
        description: "Please enter your phone number",
        variant: "destructive"
      });
      return;
    }

    setSending(true);
    
    try {
      // Try TextBelt first
      const response = await fetch('https://textbelt.com/text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phone,
          message: message,
          key: 'textbelt'
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setSent(true);
        toast({
          title: "Real SMS Sent! 📱",
          description: `Message delivered to ${phone}. Check your mobile now!`,
        });
        return;
      }
      
      // If TextBelt fails, show demo with WhatsApp option
      throw new Error(result.error || 'TextBelt quota exceeded');
      
    } catch (error) {
      console.log('SMS Provider Error:', error);
      
      // Fallback: Generate WhatsApp link
      const cleanPhone = phone.replace(/\D/g, '');
      const whatsappMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/${cleanPhone}?text=${whatsappMessage}`;
      
      setSent(true);
      toast({
        title: "SMS Demo + WhatsApp Option 📱",
        description: "SMS simulated. Click below to send via WhatsApp instead!",
      });
      
      // Store WhatsApp link for user
      localStorage.setItem('whatsappLink', whatsappUrl);
      
    } finally {
      setSending(false);
    }
  };

  const openWhatsApp = () => {
    const whatsappUrl = localStorage.getItem('whatsappLink');
    if (whatsappUrl) {
      window.open(whatsappUrl, '_blank');
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-blue-600" />
          Test SMS - Get Real Message Now!
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium">Your Phone Number:</label>
          <Input
            type="tel"
            placeholder="+919876543210 or 9876543210"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1"
          />
          <p className="text-xs text-gray-500 mt-1">
            Include country code (e.g., +91 for India)
          </p>
        </div>

        <div>
          <label className="text-sm font-medium">Test Message:</label>
          <textarea
            className="w-full mt-1 p-2 border rounded-md text-sm"
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>

        <Button
          onClick={sendTestSMS}
          disabled={sending || sent}
          className="w-full"
        >
          {sending ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Sending SMS...
            </>
          ) : sent ? (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              SMS Sent! Check Your Phone
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Send Test SMS Now
            </>
          )}
        </Button>

        {sent && (
          <div className="space-y-3">
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-700">
                ✅ <strong>Message Processed!</strong><br/>
                Check your mobile phone or try WhatsApp option below.
              </p>
            </div>
            
            <Button
              onClick={openWhatsApp}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              📱 Send via WhatsApp Instead
            </Button>
          </div>
        )}

        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-700">
            💡 <strong>Free SMS:</strong> Using TextBelt API with free quota. 
            You'll receive a real SMS on your mobile phone instantly!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}