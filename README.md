# Booking Hotel Management System

Hệ thống quản lý đặt phòng khách sạn được xây dựng theo kiến trúc Fullstack gồm:

- **Frontend**: ReactJS + Vite + TypeScript + MUI + Redux Toolkit + React Query
- **Backend**: Node.js + Express + Prisma ORM
- **Database**: MySQL

Hệ thống hỗ trợ quản lý đặt phòng online & offline, thanh toán, khuyến mãi, đánh giá, vận hành lễ tân và buồng phòng.

---

## 🚀 Tính năng chính

### 1. Khách hàng
- Tìm kiếm phòng theo ngày check-in / check-out
- Xem chi tiết phòng (hình ảnh, tiện nghi, giá, đánh giá)
- Đặt phòng online
- Thanh toán online (SePay nếu có cấu hình)
- Xem lịch sử đặt phòng
- Đánh giá sau khi đã checkout

### 2. Lễ tân (Front Desk)
- Tạo đặt phòng walk-in
- Check-in / Check-out
- Quản lý thanh toán (deposit, thanh toán đủ)
- Quản lý phát sinh dịch vụ & phụ phí

### 3. Buồng phòng (Housekeeping)
- Nhận task dọn phòng
- Task chỉ được tạo khi booking đã checkout
- Tự động phân công nếu trong ca có housekeeping

### 4. Quản trị (Admin)
- Quản lý loại phòng & phòng
- Quản lý tiện nghi
- Quản lý khuyến mãi
- Quản lý nhân viên & phân quyền (RBAC)
- Dashboard thống kê 6 tháng gần nhất
- Quản lý đánh giá

---

## 🏗 Kiến trúc hệ thống

booking-hotel/
│
├── FE/      # Frontend (React + Vite)
├── BE/      # Backend (Express + Prisma)
└── README.md

---

## ⚙️ Yêu cầu hệ thống

- Node.js >= 16
- MySQL >= 8
- npm hoặc yarn

---

## 🔧 Cài đặt & Chạy dự án (Development)

### 1️⃣ Backend

```bash
cd BE
npm install
cp .env.example .env
```

Cấu hình biến môi trường trong `.env`

```bash
npm run prisma:generate
npm run prisma:migrate
node prisma/seed.js
npm run dev
```

Backend chạy tại:

```
http://localhost:3001
```

---

### 2️⃣ Frontend

```bash
cd FE
npm install
npm run dev
```

Frontend chạy tại:

```
http://localhost:5173
```

---

## 🗄 Database & Prisma

Thư mục:

```
BE/prisma/
```

Các lệnh quan trọng:

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:studio
npx prisma migrate reset
```

Seed dữ liệu:

```bash
node prisma/seed.js
```

Seed bao gồm:
- 6 tháng booking (20 booking / tháng)
- Online & Walk-in
- Review chỉ cho user có tài khoản
- Services & Extra Fees
- Shift nhân viên
- Housekeeping task

---

### ▶ Sau khi chạy seed

Sau khi chạy:

```bash
node prisma/seed.js
```

Bạn có thể:

1. Truy cập Prisma Studio để kiểm tra dữ liệu:

```bash
npm run prisma:studio
```

2. Đăng nhập bằng các tài khoản mẫu đã được tạo trong seed (xem trong file `prisma/seed.js` để biết email & password mặc định).

3. Kiểm tra:
   - Booking 6 tháng gần nhất (20 booking / tháng)
   - Online booking có deposit & payment record
   - Walk-in booking thanh toán tại quầy
   - Review chỉ xuất hiện với khách có tài khoản
   - Housekeeping task chỉ tạo khi booking đã checkout
   - Services & Extra Fees được gắn ngẫu nhiên vào booking

Nếu muốn reset toàn bộ database và seed lại từ đầu:

```bash
npx prisma migrate reset
```

---

---

## 🔐 Biến môi trường (BE/.env)

Tạo file `BE/.env` (không commit lên repository).

Ví dụ cấu hình cho môi trường local:

```
PORT=3001
DATABASE_URL="mysql://root:<your_password>@127.0.0.1:3307/hotel_db"
JWT_SECRET=<your_strong_secret>
CORS_ORIGIN=http://localhost:5173
FE_ORIGIN=http://localhost:5173

# SMTP (Gửi email)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=<your_email>
SMTP_PASS=<your_app_password>

# SePay Payment Gateway
SEPAY_MERCHANT_ID=<your_merchant_id>
SEPAY_SECRET_KEY=<your_secret_key>
```

### ⚠️ Lưu ý bảo mật

- Không commit file `.env` lên GitHub.
- Không chia sẻ `JWT_SECRET`, `SMTP_PASS`, `SEPAY_SECRET_KEY`.
- Nên sử dụng mật khẩu mạnh và rotate key nếu bị lộ.
- Trong production, nên sử dụng environment variables từ hosting provider (Render, Railway, AWS, Docker secrets...).

---

## 💳 Logic thanh toán

- Booking online bắt buộc có **deposit**
- Thanh toán phần còn lại tại check-in
- Invoice 1-1 với booking
- Payment record lưu lịch sử giao dịch

---

## 🧹 Logic buồng phòng

- Task kiểm tra phòng chỉ tạo khi booking checkout
- Nếu trong ca có housekeeping → gán tự động
- Nếu không → gán cho lễ tân trong ca

---

## 📊 Dashboard

Hiển thị:
- Doanh thu 6 tháng gần nhất
- Số booking theo tháng
- Tỉ lệ occupancy
- Số review & điểm trung bình

---

## 🛡 Bảo mật

- JWT Authentication
- Role-based Access Control (RBAC)
- Validation & Error Handling toàn hệ thống
- Không lưu secrets trong repository

---

## 📦 Build Production

Frontend:

```bash
cd FE
npm run build
```

Backend:

```bash
npm start
```

---

## 📬 Liên hệ

Phan Nguyễn Anh Khoa  
Email: khoaanh662004@gmail.com

---

Nếu cần Docker setup hoặc CI/CD config, vui lòng liên hệ.