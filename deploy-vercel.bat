@echo off
echo 🚀 Deploying to Vercel...
echo.

echo 📦 Building project...
npm run build
if %errorlevel% neq 0 (
    echo ❌ Build failed!
    pause
    exit /b 1
)

echo ✅ Build successful!
echo.
echo 🌐 Ready for Vercel deployment
echo.
echo Next steps:
echo 1. Install Vercel CLI: npm i -g vercel
echo 2. Login to Vercel: vercel login
echo 3. Deploy: vercel --prod
echo.
pause