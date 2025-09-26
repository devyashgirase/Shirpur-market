# Production Deployment Guide

## 🚀 Supabase Setup

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Note your project URL and anon key

### 2. Database Setup
1. Go to SQL Editor in Supabase dashboard
2. Copy and paste the entire `supabase-schema.sql` file
3. Run the script to create all tables and sample data

### 3. Environment Configuration
Update `.env.production` with your credentials:
```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```

## 🔧 Vercel Deployment

### 1. Connect Repository
1. Push code to GitHub
2. Connect repository to Vercel
3. Import project

### 2. Environment Variables
Add these in Vercel dashboard:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_RAZORPAY_KEY_ID`
- `VITE_GOOGLE_MAPS_API_KEY` (optional)

### 3. Build Settings
- Build Command: `npm run build:prod`
- Output Directory: `dist`
- Install Command: `npm install`

## 📱 Features Enabled

✅ **Database**: Supabase PostgreSQL with real-time subscriptions
✅ **Payment**: Razorpay integration
✅ **GPS Tracking**: Real-time delivery agent location
✅ **Multi-Role System**: Customer, Admin, Delivery portals
✅ **Loyalty Program**: Customer rewards system
✅ **Analytics**: Real-time dashboard with statistics
✅ **Inventory Management**: Smart stock tracking
✅ **Feedback System**: Customer reviews and ratings

## 🔄 Database Migration

The system automatically detects and switches between:
- **Supabase** (when credentials provided) - Production
- **MySQL** (fallback) - Local development

## 🛡️ Security Features

- Row Level Security (RLS) enabled
- Environment variable protection
- Secure API endpoints
- Payment gateway encryption

## 📊 Monitoring

Access real-time metrics:
- Order statistics
- Customer analytics
- Delivery performance
- Revenue tracking

## 🚨 Post-Deployment Checklist

- [ ] Verify Supabase connection
- [ ] Test payment gateway
- [ ] Check GPS functionality
- [ ] Validate all user roles
- [ ] Test real-time updates
- [ ] Verify mobile responsiveness

## 🔧 Troubleshooting

**Database Connection Issues:**
- Check Supabase URL and key
- Verify RLS policies
- Check network connectivity

**Payment Issues:**
- Validate Razorpay credentials
- Check webhook configuration
- Verify test/live mode settings

**GPS Issues:**
- Enable location permissions
- Check HTTPS deployment
- Verify browser compatibility