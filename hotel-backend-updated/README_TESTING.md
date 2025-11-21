# Hướng dẫn test API Hotel Management

> Dùng với backend trong dự án **hotel-backend-updated.zip** (Node.js + Express + Prisma + MySQL).
> Base URL mặc định: `http://localhost:3001`

## 1) Chuẩn bị
- Chạy backend: `npm run dev`
- Tạo DB và migrate: `npm run prisma:migrate`
- Copy `.env.example` → `.env` và chỉnh `DATABASE_URL` trỏ MySQL.

## 2) Quy ước test
- **Token** đăng nhập sẽ dùng trong header:  
  `Authorization: Bearer <JWT>`
- Có 2 role:
  - **MANAGER**: quản trị Khách sạn/Phòng/Dịch vụ/Khuyến mãi/Booking.
  - **CUSTOMER**: đặt phòng, thanh toán, hủy, đánh giá, xem thông báo.
- Một số quy tắc chính:
  - Hủy booking hợp lệ nếu còn **≥ 2 ngày** trước `checkIn`.
  - Đánh giá chỉ khi booking `CHECKED_OUT` và `paymentStatus=PAID` (logic đã ràng buộc trong controller).
  - Tìm phòng loại trừ những phòng đã bị đặt trùng khoảng ngày.

## 3) Thứ tự chạy đề nghị
1. **Đăng ký & đăng nhập** (tạo 1 CUSTOMER và 1 MANAGER).
2. **Manager** tạo **Hotel**, **Room**, **Service**, **Promotion**.
3. **Customer**: Tìm phòng tương thích → **Đặt phòng**.
4. **Thanh toán** (ONLINE/CARD hoặc OFFLINE → pay sau).
5. **Hủy** (nếu còn hạn) hoặc **Check-out** (manager cập nhật status) → **Review**.
6. **Notification**: xem/đánh dấu đã đọc.
7. **Dashboard** (MANAGER).

## 4) Cấu hình nhanh cho Postman/REST Client
- Nhập file `api-test.postman_collection.json` vào Postman. Set `{{baseUrl}}` = `http://localhost:3001`.
- Hoặc dùng file `api-test.http` với VSCode REST Client (extension `humao.rest-client`):
  - Mở file, nhấn **Send Request** trên từng request.
  - Sửa biến `@baseUrl` và dán token vào biến `@token` khi có.

## 5) Checklist endpoint
- Auth: `/auth/register`, `/auth/login`, `/auth/password/request-reset`, `/auth/password/reset`
- Hotels: `GET/POST /hotels`
- Services: `GET /services`, `POST/PUT/DELETE /services/:id`
- Promotions: `GET/POST/PUT/DELETE /promotions` (Manager)
- Rooms: `GET/POST/PUT/DELETE /rooms`
- Search: `GET /search/rooms`
- Bookings: `GET /bookings`, `GET /bookings/all`, `POST /bookings`, `PATCH /bookings/:id/status`, `POST /bookings/:id/cancel`
- Payments: `POST /payments/:id/pay`
- Reviews: `POST /reviews`
- Notifications: `GET /notifications`, `PATCH /notifications/:id/read`
- Dashboard: `GET /dashboard/overview` (Manager)

> Tham khảo chi tiết request/response trong hai file test đi kèm.
