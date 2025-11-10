@echo off
echo 🚀 Shirpur Market - Production Deployment
echo ========================================

echo.
echo 📦 Building production version...
call npm run build:prod
if %errorlevel% neq 0 (
    echo ❌ Build failed!
    pause
    exit /b 1
)

echo.
echo ✅ Build successful!
echo.
echo 📤 Pushing to repository...
git add .
git commit -m "Production deployment - %date% %time%"
git push origin main

echo.
echo 🎉 Deployment complete!
echo.
echo 📋 Next steps:
echo 1. Go to your hosting platform (Vercel/Netlify)
echo 2. Connect this repository if not already connected
echo 3. Deploy from main branch
echo.
echo 🌐 Your app will be live at your hosting URL
pause