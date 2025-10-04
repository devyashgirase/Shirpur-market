#!/bin/bash
# Quick deployment script

echo "🚀 Building for production..."
npm run build:prod

echo "📦 Build complete! Deploy options:"
echo "1. Vercel: vercel --prod"
echo "2. Netlify: drag dist/ folder to netlify.com/drop"
echo "3. GitHub Pages: npm run deploy"

echo "✅ Your app is ready for deployment!"