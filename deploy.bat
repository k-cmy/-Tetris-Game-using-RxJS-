@echo off
echo 🚀 Building Tetris Game for Deployment...
echo.

npm run build

echo.
echo ✅ Build complete! 
echo.
echo 📁 Your deployment files are ready in the 'dist' folder
echo.
echo 🌐 Quick Deployment Options:
echo    1. Drag 'dist' folder to vercel.com
echo    2. Drag 'dist' folder to netlify.com  
echo    3. Run 'surge' inside the 'dist' folder
echo.
echo 🎮 Your Tetris game is ready to deploy!
pause 