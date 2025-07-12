#!/bin/bash

echo "🚀 Deploying MongoDB Atlas Voting System to Vercel..."

# Check if required files exist
if [ ! -f "vercel.json" ]; then
    echo "❌ vercel.json not found!"
    exit 1
fi

if [ ! -f "index.js" ]; then
    echo "❌ index.js not found!"
    exit 1
fi

if [ ! -f "package.json" ]; then
    echo "❌ package.json not found!"
    exit 1
fi

echo "✅ All required files present"

# Check environment variables
if [ -z "$MONGODB_URI" ]; then
    echo "⚠️  MONGODB_URI not set - remember to configure in Vercel dashboard"
fi

if [ -z "$ADMIN_USERNAME" ]; then
    echo "⚠️  ADMIN_USERNAME not set - remember to configure in Vercel dashboard"
fi

if [ -z "$ADMIN_PASSWORD" ]; then
    echo "⚠️  ADMIN_PASSWORD not set - remember to configure in Vercel dashboard"
fi

echo "📦 Installing dependencies..."
npm install

echo "✅ Ready for Vercel deployment!"
echo ""
echo "Next steps:"
echo "1. Push to GitHub: git add . && git commit -m 'Deploy setup' && git push"
echo "2. Import to Vercel: https://vercel.com/new"
echo "3. Set environment variables in Vercel dashboard"
echo "4. Deploy!"
echo ""
echo "Environment Variables needed:"
echo "- MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database"
echo "- ADMIN_USERNAME=admin"
echo "- ADMIN_PASSWORD=your-secure-password"
echo "- NODE_ENV=production"
