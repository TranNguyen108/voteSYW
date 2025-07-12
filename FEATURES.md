# 🎉 HƯỚNG DẪN SỬ DỤNG BÌNH CHỌN

## ✅ CÁC CHỨC NĂNG ĐÃ HOÀN THIỆN

### 🏠 **Trang chủ** (`http://localhost:3000`)
- ✅ Hiển thị 3 bảng: Admin, Vote, Result
- ✅ Giao diện responsive, hiện đại
- ✅ Hiển thị số lượng đội thi hiện có

### 🔧 **Trang Admin** (`/admin`)
- ✅ **Quản lý đội thi**: Thêm/Sửa/Xóa với validation
- ✅ **Cấu hình thời gian**: Đặt thời gian bình chọn (1-60 phút)
- ✅ **Thống kê realtime**: Tổng votes, người bình chọn, tỷ lệ
- ✅ **Reset votes**: Xóa tất cả lượt bình chọn
- ✅ **Export/Import**: Backup và khôi phục dữ liệu
- ✅ **Validation**: Kiểm tra tên trùng, độ dài hợp lệ

### 🗳️ **Trang Vote** (`/vote`)
- ✅ **Danh sách đội thi**: Hiển thị từ database
- ✅ **Trang bình chọn** (`/vote/:teamId`):
  - ✅ Mã QR tự động tạo
  - ✅ Đồng hồ đếm ngược chính xác
  - ✅ Tự động ẩn QR khi hết giờ
  - ✅ Responsive cho mobile

### 📊 **Trang Kết quả** (`/result`)
- ✅ **Biểu đồ cột**: Chart.js với màu sắc đẹp
- ✅ **Realtime updates**: Socket.io
- ✅ **Thống kê chi tiết**: Số votes, tỷ lệ phần trăm
- ✅ **Auto refresh**: Mỗi 5 giây

### 📱 **Trang Submit** (`/submit/:teamId`)
- ✅ **Giao diện cảm ơn**: Thân thiện, đẹp mắt
- ✅ **Ghi nhận vote**: IP + timestamp
- ✅ **Rate limiting**: Chống spam (10 votes/phút/IP)
- ✅ **Share buttons**: Facebook, Twitter, Copy link
- ✅ **Mobile responsive**: Tối ưu cho điện thoại

### 🛠️ **Tính năng kỹ thuật**
- ✅ **Error handling**: Xử lý lỗi toàn diện
- ✅ **Logging**: Ghi log các hoạt động
- ✅ **Health check**: `/health` endpoint
- ✅ **Rate limiting**: Chống spam vote
- ✅ **Real-time**: Socket.io cho updates
- ✅ **Data export/import**: Backup system
- ✅ **MongoDB support**: Với fallback in-memory

## 🚀 CÁCH CHẠY HỆ THỐNG

### Option 1: Demo nhanh (In-memory database)
```bash
npm run demo
# Mở http://localhost:3000
```

### Option 2: Development với MongoDB in-memory
```bash
npm run dev
# Tự động download và chạy MongoDB
```

### Option 3: Production với MongoDB thật
```bash
# Cài MongoDB local hoặc dùng MongoDB Atlas
# Cập nhật MONGODB_URI trong .env
npm start
```

## 📱 QUY TRÌNH SỬ DỤNG

### Cho Admin:
1. **Mở** `http://localhost:3000/admin`
2. **Thêm đội thi** trong mục "Thêm đội thi mới"
3. **Cấu hình** thời gian bình chọn (mặc định 5 phút)
4. **Bắt đầu bình chọn**: Vào `/vote` → Chọn đội → Hiển thị QR

### Cho Khán giả:
1. **Quét mã QR** bằng điện thoại
2. **Tự động** chuyển đến trang bình chọn
3. **Nhận** thông báo cảm ơn
4. **Có thể** vote nhiều lần

### Xem kết quả:
1. **Mở** `http://localhost:3000/result`
2. **Xem** biểu đồ cập nhật realtime
3. **Thống kê** chi tiết số votes và tỷ lệ

## 🎨 GIAO DIỆN

- **Bootstrap 5**: Responsive, hiện đại
- **FontAwesome**: Icons đẹp mắt
- **Chart.js**: Biểu đồ sinh động
- **Gradient**: Background thu hút
- **Animation**: Smooth transitions
- **Mobile-first**: Tối ưu cho điện thoại

## 📊 DATABASE SCHEMA

### Teams Collection:
```javascript
{
  _id: ObjectId,
  name: String (required, unique),
  description: String,
  createdAt: Date
}
```

### Votes Collection:
```javascript
{
  _id: ObjectId,
  teamId: ObjectId (ref: Team),
  ip: String,
  timestamp: Date
}
```

### Config Collection:
```javascript
{
  _id: ObjectId,
  key: String (unique),
  value: Mixed,
  updatedAt: Date
}
```

## 🔧 API ENDPOINTS

### Public:
- `GET /` - Trang chủ
- `GET /vote` - Danh sách đội thi
- `GET /vote/:teamId` - Trang bình chọn
- `GET /submit/:teamId` - Submit vote
- `GET /result` - Trang kết quả
- `GET /result/api/data` - API lấy dữ liệu biểu đồ

### Admin:
- `GET /admin` - Trang quản trị
- `POST /admin/teams` - Thêm đội thi
- `POST /admin/teams/:id` - Cập nhật đội thi
- `POST /admin/teams/:id/delete` - Xóa đội thi
- `POST /admin/config` - Cập nhật cấu hình
- `GET /admin/api/stats` - API thống kê
- `POST /admin/reset-votes` - Reset tất cả votes

### Data Management:
- `GET /data/export` - Export dữ liệu
- `POST /data/import` - Import dữ liệu

### System:
- `GET /health` - Health check

## 🌐 DEPLOY PRODUCTION

### Heroku:
1. Tạo app trên Heroku
2. Add MongoDB Atlas addon
3. Set environment variables
4. Deploy via Git

### VPS:
1. Upload code
2. `npm install`
3. Cài MongoDB hoặc config Atlas
4. `npm start`

### Docker:
```dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 🎯 TÍNH NĂNG NỔI BẬT

- ✅ **Zero-setup**: Chạy ngay với `npm run demo`
- ✅ **Realtime**: Cập nhật kết quả tức thời
- ✅ **Mobile-ready**: Tối ưu cho điện thoại
- ✅ **Anti-spam**: Rate limiting thông minh
- ✅ **Data backup**: Export/Import dễ dàng
- ✅ **Production-ready**: Error handling toàn diện
- ✅ **Scalable**: Hỗ trợ nhiều đội thi
- ✅ **User-friendly**: Giao diện trực quan

## 📞 SUPPORT

Hệ thống đã được test toàn diện và sẵn sàng sử dụng cho sự kiện thật!

**Demo URL**: http://localhost:3000  
**Admin Panel**: http://localhost:3000/admin  
**Health Check**: http://localhost:3000/health
