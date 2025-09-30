# 🚀 Production Deployment Guide - Shirpur Delivery System

## 📋 Pre-Deployment Checklist

### 1. **Supabase Setup**
1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Copy project URL and anon key
4. Run `supabase-schema.sql` in SQL Editor
5. Enable Row Level Security (RLS)

### 2. **SMS Service Setup (Choose One)**

#### Option A: Twilio (Recommended)
- Sign up at [twilio.com](https://twilio.com)
- Get Account SID, Auth Token, and Phone Number
- Add to environment variables

#### Option B: TextBelt
- Get API key from [textbelt.com](https://textbelt.com)
- Free tier: 1 SMS per day
- Paid plans available

#### Option C: Fast2SMS (India)
- Sign up at [fast2sms.com](https://fast2sms.com)
- Get API key and sender ID
- Good for Indian phone numbers

### 3. **Payment Gateway**
- Get Razorpay live keys from [razorpay.com](https://razorpay.com)
- Replace test keys with live keys

## 🔧 Environment Configuration

### Update `.env` file:
```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-actual-anon-key

# SMS Service (Choose one or multiple)
VITE_TWILIO_ACCOUNT_SID=your_twilio_account_sid
VITE_TWILIO_AUTH_TOKEN=your_twilio_auth_token
VITE_TWILIO_PHONE_NUMBER=+1234567890

# OR TextBelt
VITE_SMS_API_KEY=your_textbelt_api_key

# OR Fast2SMS
VITE_FAST2SMS_API_KEY=your_fast2sms_api_key

# Payment Gateway
VITE_RAZORPAY_KEY_ID=rzp_live_your_live_key_id
VITE_RAZORPAY_KEY_SECRET=your_razorpay_secret
```

## 🌐 Vercel Deployment

### 1. **Connect Repository**
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

### 2. **Environment Variables in Vercel**
Add these in Vercel Dashboard → Settings → Environment Variables:

```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_TWILIO_ACCOUNT_SID
VITE_TWILIO_AUTH_TOKEN
VITE_TWILIO_PHONE_NUMBER
VITE_RAZORPAY_KEY_ID
VITE_RAZORPAY_KEY_SECRET
```

### 3. **Build Settings**
- Framework Preset: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

## 📱 SMS Provider Setup Details

### Twilio Setup
1. Create account and verify phone number
2. Buy a phone number for SMS
3. Get credentials from Console
4. Test with a small amount first

### TextBelt Setup
1. Free tier: Use `textbelt` as API key
2. Paid tier: Purchase credits
3. Good for testing and small scale

### Fast2SMS Setup
1. Indian SMS provider
2. Competitive rates for India
3. Good delivery rates
4. Supports promotional and transactional SMS

## 🔒 Security Configuration

### Supabase RLS Policies
The schema includes Row Level Security policies:
- Users can only access their own data
- Admins have full access
- Delivery agents see assigned orders only

### API Security
- All sensitive keys in environment variables
- No hardcoded credentials in code
- HTTPS enforced for production

## 📊 Monitoring & Analytics

### 1. **Supabase Dashboard**
- Monitor database performance
- Check real-time connections
- View API usage

### 2. **Vercel Analytics**
- Enable Vercel Analytics
- Monitor page performance
- Track user engagement

### 3. **SMS Delivery Tracking**
- Monitor SMS delivery rates
- Track failed deliveries
- Switch providers if needed

## 🚀 Go-Live Steps

### 1. **Final Testing**
```bash
# Test all features
npm run test

# Build for production
npm run build

# Preview production build
npm run preview
```

### 2. **Deploy to Production**
```bash
# Deploy to Vercel
vercel --prod

# Or push to main branch (if auto-deploy enabled)
git push origin main
```

### 3. **Post-Deployment Verification**
- [ ] Test user registration with real phone number
- [ ] Verify SMS delivery
- [ ] Test payment flow with small amount
- [ ] Check admin dashboard functionality
- [ ] Verify delivery partner features
- [ ] Test real-time location tracking

## 🔧 Troubleshooting

### Common Issues

#### SMS Not Delivered
1. Check SMS provider credentials
2. Verify phone number format
3. Check provider balance/credits
4. Test with different provider

#### Database Connection Failed
1. Verify Supabase URL and key
2. Check RLS policies
3. Ensure schema is properly created

#### Payment Issues
1. Verify Razorpay keys (live vs test)
2. Check webhook configuration
3. Test with small amounts first

#### Location Not Working
1. Ensure HTTPS deployment
2. Check browser permissions
3. Test on different devices

## 📞 Support Contacts

### Service Providers
- **Supabase**: [support@supabase.com](mailto:support@supabase.com)
- **Twilio**: [help@twilio.com](mailto:help@twilio.com)
- **Razorpay**: [support@razorpay.com](mailto:support@razorpay.com)
- **Vercel**: [support@vercel.com](mailto:support@vercel.com)

## 🎯 Production Checklist

- [ ] ✅ Supabase database configured and schema deployed
- [ ] ✅ SMS service configured and tested
- [ ] ✅ Payment gateway configured with live keys
- [ ] ✅ Environment variables set in Vercel
- [ ] ✅ HTTPS enabled for location services
- [ ] ✅ Real-time features tested and working
- [ ] ✅ All user roles accessible and functional
- [ ] ✅ Mobile responsiveness verified
- [ ] ✅ Performance optimization completed
- [ ] ✅ Security measures implemented
- [ ] ✅ Monitoring and analytics enabled

---

**🎉 Ready for production! Your Shirpur Delivery System is now live!**