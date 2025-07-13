# Vercel Deployment Test Checklist

## 🔍 Pre-deployment checklist:

### Files to verify:
- [ ] `api/index.js` exists and properly structured
- [ ] `vercel.json` points to api/index.js
- [ ] `package.json` has all dependencies
- [ ] `.env` file is ignored in git
- [ ] Environment variables set in Vercel dashboard

### Required Vercel Environment Variables:
```
MONGODB_URI=mongodb+srv://your-connection-string
ADMIN_USERNAME=your-admin-username  
ADMIN_PASSWORD=your-admin-password
NODE_ENV=production
```

## 🚀 Deployment steps:

1. **Push to repository:**
   ```bash
   git add .
   git commit -m "Fix Vercel serverless setup"
   git push
   ```

2. **Vercel auto-deploys from main branch**

3. **Test endpoints after deployment:**
   - Health check: `https://your-app.vercel.app/api/health`
   - Homepage: `https://your-app.vercel.app`
   - Admin login: `https://your-app.vercel.app/admin`

## 🐛 Troubleshooting:

### If still getting 500 errors:
1. Check Vercel function logs
2. Verify MongoDB Atlas IP whitelist (add 0.0.0.0/0)
3. Test database connection directly
4. Check environment variables in Vercel dashboard

### Common issues:
- **Connection timeout**: MongoDB Atlas IP restrictions
- **Function timeout**: Cold start or heavy queries
- **Module not found**: Missing dependencies in package.json
- **Environment variables**: Not set in Vercel dashboard

## 📊 Expected behavior:
- Homepage loads with team list
- Admin panel accessible with credentials
- Voting system works for each team
- Results page shows real-time charts
- No reload spam due to session tracking
