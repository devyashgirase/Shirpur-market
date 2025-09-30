# 🚀 Production Deployment Guide

## Prerequisites
- Supabase account (free tier available)
- Vercel account (free tier available)
- Razorpay account for payments
- GitHub repository

## Step 1: Setup Supabase Database

### 1.1 Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Create new project
4. Choose region closest to your users
5. Wait for project setup (2-3 minutes)

### 1.2 Deploy Database Schema
1. Go to SQL Editor in Supabase dashboard
2. Copy entire content from `supabase-schema.sql`
3. Paste and run the SQL
4. Verify tables are created in Table Editor

### 1.3 Get Supabase Credentials
1. Go to Settings > API
2. Copy Project URL
3. Copy anon/public key

## Step 2: Configure Environment Variables

Update `.env` file:
```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_RAZORPAY_KEY_ID=your-razorpay-key
```

## Step 3: Deploy to Vercel

### 3.1 Push to GitHub
```bash
git add .
git commit -m "Production ready deployment"
git push origin main
```

### 3.2 Deploy on Vercel
1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_RAZORPAY_KEY_ID`
4. Deploy

## Step 4: Configure Payment Gateway

### 4.1 Razorpay Setup
1. Create Razorpay account
2. Get API keys from dashboard
3. Update environment variables
4. Test payment flow

## Step 5: Test Production System

### 5.1 Verify All Features
- [ ] User registration/login
- [ ] Product browsing
- [ ] Cart functionality
- [ ] Order placement
- [ ] Payment processing
- [ ] Admin dashboard
- [ ] Real-time updates
- [ ] GPS tracking

## Step 6: Go Live

1. Switch Razorpay to live mode
2. Update live API keys
3. Test with real transactions
4. Monitor system performance

## 🔧 Quick Commands

```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Deploy to Vercel
vercel --prod
```

## 📞 Support Checklist

- [ ] Database schema deployed
- [ ] Environment variables configured
- [ ] Payment gateway tested
- [ ] Real-time features working
- [ ] Mobile responsive verified
- [ ] HTTPS enabled
- [ ] All user roles accessible

Your system is now production ready! 🎉