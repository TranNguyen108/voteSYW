# 🚀 Quick Deploy Guide - MongoDB Atlas Voting System

## Step 1: MongoDB Atlas Setup (5 phút)

1. **Tạo account**: [https://cloud.mongodb.com](https://cloud.mongodb.com)
2. **Tạo cluster**: 
   - Chọn "Build a Database"
   - Chọn "FREE" (M0 Sandbox)
   - Chọn region gần nhất
3. **Tạo user**:
   - Database Access → Add New Database User
   - Authentication Method: Password
   - Username/Password (ghi nhớ)
   - Database User Privileges: Read and write
4. **Whitelist IP**:
   - Network Access → Add IP Address
   - Chọn "Allow access from anywhere" (0.0.0.0/0)
5. **Get connection string**:
   - Cluster → Connect → Connect your application
   - Copy connection string
   - Replace `<password>` với password thật

## Step 2: GitHub Push (2 phút)

```bash
# Trong folder SYW
git init
git add .
git commit -m "MongoDB Atlas Voting System"
git branch -M main
git remote add origin https://github.com/YOURUSERNAME/YOURREPO.git
git push -u origin main
```

## Step 3: Vercel Deploy (3 phút)

1. **Vào Vercel**: [https://vercel.com](https://vercel.com)
2. **Đăng nhập** với GitHub
3. **Import Project**:
   - "New Project" 
   - "Import Git Repository"
   - Chọn repo vừa push
4. **Configure**:
   - Project Name: `voting-system` (hoặc tên khác)
   - Framework Preset: Other
   - Root Directory: `./`
5. **Environment Variables**:
   ```
   MONGODB_URI = mongodb+srv://username:password@cluster.mongodb.net/database
   ADMIN_USERNAME = admin
   ADMIN_PASSWORD = yourpassword123
   NODE_ENV = production
   ```
6. **Deploy**: Click "Deploy"

## Step 4: Test (2 phút)

1. **Homepage**: `https://your-app.vercel.app`
2. **Admin**: `https://your-app.vercel.app/admin`
   - Login với ADMIN_USERNAME/ADMIN_PASSWORD
   - Thêm teams
3. **Voting**: `https://your-app.vercel.app/vote`
   - Chọn team → QR code → Vote
4. **Results**: `https://your-app.vercel.app/result`

## ⚡ Total Time: ~12 phút

## 🔧 Troubleshooting

**500 Error**: Check environment variables trong Vercel
**Can't connect to database**: Verify MongoDB URI
**Admin login fails**: Check ADMIN_USERNAME/ADMIN_PASSWORD
**QR not working**: Clear browser cache và test

## 📱 Features Working

✅ QR Code voting  
✅ Anti-spam protection  
✅ Real-time results  
✅ Admin dashboard  
✅ Mobile responsive  
✅ Rate limiting  
✅ Session tracking  

## 🎯 Ready for Production!

Hệ thống có thể handle 50+ concurrent users với MongoDB Atlas M0 (free tier).
