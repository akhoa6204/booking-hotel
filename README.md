# Hệ thống quản lý đặt phòng khách sạn (Booking Hotel System).

Phiên bản này gồm frontend bằng React + Vite (TypeScript) và backend bằng Node.js + Express với Prisma ORM.

**Nội dung chính**

- **Frontend**: `booking-hotel-frontend/` — ứng dụng React (Vite, TypeScript, MUI, Redux Toolkit, React Query).
- **Backend**: `hotel-backend-updated/` — API server Express, Prisma, cơ sở dữ liệu và scripts tiện ích.

**Mục tiêu**

- Cung cấp UI cho người dùng đặt phòng, quản lý phòng, quản trị (dashboard, quản lý đặt phòng, khuyến mãi, đánh giá,...).
- API phục vụ các tính năng đặt phòng, quản lý nhân viên/khách hàng, thanh toán, khuyến mãi, báo cáo.

---

**Yêu cầu hệ thống**

- Node.js (>=16 recommended)
- npm hoặc yarn
- (Backend) MySQL  — phụ thuộc cấu hình `prisma/schema.prisma` và biến môi trường

---

**Cấu trúc thư mục chính**

- `FE/` — mã nguồn frontend (Vite + React + TypeScript)
- `BE/` — mã nguồn backend (Express + Prisma)
- `prisma/` (trong backend) — schema, migrations, seed scripts

---

**Frontend — Chạy & Xây dựng**

1. Mở terminal, chuyển vào thư mục frontend:

   ```bash
   cd FE
   npm install
   npm run dev
   ```

2. Xây dựng để production:

   ```bash
   npm run build
   npm run preview
   ```

Scripts chính (`package.json`):

- `dev`: `vite` — chạy dev server
- `build`: `tsc -b && vite build` — build production
- `preview`: `vite preview` — xem build local

---

**Backend — Chạy & Thao tác**

1. Chuyển vào thư mục backend và cài phụ thuộc:

   ```bash
   cd BE
   npm install
   ```

2. Thiết lập biến môi trường: sao chép `/.env.example` thành `/.env` và chỉnh thông tin DB, JWT, SMTP, VNPAY,...

3. Khởi tạo Prisma và migrate (ví dụ dùng SQLite/Postgres/MySQL theo cấu hình):

   ```bash
   # Tạo client Prisma
   npm run prisma:generate

   # Thực thi migrate (phát triển)
   npm run prisma:migrate

   # Mở Prisma Studio để xem dữ liệu
   npm run prisma:studio
   ```

4. Seed dữ liệu mẫu (nếu cần):

   ```bash
   # Trong thư mục prisma có seed scripts: seed.js, seedLongReviews.js
   node prisma/seed.js
   ```

5. Chạy server:

   ```bash
   npm run dev
   # hoặc
   npm start
   ```

Scripts chính (`package.json`):

- `dev`: `nodemon src/server.js` — chạy server trong dev
- `start`: `node src/server.js` — chạy production (nếu đã build)
- `prisma:generate`, `prisma:migrate`, `prisma:studio` — thao tác Prisma
- `setup` / `setup:win` — script tiện ích để chuẩn bị môi trường

---

**Các endpoint chính & tài liệu kiểm thử**

- Tất cả route backend nằm trong `BE/src/routes/`
- Controllers tương ứng trong `BE/src/controllers/`
- Có file test và collection API trong repo: `api-test.http`, `api-test.postman_collection.json`, và script test (`api-test-detailed.js`, `api-test.spec.js`).

Để chạy test API nhanh:

```bash
cd BE
node api-test-detailed.js
# hoặc
npm run test:api
```

---

**Cơ sở dữ liệu & Migrations**

- Schema Prisma: `BE/prisma/schema.prisma`
- Migrations đã nằm sẵn trong `BE/prisma/migrations/`.
- Nếu đổi DB hoặc muốn reset, xem các lệnh `prisma migrate` và chạy lại seed.

---

**Gợi ý chạy song song (dev)**

- Terminal 1 (backend):

  ```bash
  cd hotel-backend-updated
  npm install
  npm run dev
  ```

- Terminal 2 (frontend):

  ```bash
  cd booking-hotel-frontend
  npm install
  npm run dev
  ```

Frontend thường truy cập API backend qua `VITE_` env biến hoặc cấu hình proxy trong dev (kiểm tra `vite.config.ts` nếu cần cấu hình proxy).

---

**Cải tiến và ghi chú phát triển**

- Kiểm tra biến môi trường (JWT secret, DB URL, SMTP, VNPAY keys) trước khi chạy production.
- Sử dụng `prisma studio` để duyệt dữ liệu nhanh.
- Mã frontend sử dụng MUI, Tailwind config có thể được cấu hình thêm (xem `vite.config.ts` / `theme.ts`).


Liên hệ: (n/a) — nếu cần tôi cập nhật README bằng tiếng Anh hoặc thêm phần CI/CD, nói tôi biết.
