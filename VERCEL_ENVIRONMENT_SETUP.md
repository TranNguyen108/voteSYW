# MongoDB Atlas Connection String Guide

## 🔍 How to get your MongoDB URI:

1. **Login to MongoDB Atlas:**
   - Go to https://cloud.mongodb.com
   - Login with your account

2. **Get Connection String:**
   - Click on your cluster
   - Click "Connect" button
   - Choose "Connect your application"
   - Copy the connection string

3. **Format should be:**
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/<database>?retryWrites=true&w=majority
   ```

## 🔧 Vercel Environment Variables Setup:

1. Go to https://vercel.com
2. Select your project
3. Go to Settings → Environment Variables
4. Add these variables:

```
Name: MONGODB_URI
Value: mongodb+srv://your-actual-connection-string

Name: ADMIN_USERNAME  
Value: your-admin-username

Name: ADMIN_PASSWORD
Value: your-admin-password

Name: NODE_ENV
Value: production
```

## ✅ After setting environment variables:

1. Go to Deployments tab
2. Click "Redeploy" on latest deployment
3. Test: https://vote-syw.vercel.app/api/health
4. Should return: `{"status":"ok","database":"connected"}`

## 🔍 Troubleshooting:

- Make sure MongoDB Atlas allows connections from anywhere (0.0.0.0/0)
- Check that your connection string doesn't contain `<password>` placeholder
- Verify all environment variables are set correctly
- Wait 1-2 minutes after redeploy for changes to take effect
