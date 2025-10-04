@echo off
echo Building project for deployment...
npm run build:prod

echo.
echo ✅ Build complete! Choose deployment option:
echo.
echo 1. Netlify Drop: Drag dist/ folder to netlify.com/drop
echo 2. Surge: Run "surge" in dist/ folder
echo 3. Firebase: Run "firebase deploy"
echo.
echo Your dist/ folder is ready for upload!
pause