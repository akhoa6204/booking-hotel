# 🧪 Hướng Dẫn Test API - Hệ Thống Quản Lý Khách Sạn

## 📋 Tổng Quan

Hệ thống test API này cung cấp công cụ toàn diện để test tất cả endpoints của ứng dụng quản lý khách sạn, ghi lại chi tiết:
- ✅ Request body
- ✅ Response data  
- ✅ Status codes
- ✅ Headers
- ✅ Timestamps
- ✅ Error handling

## 📁 Cấu Trúc Files Test

```
📦 API Test Files
├── 📄 api-test-detailed.js      # Test runner chính (Node.js)
├── 📄 api-test.spec.js          # Jest test suite
├── 📄 setup-test.js             # Script setup test data
├── 📄 api-test-runner.md        # Hướng dẫn chi tiết
├── 📄 API-TEST-GUIDE.md         # File này
├── 📄 api-test.http             # REST Client tests (có sẵn)
└── 📄 api-test.postman_collection.json  # Postman collection (có sẵn)
```

## 🚀 Bắt Đầu Nhanh

### 1. Cài Đặt Dependencies
```bash
npm install axios jest
```

### 2. Setup Database & Server
```bash
# Tạo database và migrate
npm run prisma:migrate
npm run prisma:generate

# Khởi động server
npm run dev
```

### 3. Setup Test Data
```bash
# Tạo dữ liệu test và promote manager role
npm run test:setup
```

### 4. Chạy Tests

#### Tùy chọn A: Node.js Test Runner (Recommended)
```bash
npm run test:api
```
📄 **Output:** `api-test-results.log`

#### Tùy chọn B: Jest Test Suite
```bash
npm run test:api:jest
```
📄 **Output:** `jest-test-results.log`

#### Tùy chọn C: REST Client (VS Code)
- Cài extension `humao.rest-client`
- Mở `api-test.http`
- Click "Send Request" trên từng test

#### Tùy chọn D: Postman
- Import `api-test.postman_collection.json`
- Set variable `{{baseUrl}}` = `http://localhost:3001`
- Run collection

## 📊 Chi Tiết Test Coverage

### 🔐 Authentication (4 endpoints)
- ✅ `POST /auth/register` - Đăng ký customer/manager
- ✅ `POST /auth/login` - Đăng nhập và lấy JWT token
- ✅ `POST /auth/password/request-reset` - Yêu cầu reset password
- ✅ `POST /auth/password/reset` - Reset password với token

### 🏨 Hotel Management (2 endpoints)
- ✅ `GET /hotels` - Lấy danh sách khách sạn (public)
- ✅ `POST /hotels` - Tạo/cập nhật khách sạn (MANAGER only)

### 🛎️ Services (4 endpoints)
- ✅ `GET /services` - Lấy dịch vụ theo hotelId
- ✅ `POST /services` - Tạo dịch vụ mới (MANAGER)
- ✅ `PUT /services/:id` - Cập nhật dịch vụ (MANAGER)
- ✅ `DELETE /services/:id` - Xóa dịch vụ (MANAGER)

### 🛏️ Rooms (3 endpoints)
- ✅ `GET /rooms` - Lấy danh sách phòng
- ✅ `POST /rooms` - Tạo phòng mới (MANAGER)
- ✅ `PUT /rooms/:id` - Cập nhật phòng (MANAGER)

### 🎉 Promotions (4 endpoints)
- ✅ `GET /promotions` - Lấy khuyến mãi (MANAGER)
- ✅ `POST /promotions` - Tạo khuyến mãi (MANAGER)
- ✅ `PUT /promotions/:id` - Cập nhật khuyến mãi (MANAGER)
- ✅ `DELETE /promotions/:id` - Xóa khuyến mãi (MANAGER)

### 🔍 Search (1 endpoint)
- ✅ `GET /search/rooms` - Tìm phòng với filters

### 📅 Bookings (5 endpoints)
- ✅ `GET /bookings` - Lấy booking của customer
- ✅ `GET /bookings/all` - Lấy tất cả bookings (MANAGER)
- ✅ `POST /bookings` - Tạo booking mới (CUSTOMER)
- ✅ `PATCH /bookings/:id/status` - Cập nhật trạng thái (MANAGER)
- ✅ `POST /bookings/:id/cancel` - Hủy booking

### 💳 Payments (1 endpoint)
- ✅ `POST /payments/:id/pay` - Thanh toán booking

### ⭐ Reviews (1 endpoint)
- ✅ `POST /reviews` - Tạo đánh giá (sau check-out)

### 🔔 Notifications (2 endpoints)
- ✅ `GET /notifications` - Lấy thông báo
- ✅ `PATCH /notifications/:id/read` - Đánh dấu đã đọc

### 📊 Dashboard (1 endpoint)
- ✅ `GET /dashboard/overview` - Báo cáo tổng quan (MANAGER)

**Tổng cộng: 28 endpoints được test**

## 📝 Format Kết Quả Test

### Node.js Test Runner Output
```json
{
  "timestamp": "2025-09-26T10:30:00.000Z",
  "testName": "Create Booking (Customer)",
  "method": "POST", 
  "url": "/bookings",
  "requestBody": {
    "roomId": 1,
    "checkIn": "2025-10-20",
    "checkOut": "2025-10-22",
    "method": "ONLINE"
  },
  "response": {
    "status": 201,
    "statusText": "Created",
    "data": {
      "id": 1,
      "userId": 1,
      "roomId": 1,
      "totalPrice": "3000000.00",
      "status": "PENDING"
    }
  }
}
```

### Jest Test Output
```
 PASS  ./api-test.spec.js
  Authentication APIs
    ✓ Register Customer (150ms)
    ✓ Login Customer (120ms)
  Hotel Management APIs  
    ✓ Get Hotels (Public) (80ms)
    ✓ Create Hotel (Manager) (200ms)
  ...

Test Suites: 1 passed, 1 total
Tests:       28 passed, 28 total
```

## ⚠️ Lưu Ý Quan Trọng

### 1. Manager Role Setup
Sau khi register manager, cần promote role trong database:
```sql
UPDATE User SET role='MANAGER' WHERE email='manager@test.com';
```

Hoặc sử dụng script:
```bash
npm run test:setup
```

### 2. Business Logic Dependencies
- **Review**: Chỉ tạo được khi booking `CHECKED_OUT` và `PAID`
- **Cancel**: Chỉ hủy được khi còn >= 2 ngày trước check-in
- **Search**: Loại trừ phòng đã đặt trong khoảng thời gian

### 3. Test Data
Tests tạo dữ liệu với prefix `Jest Test` hoặc `Test` để dễ phân biệt.

## 🔧 Customization

### Thay đổi Base URL
```javascript
// Trong api-test-detailed.js
const CONFIG = {
  baseURL: 'http://localhost:3001',  // Đổi port
  timeout: 10000
};
```

### Thêm Test Mới
```javascript
// Node.js
await testAPI('Test Name', 'METHOD', '/endpoint', data, headers);

// Jest
test('Test Name', async () => {
  const response = await api.post('/endpoint', data);
  expect(response.status).toBe(200);
});
```

### Custom Headers
```javascript
const headers = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json',
  'X-Custom-Header': 'value'
};
```

## 🐛 Troubleshooting

### ❌ Server Connection Error
```bash
# Kiểm tra server
npm run dev

# Kiểm tra port
netstat -an | findstr :3001
```

### ❌ Database Error
```bash
# Reset database
npm run prisma:migrate
npm run prisma:generate
npm run test:setup
```

### ❌ Authentication Error
```bash
# Kiểm tra manager role
npm run test:setup

# Hoặc manual
npm run prisma:studio
```

### ❌ Test Data Conflict
```sql
-- Clear test data
DELETE FROM User WHERE email LIKE '%test.com';
DELETE FROM Hotel WHERE name LIKE '%Test%';
```

## 📈 Performance Monitoring

### Response Time Tracking
```javascript
console.time('API Call');
const response = await testAPI(...);
console.timeEnd('API Call');
```

### Concurrent Testing
```javascript
const promises = [
  testAPI('Test 1', 'GET', '/endpoint1'),
  testAPI('Test 2', 'GET', '/endpoint2'),
  testAPI('Test 3', 'GET', '/endpoint3')
];

await Promise.all(promises);
```

## 🎯 Best Practices

1. **Thứ tự test**: Auth → Hotels → Rooms → Bookings → Reviews
2. **Clean data**: Sử dụng test users riêng biệt
3. **Environment**: Test trên DB test, không phải production
4. **Logging**: Giữ lại logs để debug
5. **Assertions**: Kiểm tra cả status và data structure

## 📞 Hỗ Trợ

Nếu gặp vấn đề:
1. Kiểm tra server logs
2. Xem file test results logs
3. Verify database state với Prisma Studio
4. Check network connectivity

---

✨ **Happy Testing!** ✨
