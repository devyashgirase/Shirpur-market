# 🚀 Supabase Complete Setup Instructions

## Step 1: Supabase Dashboard Setup

1. **Login to Supabase**: Go to [supabase.com](https://supabase.com) and login
2. **Create New Project**: Click "New Project"
3. **Project Details**:
   - Organization: Select your organization
   - Name: `shirpur-delivery-system`
   - Database Password: Create a strong password
   - Region: Choose closest to India (ap-south-1)
4. **Wait for Setup**: Project creation takes 2-3 minutes

## Step 2: Run Database Schema

1. **Open SQL Editor**: In Supabase dashboard, go to "SQL Editor"
2. **Copy Schema**: Copy entire content from `COMPLETE_SUPABASE_SCHEMA.sql`
3. **Paste and Run**: Paste in SQL Editor and click "Run"
4. **Verify Success**: You should see success messages

## Step 3: Get API Keys

1. **Go to Settings**: Click "Settings" → "API"
2. **Copy Keys**:
   - Project URL: `https://your-project-id.supabase.co`
   - Anon Public Key: `eyJ...` (long key)

## Step 4: Update Environment Variables

Update your `.env` file:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_RAZORPAY_KEY_ID=your_razorpay_key
```

## Step 5: Verify Tables Created

In Supabase dashboard, go to "Table Editor" and verify these tables exist:

✅ **Core Tables**:
- `products` (15 sample products)
- `customers` (5 sample customers)  
- `delivery_agents` (5 sample agents)
- `orders` (5 sample orders)
- `order_items` (order details)

✅ **Cart Tables**:
- `user_carts` (user cart containers)
- `cart_items` (cart products)

✅ **Additional Tables**:
- `delivery_tracking` (GPS tracking)
- `feedback` (reviews & ratings)
- `inventory_logs` (stock management)
- `carousel_banners` (homepage banners)

## Step 6: Test Data Access

Run this test in browser console:

```javascript
// Test Supabase connection
fetch('https://your-project-id.supabase.co/rest/v1/products', {
  headers: {
    'apikey': 'your-anon-key',
    'Authorization': 'Bearer your-anon-key'
  }
})
.then(res => res.json())
.then(data => console.log('Products:', data));
```

## Step 7: Start Application

```bash
npm run dev
```

## ✅ What You Get

### Sample Data Included:
- **15 Products**: Rice, Dal, Vegetables, Fruits, etc.
- **5 Customers**: With addresses and loyalty points
- **5 Delivery Agents**: With ratings and locations
- **5 Orders**: Different statuses (pending, confirmed, delivered)
- **Cart Items**: Pre-filled carts for testing
- **5 Banners**: Homepage carousel content

### Features Ready:
- ✅ Customer registration & login
- ✅ Product browsing & cart
- ✅ Order placement & tracking
- ✅ Admin order management
- ✅ Delivery agent tracking
- ✅ Real-time updates
- ✅ Payment integration ready
- ✅ Multi-language support

## 🔧 Troubleshooting

### If Tables Not Created:
1. Check SQL Editor for error messages
2. Run schema in smaller chunks if needed
3. Ensure RLS policies are applied

### If Data Not Saving:
1. Verify API keys in `.env`
2. Check browser network tab for errors
3. Ensure RLS policies allow operations

### If App Not Loading:
1. Restart development server: `npm run dev`
2. Clear browser cache
3. Check console for JavaScript errors

## 🚀 Production Deployment

After local testing works:

1. **Vercel Deployment**:
   ```bash
   npm run build
   # Deploy to Vercel with environment variables
   ```

2. **Environment Variables in Vercel**:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_RAZORPAY_KEY_ID`

## 📞 Support

If you face any issues:
1. Check Supabase logs in dashboard
2. Verify all environment variables
3. Test API endpoints manually
4. Check browser console for errors

**🎉 Your Shirpur Delivery System is now ready with complete database and sample data!**