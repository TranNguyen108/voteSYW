# 🚨 Troubleshooting Vercel 500 Error - Database Connection

## Lỗi: "Đã xảy ra lỗi - Lỗi kết nối database"

### 1. Kiểm tra Environment Variables trong Vercel Dashboard

Vào **Vercel Dashboard** → **Your Project** → **Settings** → **Environment Variables**

Đảm bảo có đầy đủ 4 biến:

```
MONGODB_URI = mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
ADMIN_USERNAME = admin
ADMIN_PASSWORD = your-secure-password
NODE_ENV = production
```

### 2. Kiểm tra MongoDB Atlas Connection String

**Format đúng**:
```
mongodb+srv://username:password@cluster.mongodb.net/databasename?retryWrites=true&w=majority
```

**Lỗi thường gặp**:
- ❌ `mongodb+srv://username:<password>@cluster...` (chưa thay password)
- ❌ `mongodb+srv://username:pass word@cluster...` (có space trong password)
- ❌ `mongodb+srv://username:pass@word@cluster...` (ký tự đặc biệt chưa encode)

### 3. Kiểm tra MongoDB Atlas Settings

#### Network Access:
- Vào **MongoDB Atlas** → **Network Access**
- Phải có IP: `0.0.0.0/0` (Allow access from anywhere)
- Status: **ACTIVE**

#### Database User:
- Vào **Database Access** → **Database Users**
- User phải có role: **Read and write to any database**
- Password không được có ký tự đặc biệt như: `@`, `#`, `%`, `&`

### 4. Test Connection String

Để test connection string, tạo file test:

```javascript
// test-connection.js
const mongoose = require('mongoose');

const mongoUri = 'YOUR_MONGODB_URI_HERE';

mongoose.connect(mongoUri)
  .then(() => {
    console.log('✅ MongoDB connection successful!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err);
    process.exit(1);
  });
```

### 5. Fix Environment Variables

Nếu connection string có ký tự đặc biệt, encode chúng:

```
@ → %40
# → %23
% → %25
& → %26
space → %20
```

**Ví dụ**:
- Password: `my@pass#123`
- Encoded: `my%40pass%23123`

### 6. Common Solutions

#### Solution 1: Recreate MongoDB User
1. Vào **Database Access**
2. Delete user hiện tại
3. **Add New Database User**
4. Username: `admin` 
5. Password: Chỉ dùng chữ và số (không ký tự đặc biệt)
6. Role: **Read and write to any database**

#### Solution 2: Update Connection String
1. Vào **Clusters** → **Connect** → **Connect your application**
2. Copy connection string mới
3. Replace `<password>` với password thật
4. Update trong Vercel Environment Variables

#### Solution 3: Check Database Name
Đảm bảo database name trong connection string tồn tại:
```
mongodb+srv://user:pass@cluster.mongodb.net/YOUR_DATABASE_NAME
```

### 7. Vercel Logs Debug

Để xem logs chi tiết:
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# View logs
vercel logs https://your-app.vercel.app
```

### 8. Quick Fix Checklist

- [ ] Environment variables đã set đúng trong Vercel
- [ ] MongoDB connection string không có `<password>`
- [ ] Network Access: 0.0.0.0/0 allowed
- [ ] Database user có quyền read/write
- [ ] Password không có ký tự đặc biệt
- [ ] Database name tồn tại trong MongoDB Atlas

### 9. Emergency Backup Plan

Nếu vẫn lỗi, tạo cluster MongoDB mới:

1. **Tạo cluster mới** trong MongoDB Atlas
2. **Tạo user mới** với password đơn giản (chỉ chữ + số)
3. **Whitelist 0.0.0.0/0**
4. **Copy connection string mới**
5. **Update trong Vercel environment variables**
6. **Redeploy**
