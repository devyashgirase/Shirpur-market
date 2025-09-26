# 🚀 Shirpur Delivery System - Production Ready

A comprehensive multi-role delivery management system with real-time tracking, payment integration, and GPS-based location services.

## ✨ Features

- **🔄 Dual Database Support**: Automatic switching between Supabase (production) and MySQL (development)
- **👥 Multi-Role System**: Customer portal, admin dashboard, and delivery partner interface
- **📍 Real-time GPS Tracking**: Live location tracking for delivery partners
- **💳 Payment Integration**: Razorpay payment gateway with UPI, card, and wallet support
- **🏠 Address Management**: GPS-based address collection with reverse geocoding
- **📦 Product Management**: Admin interface for inventory and product management
- **📊 Live Order Tracking**: Real-time order status and delivery tracking
- **🎁 Loyalty Program**: Customer rewards and points system
- **📈 Advanced Analytics**: Real-time dashboard with comprehensive metrics
- **🤖 Smart Inventory**: Automated stock management and alerts
- **⭐ Feedback System**: Customer reviews and ratings
- **🗺️ Route Optimization**: Intelligent delivery route planning

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI Components**: shadcn/ui + Tailwind CSS
- **Database**: Supabase PostgreSQL (Production) / MySQL (Development)
- **Maps**: Leaflet + React Leaflet
- **Payment**: Razorpay
- **Routing**: React Router DOM
- **State Management**: React Query + Local Storage
- **Real-time**: Supabase Realtime subscriptions

## 🚀 Quick Start

### 1. Clone and Install
```bash
git clone <your-repo-url>
cd shirpur-delivery-system
npm install
```

### 2. Environment Setup
```bash
# Check current configuration
npm run check-env

# Copy environment template
cp .env.production .env
```

### 3. Configure Database (Choose One)

#### Option A: Supabase (Recommended for Production)
1. Create project at [supabase.com](https://supabase.com)
2. Run the SQL schema: Copy `supabase-schema.sql` to Supabase SQL Editor
3. Update `.env`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

#### Option B: Local MySQL (Development)
```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
# System will automatically use MySQL fallback
```

### 4. Configure Payment Gateway
```env
VITE_RAZORPAY_KEY_ID=your_razorpay_key
```

### 5. Start Development
```bash
npm run dev
```

## 🌐 Production Deployment

### Vercel (Recommended)
1. **Connect Repository**: Import project to Vercel
2. **Environment Variables**: Add in Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_RAZORPAY_KEY_ID`
3. **Deploy**: 
```bash
npm run deploy:prod
```

### Manual Deployment
```bash
npm run build:prod
# Deploy dist/ folder to your hosting service
```

## 👥 User Roles & Access

| Role | URL | Features |
|------|-----|----------|
| **Customer** | `/customer` | Browse products, place orders, track deliveries, loyalty rewards |
| **Admin** | `/admin` | Manage products, orders, analytics, inventory, delivery tracking |
| **Delivery** | `/delivery` | Accept orders, GPS tracking, update delivery status |

## 📊 Database Schema

The system automatically creates these tables in Supabase:
- `products` - Product catalog with inventory
- `orders` - Order management with real-time updates
- `delivery_agents` - Delivery partner information and GPS locations
- `customers` - Customer profiles and loyalty data
- `feedback` - Customer reviews and ratings
- `inventory_logs` - Stock movement tracking

## 🔧 Configuration Options

### Feature Flags
```env
VITE_ENABLE_LOYALTY_PROGRAM=true
VITE_ENABLE_ROUTE_OPTIMIZATION=true
VITE_ENABLE_SMART_INVENTORY=true
VITE_ENABLE_FEEDBACK_SYSTEM=true
VITE_ENABLE_ADVANCED_ANALYTICS=true
```

### Optional Services
```env
VITE_GOOGLE_MAPS_API_KEY=your_key  # Enhanced location services
```

## 🔍 System Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React Client  │────│  Database Layer  │────│   Supabase DB   │
│                 │    │                  │    │                 │
│ • Customer UI   │    │ • Auto-switching │    │ • PostgreSQL    │
│ • Admin Panel   │    │ • Unified API    │    │ • Real-time     │
│ • Delivery App  │    │ • Error Handling │    │ • Row Security  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌──────────────────┐
                    │   MySQL Fallback │
                    │                  │
                    │ • Development    │
                    │ • Local Testing  │
                    │ • Backup Option  │
                    └──────────────────┘
```

## 🛡️ Security Features

- **Row Level Security (RLS)** enabled on all Supabase tables
- **Environment variable protection** for sensitive data
- **Secure payment processing** through Razorpay
- **GPS location encryption** for delivery tracking
- **API endpoint validation** and error handling

## 📱 Mobile Responsive

- **Progressive Web App (PWA)** ready
- **Touch-optimized interface** for mobile devices
- **Offline capability** for basic functions
- **GPS integration** for location services

## 🔧 Development Scripts

```bash
npm run dev              # Start development server
npm run build:prod       # Build for production
npm run check-env        # Validate environment configuration
npm run lint             # Run code linting
npm run preview          # Preview production build
```

## 📈 Monitoring & Analytics

- **Real-time order tracking** with live updates
- **Customer behavior analytics** and insights
- **Delivery performance metrics** and optimization
- **Revenue tracking** with detailed breakdowns
- **Inventory alerts** and automated restocking

## 🆘 Troubleshooting

### Database Connection Issues
```bash
# Check environment configuration
npm run check-env

# Verify Supabase connection
# Check network connectivity and credentials
```

### Payment Gateway Issues
- Verify Razorpay credentials in dashboard
- Check test/live mode configuration
- Validate webhook endpoints

### GPS/Location Issues
- Ensure HTTPS deployment for location services
- Check browser permissions for geolocation
- Verify mobile device compatibility

## 📞 Support

For deployment assistance or technical support:
1. Check the `DEPLOYMENT.md` guide
2. Review environment configuration with `npm run check-env`
3. Verify all required services are properly configured

## 🎯 Production Checklist

- [ ] ✅ Supabase database configured and schema deployed
- [ ] ✅ Razorpay payment gateway integrated
- [ ] ✅ Environment variables set in production
- [ ] ✅ HTTPS enabled for GPS functionality
- [ ] ✅ Real-time features tested and working
- [ ] ✅ All user roles accessible and functional
- [ ] ✅ Mobile responsiveness verified
- [ ] ✅ Performance optimization completed

---

**🚀 Ready for production deployment with Supabase + Vercel!**