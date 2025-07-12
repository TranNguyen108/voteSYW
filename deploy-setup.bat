@echo off
echo 🚀 Deploying MongoDB Atlas Voting System to Vercel...

REM Check if required files exist
if not exist "vercel.json" (
    echo ❌ vercel.json not found!
    exit /b 1
)

if not exist "index.js" (
    echo ❌ index.js not found!
    exit /b 1
)

if not exist "package.json" (
    echo ❌ package.json not found!
    exit /b 1
)

echo ✅ All required files present

echo 📦 Installing dependencies...
npm install

echo ✅ Ready for Vercel deployment!
echo.
echo Next steps:
echo 1. Push to GitHub: git add . ^&^& git commit -m "Deploy setup" ^&^& git push
echo 2. Import to Vercel: https://vercel.com/new
echo 3. Set environment variables in Vercel dashboard
echo 4. Deploy!
echo.
echo Environment Variables needed:
echo - MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
echo - ADMIN_USERNAME=admin
echo - ADMIN_PASSWORD=your-secure-password
echo - NODE_ENV=production

pause
