# 📱 Free SMS Setup Guide for Shirpur Delivery

## 🆓 Free SMS Options Available

### 1. **TextBelt (Recommended for Testing)**
- **Free Limit**: 1 SMS per day per IP address
- **Setup**: No registration required
- **Usage**: Already integrated in the code
- **Best For**: Testing and development

### 2. **Twilio Free Trial**
- **Free Credit**: $15 (covers ~500 SMS)
- **Setup**: 
  1. Sign up at [twilio.com](https://twilio.com)
  2. Get Account SID and Auth Token
  3. Add to environment variables
- **Best For**: Production with moderate usage

### 3. **MSG91 (India-focused)**
- **Free Trial**: 100 SMS
- **Setup**:
  1. Sign up at [msg91.com](https://msg91.com)
  2. Get API key
  3. Verify your sender ID
- **Best For**: Indian phone numbers

### 4. **Fast2SMS (India)**
- **Free Trial**: 50 SMS
- **Setup**:
  1. Register at [fast2sms.com](https://fast2sms.com)
  2. Get API key
  3. Use their API endpoints
- **Best For**: Quick setup in India

## 🔧 Current Implementation

The system uses **multiple fallback methods**:

1. **TextBelt API** (1 free SMS/day)
2. **WhatsApp Link Generation** (unlimited, manual)
3. **Local Storage** (for testing)

## 📋 Environment Variables Setup

Add these to your `.env` file:

```env
# TextBelt (Free - already configured)
VITE_TEXTBELT_KEY=textbelt

# Twilio (Optional - for production)
VITE_TWILIO_ACCOUNT_SID=your_account_sid
VITE_TWILIO_AUTH_TOKEN=your_auth_token
VITE_TWILIO_PHONE_NUMBER=your_twilio_number

# MSG91 (Optional - for India)
VITE_MSG91_API_KEY=your_msg91_key
VITE_MSG91_SENDER_ID=SHIRPUR

# Fast2SMS (Optional - for India)
VITE_FAST2SMS_API_KEY=your_fast2sms_key
```

## 🚀 Quick Setup for Production

### Option 1: Use Twilio (Recommended)

1. **Sign up**: Go to [twilio.com](https://twilio.com)
2. **Get credentials**: Account SID, Auth Token, Phone Number
3. **Add to Vercel**: Set environment variables in Vercel dashboard
4. **Update code**: Replace TextBelt with Twilio API

```javascript
// Add to freeOtpService.ts
private static async sendViaTwilio(phone: string, message: string): Promise<void> {
  const accountSid = import.meta.env.VITE_TWILIO_ACCOUNT_SID;
  const authToken = import.meta.env.VITE_TWILIO_AUTH_TOKEN;
  const fromNumber = import.meta.env.VITE_TWILIO_PHONE_NUMBER;
  
  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + btoa(`${accountSid}:${authToken}`),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      From: fromNumber,
      To: phone,
      Body: message
    })
  });
}
```

### Option 2: Use MSG91 (India-specific)

1. **Register**: [msg91.com](https://msg91.com)
2. **Verify**: Complete KYC for sender ID
3. **Get API key**: From dashboard
4. **Integrate**: Use their REST API

## 📱 WhatsApp Alternative (100% Free)

The system also generates **WhatsApp links** that you can use manually:

```javascript
// WhatsApp link format
https://wa.me/919876543210?text=Your%20Shirpur%20Delivery%20OTP%20is%3A%20123456

// This opens WhatsApp with pre-filled message
// You can send it manually or automate via WhatsApp Business API
```

## 🔄 Current Flow

1. **User enters phone number**
2. **System tries TextBelt** (1 free SMS/day)
3. **If TextBelt fails**, generates WhatsApp link
4. **For testing**, shows OTP in alert
5. **Stores OTP** in localStorage for verification

## 🎯 Production Recommendations

### For Small Scale (< 100 SMS/day)
- Use **TextBelt** + **WhatsApp links**
- Cost: **Free**

### For Medium Scale (100-1000 SMS/day)
- Use **Twilio** with $15 free credit
- Cost: **~$0.03 per SMS after free credit**

### For Large Scale (1000+ SMS/day)
- Use **MSG91** or **Fast2SMS**
- Cost: **₹0.15-0.25 per SMS**

## 🛠️ Testing the Current Setup

1. **Enter any 10-digit phone number**
2. **Click "Send OTP"**
3. **Check browser alert** for OTP (testing mode)
4. **Enter the OTP** to verify
5. **Complete profile setup**

## 📞 Support & Troubleshooting

### Common Issues:
- **TextBelt limit reached**: Use WhatsApp link or wait 24 hours
- **OTP not received**: Check phone number format
- **Verification failed**: Ensure OTP is entered within 5 minutes

### Debug Mode:
- Check browser console for SMS sending logs
- OTP is stored in localStorage for testing
- WhatsApp links are logged in console

## 🔐 Security Notes

- OTPs expire after 5 minutes
- Only 6-digit numeric OTPs accepted
- Rate limiting prevents spam
- Phone numbers are validated before sending

---

**🎉 Your free SMS system is ready! No API costs for basic usage.**