# Deployment Instructions

## Prerequisites
1. Get your actual Supabase API key from your Supabase project dashboard
2. Replace the placeholder API key in `.env.production`

## Vercel Deployment

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel --prod
   ```

4. **Set Environment Variables in Vercel Dashboard**:
   - `VITE_SUPABASE_URL=https://ppujwprkgsjkedybpvmc.supabase.co`
   - `VITE_SUPABASE_ANON_KEY=your_actual_supabase_key`
   - `VITE_RAZORPAY_KEY_ID=your_razorpay_key`
   - `VITE_GOOGLE_MAPS_API_KEY=AIzaSyBpjCsYmHwmxAiOPyfz2EaYZSTFVynU7To`

## Netlify Deployment

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Deploy to Netlify**:
   - Drag and drop the `dist` folder to Netlify
   - Or connect your GitHub repo to Netlify

3. **Set Environment Variables in Netlify**:
   Same as Vercel environment variables above.

## Important Notes

- The app will automatically use Supabase in production
- Make sure your Supabase database has the required tables (run `supabase-schema.sql`)
- Test the connection locally first with the production environment variables

## Testing Production Build Locally

```bash
npm run build
npm run preview
```

This will build and serve the production version locally for testing.