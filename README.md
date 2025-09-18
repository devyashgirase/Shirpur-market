# Shirpur Delivery System

A comprehensive multi-role delivery management system with real-time tracking, payment integration, and GPS-based location services.

## Features

- **Multi-Role System**: Customer portal, admin dashboard, and delivery partner interface
- **Real-time GPS Tracking**: Live location tracking for delivery partners
- **Payment Integration**: Razorpay payment gateway with UPI, card, and wallet support
- **Address Management**: GPS-based address collection with reverse geocoding
- **Product Management**: Admin interface for inventory and product management
- **Live Order Tracking**: Real-time order status and delivery tracking

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI Components**: shadcn/ui + Tailwind CSS
- **Maps**: Leaflet + React Leaflet
- **Payment**: Razorpay
- **Routing**: React Router DOM
- **State Management**: React Query + Local Storage

## Getting Started

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd shirpur-delivery-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create `.env` file with:
   ```
   VITE_RAZORPAY_KEY_ID=your_razorpay_key
   VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

## User Roles

- **Customer** (`/customer`): Browse products, place orders, track deliveries
- **Admin** (`/admin`): Manage products, orders, and track all deliveries
- **Delivery Partner** (`/delivery`): Accept orders, update delivery status, GPS tracking

## Deployment

The project is configured for Vercel deployment:

```bash
npm run build
```

Deploy to Vercel or any static hosting service.