# Hệ thống quản lý đặt phòng khách sạn (Booking Hotel System)

Ứng dụng gồm frontend (React + Vite, TypeScript) và backend (Node.js + Express, Prisma). README này hướng dẫn cách chạy, cấu hình môi trường và tổng quan API/features.

**Thư mục chính**

- `FE/` — mã nguồn frontend (Vite, React, TypeScript, MUI, Redux Toolkit, React Query).
- `BE/` — mã nguồn backend (Express, Prisma, migrations, seed, scripts).

---

## Mục lục

- [Tổng quan & Tính năng](#tổng-quan--tính-năng)
- [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
- [Chạy nhanh (Dev)](#chạy-nhanh-dev)
- [Thiết lập Backend (chi tiết)](#thiết-lập-backend-chi-tiết)
- [Thiết lập Frontend](#thiết-lập-frontend)
- [Biến môi trường (env)](#biến-môi-trường-env)
- [Database & Prisma](#database--prisma)
- [Kiểm thử & API collection](#kiểm-thử--api-collection)
- [Bảo mật & Lưu ý vận hành](#bảo-mật--lưu-ý-vận-hành)
- [Đóng góp](#đóng-góp)
- [Liên hệ](#liên-hệ)

---

## Tổng quan & Tính năng

- Giao diện cho người dùng và giao diện quản trị với các tính năng chính:

  - **Admin / Quản trị**: quản lý phòng & loại phòng; quản lý đặt phòng (xác nhận/hủy, điều chỉnh, tạo đặt phòng offline); quản lý khuyến mãi; quản lý đánh giá; dashboard báo cáo; quản lý người dùng/nhân viên.
  - **Khách hàng**: tìm kiếm & xem phòng; xem chi tiết phòng (hình ảnh, tiện nghi, giá); đặt phòng & thanh toán trực tuyến; quản lý hồ sơ; xem lịch sử đặt phòng; viết đánh giá.

- **API (Backend)**: RESTful endpoints phục vụ các nhóm chức năng: Auth, Users, Rooms/RoomTypes, Bookings, Payments (VNPAY), Promotions, Reviews, Search/Filters, Dashboard/Reports, Uploads (images).

---

## Yêu cầu hệ thống

- Node.js (>=16)
- npm hoặc yarn
- MySQL (theo `BE/prisma/schema.prisma`)

---

## Chạy nhanh (Dev)

1. Mở hai terminal.

Backend (terminal A):

```bash
cd BE
npm install
cp .env.example .env   # chỉnh giá trị trong BE/.env
npm run dev
```

Frontend (terminal B):

```bash
cd FE
npm install
npm run dev
```

Truy cập frontend (mặc định): `http://localhost:5173` (hoặc URL Vite hiển thị).

---

## Thiết lập Backend (chi tiết)

1. Sao chép `BE/.env.example` → `BE/.env` và điền các giá trị phù hợp.
2. Tạo Prisma client & migrate:

```bash
cd BE
npm run prisma:generate
npm run prisma:migrate
node prisma/seed.js   # (tùy chọn) seed dữ liệu mẫu
```

3. Chạy server:

```bash
npm run dev
# hoặc
npm start
```

Scripts hữu ích (từ `BE/package.json`): `dev`, `start`, `prisma:generate`, `prisma:migrate`, `prisma:studio`, `setup`.

---

## Thiết lập Frontend

1. Cài đặt và chạy dev server:

```bash
cd FE
npm install
npm run dev
```

2. Build production:

```bash
npm run build
npm run preview
```

---

## Biến môi trường (env)

Backend sử dụng `BE/.env`. Không commit file `.env` vào git. Các biến chính:

- `PORT` — cổng server (ví dụ `3001`).
- `DATABASE_URL` — chuỗi kết nối Prisma, ví dụ MySQL:

  ```text
  DATABASE_URL="mysql://<DB_USER>:<DB_PASS>@<DB_HOST>:<DB_PORT>/<DB_NAME>"
  ```

- `JWT_SECRET` — secret dùng ký JWT (sử dụng chuỗi ngẫu nhiên, 32+ ký tự).
- `CORS_ORIGIN` — origin frontend cho phép (ví dụ `http://localhost:5173`).
- `FE_ORIGIN` — URL frontend (dùng khi backend cần redirect/notify).
- `VNP_HASH_SECRET` — secret cho VNPAY (GIỮ BÍ MẬT).
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` — cấu hình SMTP gửi email (nên dùng app password cho Gmail).

Gợi ý nhanh:

```bash
# tạo JWT secret mạnh
openssl rand -hex 32

# copy mẫu env
cp BE/.env.example BE/.env
```

Nếu `.env` lỡ commit:

```bash
git rm --cached BE/.env
git commit -m "Remove tracked env file"
# sau đó rotate các secrets bị lộ
```

---

## Database & Prisma

- Schema và migrations nằm trong `BE/prisma/`.
- Các lệnh phổ biến:

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:studio
```

---

## Bảo mật & Lưu ý vận hành

- KHÔNG commit file `.env` chứa secrets.
- Dùng app password hoặc OAuth cho SMTP (Gmail).
- Nếu secrets bị lộ, ngay lập tức rotate password/keys (DB, SMTP, VNPAY, JWT).
- Cho production, dùng Secret Manager (AWS/GCP/HashiCorp) và không lưu trực tiếp secrets trong repo.

---

## Liên hệ

- Email: `khoaanh662004@gmail.com` — liên hệ nếu cần README tiếng Anh, Docker/Docker Compose config, hoặc CI/CD.


