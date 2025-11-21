# API Test Runner - Hotel Management System

## Mô tả
File `api-test-detailed.js` là một test suite hoàn chỉnh để test tất cả API endpoints của hệ thống quản lý khách sạn. Test suite sẽ ghi lại chi tiết:
- Request body
- Response data
- Status code
- Headers
- Timestamp

## Cài đặt và sử dụng

### 1. Cài đặt dependencies
```bash
npm install axios
```

### 2. Khởi động server
```bash
npm run dev
```

### 3. Chạy test suite
```bash
node api-test-detailed.js
```

## Cấu trúc test

### Authentication
- ✅ Health check
- ✅ Register customer
- ✅ Register manager  
- ✅ Login customer
- ✅ Login manager
- ✅ Request password reset
- ✅ Reset password

### Hotel Management
- ✅ Get hotels (public)
- ✅ Create hotel (manager only)

### Services
- ✅ Get services
- ✅ Create service (manager)
- ✅ Update service (manager)
- ✅ Delete service (manager)

### Rooms
- ✅ Get rooms
- ✅ Create room (manager)
- ✅ Update room (manager)

### Promotions
- ✅ Get promotions (manager)
- ✅ Create promotion (manager)
- ✅ Update promotion (manager)
- ✅ Delete promotion (manager)

### Search
- ✅ Search rooms với filters

### Bookings
- ✅ Create booking (customer)
- ✅ Get my bookings (customer)
- ✅ Get all bookings (manager)
- ✅ Update booking status (manager)
- ✅ Cancel booking

### Payments
- ✅ Pay booking

### Reviews
- ✅ Create review (sau khi check-out và paid)

### Notifications
- ✅ Get notifications
- ✅ Mark notification as read

### Dashboard
- ✅ Get dashboard overview (manager)

## Kết quả test

Test results sẽ được ghi vào file `api-test-results.log` với format JSON chi tiết:

```json
{
  "timestamp": "2025-09-26T10:30:00.000Z",
  "testName": "Login Customer",
  "method": "POST",
  "url": "/auth/login",
  "requestBody": {
    "email": "customer@test.com",
    "password": "password123"
  },
  "response": {
    "status": 200,
    "statusText": "OK",
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIs...",
      "user": {
        "id": 1,
        "fullName": "Test Customer",
        "email": "customer@test.com",
        "role": "CUSTOMER"
      }
    },
    "headers": {
      "content-type": "application/json"
    }
  }
}
```

## Lưu ý quan trọng

### 1. Quyền Manager
Sau khi register manager, cần manually promote role trong database:
```sql
UPDATE User SET role='MANAGER' WHERE email='manager@test.com';
```

### 2. Database Setup
Đảm bảo database đã được migrate:
```bash
npm run prisma:migrate
npm run prisma:generate
```

### 3. Environment Variables
Kiểm tra file `.env` có đúng DATABASE_URL

### 4. Thứ tự test
Test suite được thiết kế chạy theo thứ tự dependency:
1. Auth → Lấy tokens
2. Hotel → Tạo hotel
3. Rooms → Tạo rooms
4. Services, Promotions → Liên kết với hotel
5. Bookings → Sử dụng room
6. Payments, Reviews → Liên kết với booking

## Customization

### Thay đổi cấu hình
```javascript
const CONFIG = {
  baseURL: 'http://localhost:3001',  // Đổi port nếu cần
  timeout: 10000,                   // Timeout cho request
  logFile: 'api-test-results.log'   // File log output
};
```

### Thêm test case mới
```javascript
await testAPI('Test Name', 'METHOD', '/endpoint', requestData, headers);
```

### Chạy test riêng lẻ
```javascript
const { testAPI } = require('./api-test-detailed');

// Test riêng một endpoint
testAPI('My Test', 'GET', '/hotels');
```

## Troubleshooting

### Lỗi connection
- Kiểm tra server đã chạy ở port 3001
- Kiểm tra database connection

### Lỗi authentication
- Đảm bảo đã promote manager role
- Token có thể expire, chạy lại từ đầu

### Lỗi validation
- Kiểm tra format dữ liệu test
- Đọc response error để debug
