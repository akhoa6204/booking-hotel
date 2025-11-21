# 🚀 Hướng Dẫn Chạy và Test - Hotel Management System

## 📋 Mục Lục
1. [Cài Đặt và Setup](#cài-đặt-và-setup)
2. [Chạy Ứng Dụng](#chạy-ứng-dụng)
3. [Test API](#test-api)
4. [Troubleshooting](#troubleshooting)
5. [Cấu Trúc Dự Án](#cấu-trúc-dự-án)

---

## 🔧 Cài Đặt và Setup

### 1. Yêu Cầu Hệ Thống
- **Node.js** >= 18.x
- **MySQL** >= 8.0
- **npm** hoặc **yarn**

### 2. Clone và Cài Đặt Dependencies
```bash
# Clone repository (nếu chưa có)
git clone <repository-url>
cd hotel-backend-updated

# Cài đặt dependencies
npm install
```

### 3. Cấu Hình Database
```bash
# Copy file environment
cp .env.example .env

# Chỉnh sửa DATABASE_URL trong .env
DATABASE_URL="mysql://username:password@localhost:3306/hotel_db"
```

### 4. Setup Database
```bash
# Tạo database và migrate schema
npm run prisma:migrate

# Generate Prisma client
npm run prisma:generate
```

---

## 🏃‍♂️ Chạy Ứng Dụng

### 1. Chạy Development Server
```bash
# Chạy server với nodemon (auto-reload)
npm run dev

# Hoặc chạy production
npm start
```

**Server sẽ chạy tại:** `http://localhost:3001`

### 2. Kiểm Tra Health
```bash
curl http://localhost:3001/health
# Response: {"ok": true}
```

### 3. Mở Prisma Studio (Optional)
```bash
# Mở database GUI
npm run prisma:studio
```
**Prisma Studio:** `http://localhost:5555`

---

## 🧪 Test API

### 1. Setup Test Data
```bash
# Tạo dữ liệu test và promote manager role
npm run test:setup
```

### 2. Chạy Test Suite

#### Tùy chọn A: Node.js Test Runner (Recommended)
```bash
npm run test:api
```
- ✅ Test tất cả 28 endpoints
- ✅ Ghi log chi tiết vào `api-test-results.log`
- ✅ Hiển thị kết quả real-time

#### Tùy chọn B: Jest Test Suite
```bash
npm run test:api:jest
```
- ✅ Test có cấu trúc với assertions
- ✅ Ghi log vào `jest-test-results.log`
- ✅ Parallel execution

#### Tùy chọn C: REST Client (VS Code)
```bash
# Cài extension: humao.rest-client
# Mở file: api-test.http
# Click "Send Request" trên từng test
```

#### Tùy chọn D: Postman
```bash
# Import file: api-test.postman_collection.json
# Set variable: {{baseUrl}} = http://localhost:3001
# Run collection
```

### 3. Xem Kết Quả Test
```bash
# Xem log chi tiết
cat api-test-results.log

# Xem summary
cat TEST-RESULTS-SUMMARY.md
```

---

## 📊 Test Coverage

### ✅ APIs Được Test (28 endpoints)

| Module | Endpoints | Status |
|--------|-----------|--------|
| **Health** | 1 | ✅ Working |
| **Authentication** | 4 | ✅ Working |
| **Hotels** | 2 | ✅ Working |
| **Services** | 4 | ✅ Working |
| **Rooms** | 3 | ✅ Working |
| **Promotions** | 4 | ✅ Working |
| **Search** | 1 | ⚠️ Partial |
| **Bookings** | 5 | ✅ Working |
| **Payments** | 1 | ✅ Working |
| **Reviews** | 1 | ⚠️ Expected |
| **Notifications** | 2 | ✅ Working |
| **Dashboard** | 1 | ✅ Working |

### 📝 Sample Test Data
- **Hotel:** "Sample Test Hotel"
- **Room:** "Standard Test Room" 
- **Service:** "Airport Transfer"
- **Users:** customer@test.com, manager@test.com

---

## 🔍 API Endpoints

### 🔐 Authentication
```bash
POST /auth/register          # Đăng ký user
POST /auth/login            # Đăng nhập
POST /auth/password/request-reset  # Yêu cầu reset password
POST /auth/password/reset   # Reset password
```

### 🏨 Hotels
```bash
GET  /hotels                # Lấy danh sách khách sạn (public)
POST /hotels                # Tạo/cập nhật khách sạn (MANAGER)
```

### 🛎️ Services
```bash
GET    /services            # Lấy dịch vụ
POST   /services            # Tạo dịch vụ (MANAGER)
PUT    /services/:id         # Cập nhật dịch vụ (MANAGER)
DELETE /services/:id         # Xóa dịch vụ (MANAGER)
```

### 🛏️ Rooms
```bash
GET  /rooms                 # Lấy danh sách phòng
POST /rooms                 # Tạo phòng (MANAGER)
PUT  /rooms/:id             # Cập nhật phòng (MANAGER)
```

### 🎉 Promotions
```bash
GET    /promotions           # Lấy khuyến mãi (MANAGER)
POST   /promotions           # Tạo khuyến mãi (MANAGER)
PUT    /promotions/:id        # Cập nhật khuyến mãi (MANAGER)
DELETE /promotions/:id        # Xóa khuyến mãi (MANAGER)
```

### 🔍 Search
```bash
GET /search/rooms           # Tìm phòng với filters
```

### 📅 Bookings
```bash
GET   /bookings             # Lấy booking của customer
GET   /bookings/all         # Lấy tất cả bookings (MANAGER)
POST  /bookings             # Tạo booking (CUSTOMER)
PATCH /bookings/:id/status  # Cập nhật trạng thái (MANAGER)
POST  /bookings/:id/cancel  # Hủy booking
```

### 💳 Payments
```bash
POST /payments/:id/pay      # Thanh toán booking
```

### ⭐ Reviews
```bash
POST /reviews               # Tạo đánh giá
```

### 🔔 Notifications
```bash
GET   /notifications        # Lấy thông báo
PATCH /notifications/:id/read # Đánh dấu đã đọc
```

### 📊 Dashboard
```bash
GET /dashboard/overview     # Báo cáo tổng quan (MANAGER)
```

---

## 🐛 Troubleshooting

### ❌ Database Connection Error
```bash
# Kiểm tra MySQL service
sudo service mysql start

# Kiểm tra DATABASE_URL trong .env
cat .env

# Test connection
npm run prisma:studio
```

### ❌ Port Already in Use
```bash
# Kill process trên port 3001
npx kill-port 3001

# Hoặc đổi port trong .env
PORT=3002
```

### ❌ Prisma Errors
```bash
# Reset database
npm run prisma:migrate

# Regenerate client
npm run prisma:generate
```

### ❌ Test Failures
```bash
# Clear test data
npm run prisma:studio
# Xóa users có email chứa 'test.com'

# Re-run setup
npm run test:setup
```

### ❌ Manager Permission Denied
```bash
# Promote manager role manually
npm run prisma:studio
# Hoặc chạy script promote
node promote-manager.js
```

---

## 📁 Cấu Trúc Dự Án

```
hotel-backend-updated/
├── 📁 src/
│   ├── 📁 controllers/     # Business logic
│   ├── 📁 routes/         # API routes
│   ├── 📁 middleware/     # Auth middleware
│   ├── 📁 lib/           # Database connection
│   ├── 📁 utils/         # Helper functions
│   ├── 📄 app.js         # Express app setup
│   └── 📄 server.js      # Server entry point
├── 📁 prisma/
│   ├── 📄 schema.prisma  # Database schema
│   └── 📁 migrations/    # Database migrations
├── 📁 tests/
│   ├── 📄 api-test-detailed.js    # Main test runner
│   ├── 📄 api-test.spec.js        # Jest tests
│   ├── 📄 setup-test.js          # Test data setup
│   └── 📄 jest.config.js          # Jest config
├── 📄 package.json       # Dependencies & scripts
├── 📄 .env              # Environment variables
└── 📄 README.md         # Project documentation
```

---

## 🎯 Quick Start Commands

```bash
# 1. Setup (chỉ chạy 1 lần)
npm install
npm run prisma:migrate
npm run prisma:generate
npm run test:setup

# 2. Chạy ứng dụng
npm run dev

# 3. Test API
npm run test:api

# 4. Xem database
npm run prisma:studio
```

---

## 📞 Hỗ Trợ

### 🔗 Useful URLs
- **API Base:** http://localhost:3001
- **Prisma Studio:** http://localhost:5555
- **Health Check:** http://localhost:3001/health

### 📚 Documentation Files
- `API-TEST-GUIDE.md` - Hướng dẫn test chi tiết
- `TEST-RESULTS-SUMMARY.md` - Báo cáo kết quả test
- `api-test-results.log` - Log chi tiết test results

### 🆘 Common Issues
1. **Database not connected** → Check DATABASE_URL
2. **Port in use** → Kill process or change port
3. **Permission denied** → Promote manager role
4. **Test failures** → Clear test data and re-run setup

---

✨ **Happy Coding!** ✨
