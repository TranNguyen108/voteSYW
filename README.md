# 🗳️ MongoDB Atlas Voting System

Hệ thống bình chọn real-time với MongoDB Atlas, Socket.IO và anti-spam protection.

## ✨ Tính năng

- ✅ MongoDB Atlas Cloud Database
- ✅ Admin Dashboard với real-time stats
- ✅ Independent team voting sessions  
- ✅ QR Code voting với session tracking
- ✅ Anti-spam protection (reload blocking)
- ✅ Real-time result charts với Chart.js
- ✅ Rate limiting (10 votes/minute/IP)
- ✅ Responsive UI với Tailwind CSS

## 🚀 Deploy lên Vercel

### 1. Chuẩn bị MongoDB Atlas

1. Tạo account tại [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Tạo cluster mới (Free tier M0)
3. Tạo database user với quyền read/write
4. Whitelist IP address (0.0.0.0/0 cho production)
5. Copy connection string

### 2. Deploy lên Vercel

1. **Push code lên GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/your-repo.git
   git push -u origin main
   ```

2. **Import project vào Vercel:**
   - Vào [vercel.com](https://vercel.com)
   - Click "New Project" 
   - Import từ GitHub repository

3. **Cấu hình Environment Variables:**
   Trong Vercel dashboard, thêm các biến môi trường:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=your-secure-password
   NODE_ENV=production
   ```

4. **Deploy:**
   - Click "Deploy"
   - Vercel sẽ tự động build và deploy

### 3. Sau khi deploy

1. **Truy cập ứng dụng:**
   - Main: `https://your-app.vercel.app`
   - Admin: `https://your-app.vercel.app/admin`

2. **Tạo teams và test:**
   - Login admin panel
   - Thêm teams
   - Test voting flow

## 🛠️ Cài đặt và Chạy

### Yêu cầu hệ thống
- Node.js (v14 trở lên)
- MongoDB (local hoặc cloud)
- NPM

### Cài đặt
```bash
# Clone hoặc tải dự án về
cd SYW

# Cài đặt dependencies
npm install

# Chạy ứng dụng
npm start
```

### Cấu hình MongoDB
Mặc định ứng dụng kết nối tới `mongodb://localhost:27017/voting_system`

Để thay đổi, sửa file `app.js`:
```javascript
mongoose.connect('mongodb://your-mongodb-url', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
```

## 🌐 Sử dụng

1. **Khởi động server**: `npm start`
2. **Truy cập**: `http://localhost:3000`
3. **Thêm đội thi**: Vào Admin → Thêm đội thi
4. **Bắt đầu bình chọn**: Vote → Chọn đội → Hiển thị QR
5. **Xem kết quả**: Result → Biểu đồ realtime

## 📱 Quy trình bình chọn

1. Admin chọn đội thi và hiển thị mã QR
2. Khán giả quét QR bằng điện thoại
3. Tự động ghi nhận vote vào database
4. Kết quả cập nhật realtime trên biểu đồ

## 🎨 Giao diện

- **Bootstrap 5**: Responsive design
- **FontAwesome**: Icons
- **Chart.js**: Biểu đồ
- **Socket.io**: Realtime updates
- **Custom CSS**: Thiết kế hiện đại

## 📂 Cấu trúc dự án

```
/SYW
  /models          # MongoDB schemas
    team.js        # Schema đội thi
    vote.js        # Schema bình chọn
    config.js      # Schema cấu hình
  /routes          # Express routes
    admin.js       # Routes quản trị
    vote.js        # Routes bình chọn
    result.js      # Routes kết quả
    submit.js      # Routes submit vote
  /public          # Static files
    /css
      style.css    # CSS tùy chỉnh
    /js            # JavaScript files
  /views           # EJS templates
    index.ejs      # Trang chủ
    admin.ejs      # Trang admin
    vote.ejs       # Danh sách đội thi
    vote_team.ejs  # Trang bình chọn với QR
    result.ejs     # Trang kết quả
    submit.ejs     # Trang cảm ơn
  app.js           # Main application file
  package.json     # Dependencies
```

## 🚀 Deploy

### Heroku
1. Tạo app trên Heroku
2. Thêm MongoDB Atlas add-on
3. Deploy code qua Git

### VPS/Server
1. Upload code lên server
2. Cài đặt Node.js và MongoDB
3. Chạy `npm start`
4. Cấu hình Nginx/Apache (tùy chọn)

### Environment Variables
```bash
PORT=3000
MONGODB_URI=mongodb://localhost:27017/voting_system
```

## 🔧 Tùy chỉnh

- **Thời gian bình chọn**: Thay đổi trong Admin
- **Giao diện**: Chỉnh sửa CSS trong `/public/css/style.css`
- **Database**: Cấu hình trong `app.js`

## 📞 Hỗ trợ

Nếu gặp vấn đề khi sử dụng, vui lòng kiểm tra:
1. MongoDB đã chạy chưa
2. Port 3000 có bị chiếm dụng không
3. Dependencies đã cài đầy đủ chưa

## 📄 License

MIT License - Tự do sử dụng và phát triển.

---

**Phát triển bởi**: Bình Chọn  
**Công nghệ**: Node.js + Express + MongoDB + Socket.io + Chart.js
