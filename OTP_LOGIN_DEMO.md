# 🔐 OTP-Based Authentication System Demo

## Overview
The Shirpur Delivery System now features a secure OTP-based authentication system with role-based UI personalization.

## 🚀 How to Test the OTP Login System

### 1. Start the Application
```bash
npm run dev
```

### 2. Access the Login Page
- Navigate to `http://localhost:5173`
- You'll see the new OTP login interface

### 3. Test the Login Flow

#### Step 1: Enter Phone Number
- Enter any 10-digit phone number (e.g., `9876543210`)
- Click "Send OTP"

#### Step 2: OTP Verification
- **Demo Mode**: The OTP will be displayed in an alert popup
- Enter the 6-digit OTP shown in the alert
- Click "Verify OTP"

#### Step 3: Profile Setup (First-Time Users)
- If it's a first-time login, you'll see the profile setup screen
- Enter your full name
- Select your role:
  - **Customer**: Browse and order products
  - **Admin**: Manage system and orders
  - **Delivery**: Handle deliveries
- Click "Complete Setup"

### 4. Role-Based Dashboard Access
After successful login, you'll be redirected to your role-specific dashboard:

- **Customer** → `/customer` - Product catalog with personalized welcome
- **Admin** → `/admin` - Admin dashboard with management tools
- **Delivery** → `/delivery` - Delivery tasks and route management

## 🎯 Key Features Demonstrated

### Security Features
- ✅ OTP expires after 5 minutes
- ✅ Maximum 3 OTP attempts per phone number
- ✅ Secure session management
- ✅ Role-based access control
- ✅ First-time login completion tracking

### User Experience
- ✅ Personalized welcome messages based on role
- ✅ Role-specific UI components and navigation
- ✅ Seamless logout and session management
- ✅ Mobile-responsive design
- ✅ Real-time OTP timer

### Database Integration
- ✅ User authentication stored in database
- ✅ OTP verification tracking
- ✅ Session persistence
- ✅ Role management

## 📱 Demo Phone Numbers for Testing

You can use any 10-digit phone number for testing. Here are some examples:

| Phone Number | Suggested Role | Purpose |
|--------------|----------------|---------|
| `9876543210` | Admin | Test admin features |
| `9876543211` | Customer | Test customer experience |
| `9876543212` | Delivery | Test delivery partner features |

## 🔄 Subsequent Logins

For users who have completed first-time setup:
1. Enter phone number
2. Enter OTP (displayed in alert)
3. Automatically redirected to role-specific dashboard

## 🛡️ Security Implementation

### OTP Management
- OTPs are stored securely in the database
- Automatic cleanup of expired OTPs
- Attempt limiting to prevent abuse
- Secure verification process

### Session Security
- JWT-like session tokens stored locally
- Role-based route protection
- Automatic session validation
- Secure logout functionality

### Database Schema
```sql
-- Users table for authentication
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    phone VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255),
    role VARCHAR(20) NOT NULL,
    is_first_login_complete BOOLEAN DEFAULT false,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- OTP verification table
CREATE TABLE otp_verifications (
    id SERIAL PRIMARY KEY,
    phone VARCHAR(20) NOT NULL,
    otp VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    attempts INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🎨 UI Personalization Examples

### Customer Dashboard
- Product browsing interface
- Shopping cart and order history
- Loyalty points display
- Personalized product recommendations

### Admin Dashboard
- System management tools
- Order and inventory management
- Analytics and reporting
- User management interface

### Delivery Dashboard
- Available delivery tasks
- Route optimization
- Earnings tracking
- Performance metrics

## 🔧 Configuration

### Environment Variables
```env
# SMS Service (for production)
VITE_SMS_API_KEY=your_sms_api_key
VITE_SMS_SENDER_ID=SHIRPUR

# Database Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
```

### Demo Mode
- In demo mode, OTPs are displayed via browser alerts
- For production, integrate with SMS providers like Twilio, AWS SNS, or local SMS gateways
- Update the `sendSMS` method in `authService.ts`

## 🚀 Production Deployment

1. **Configure SMS Service**: Replace the mock SMS implementation with a real SMS provider
2. **Update Database**: Run the updated schema in your production database
3. **Environment Setup**: Configure production environment variables
4. **Security Review**: Implement additional security measures as needed

## 📞 Support

The OTP authentication system is now fully integrated with:
- ✅ Existing user roles and permissions
- ✅ Database connectivity (Supabase/MySQL)
- ✅ Real-time features
- ✅ Mobile responsiveness
- ✅ Session management

For any issues or questions, check the browser console for detailed logs and error messages.