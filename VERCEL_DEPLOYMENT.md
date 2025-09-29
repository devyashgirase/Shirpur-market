# 🚀 Vercel Deployment Guide - Supabase Setup

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Create new project:
   - **Name**: `shirpur-delivery-system`
   - **Database Password**: Create a strong password
   - **Region**: Choose closest to your users

## Step 2: Setup Database Schema

1. Go to **SQL Editor** in Supabase dashboard
2. Copy the entire content from `supabase-schema.sql`
3. Paste and run the SQL script
4. Verify tables are created in **Table Editor**

## Step 3: Get Supabase Credentials

1. Go to **Settings** → **API**
2. Copy these values:
   - **Project URL**: `https://your-project-ref.supabase.co`
   - **Anon Public Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## Step 4: Update Environment Variables

Update `.env.production`:
```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Payment Gateway
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id

# Feature Flags
VITE_ENABLE_LOYALTY_PROGRAM=true
VITE_ENABLE_ROUTE_OPTIMIZATION=true
VITE_ENABLE_SMART_INVENTORY=true
VITE_ENABLE_FEEDBACK_SYSTEM=true
VITE_ENABLE_ADVANCED_ANALYTICS=true
```

## Step 5: Deploy to Vercel

### Option A: Vercel CLI
```bash
npm install -g vercel
vercel --prod
```

### Option B: Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Add environment variables in Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_RAZORPAY_KEY_ID`
4. Deploy

## Step 6: Verify Deployment

1. Check dashboard loads with real-time data
2. Test order creation and management
3. Verify all user roles work (customer, admin, delivery)
4. Test payment integration

## 🔧 Build Commands

```bash
# Build for production
npm run build:prod

# Preview production build
npm run preview

# Deploy to Vercel
npm run deploy:prod
```

## 📋 Environment Variables Checklist

- [ ] `VITE_SUPABASE_URL` - Supabase project URL
- [ ] `VITE_SUPABASE_ANON_KEY` - Supabase anon key
- [ ] `VITE_RAZORPAY_KEY_ID` - Razorpay key for payments
- [ ] Feature flags enabled as needed

## 🛡️ Security Notes

- Supabase RLS (Row Level Security) is enabled
- All tables have public policies for demo purposes
- Update policies for production security requirements
- API keys are environment-specific

## 📱 Post-Deployment Testing

1. **Admin Dashboard**: Real-time metrics and order management
2. **Customer Portal**: Product browsing and order placement
3. **Delivery Interface**: Order acceptance and GPS tracking
4. **Payment Flow**: Razorpay integration testing
5. **Real-time Updates**: Live data synchronization

## 🔄 Database Migration

If migrating from MySQL:
1. Export data from MySQL
2. Transform to PostgreSQL format
3. Import to Supabase using SQL Editor
4. Update environment variables
5. Redeploy application

## 🆘 Troubleshooting

### Common Issues:
- **Build Errors**: Check environment variables
- **Database Connection**: Verify Supabase credentials
- **Real-time Issues**: Check Supabase realtime settings
- **Payment Errors**: Verify Razorpay configuration

### Debug Commands:
```bash
# Check environment
npm run check-env

# Build with verbose output
npm run build -- --mode production

# Test Supabase connection
# Check browser console for connection errors
```

## 🎯 Production Checklist

- [ ] Supabase project created and configured
- [ ] Database schema deployed successfully
- [ ] Environment variables set in Vercel
- [ ] Application builds without errors
- [ ] Real-time dashboard working
- [ ] All user roles accessible
- [ ] Payment gateway configured
- [ ] Mobile responsiveness verified
- [ ] HTTPS enabled (automatic with Vercel)

**🚀 Your Shirpur Delivery System is now ready for production!**