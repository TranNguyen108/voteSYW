#!/bin/bash

echo "🧪 Testing Vercel deployment setup..."

# Check if required files exist
echo "📁 Checking files..."
if [ ! -f "api/index.js" ]; then
    echo "❌ api/index.js missing!"
    exit 1
fi

if [ ! -f "vercel.json" ]; then
    echo "❌ vercel.json missing!"
    exit 1
fi

echo "✅ Required files present"

# Check environment variables
echo "🔍 Checking environment variables..."
if [ -z "$MONGODB_URI" ]; then
    echo "⚠️  MONGODB_URI not set locally - ensure it's set in Vercel"
fi

if [ -z "$ADMIN_USERNAME" ]; then
    echo "⚠️  ADMIN_USERNAME not set locally - ensure it's set in Vercel"
fi

echo "📦 Installing dependencies..."
npm install

echo "✅ Ready for Vercel deployment!"
echo ""
echo "🚀 Deploy commands:"
echo "1. git add ."
echo "2. git commit -m 'Fix Vercel serverless setup'"
echo "3. git push"
echo "4. Vercel will auto-deploy"
echo ""
echo "🔍 After deploy, test:"
echo "- Health check: https://your-app.vercel.app/api/health"
echo "- Homepage: https://your-app.vercel.app"
echo "- Admin: https://your-app.vercel.app/admin"
