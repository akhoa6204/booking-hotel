import { Router } from "express";
import { auth, requireRole } from "../middleware/auth.js";
import {
  createReview,
  getList,
  updateStatus,
  getStats,
  getListForGuest,
  getById,
} from "../controllers/reviews.controller.js";

export const reviewsRouter = Router();

// Tạo đánh giá
reviewsRouter.post("/", auth(), createReview);

// Lấy danh sách review (phân trang, lọc theo room)
reviewsRouter.get("/", auth(), requireRole("MANAGER"), getList);
// Lấy danh sách review cho khách hàng
reviewsRouter.get(
  "/customer",
  auth(),
  requireRole("CUSTOMER"),
  getListForGuest
);
reviewsRouter.get("/customer/:id", auth(), requireRole("CUSTOMER"), getById);

// Cập nhật trạng thái review (chỉ MANAGER)
reviewsRouter.patch(
  "/:id/status",
  auth(),
  requireRole("MANAGER"),
  updateStatus
);

// thống kê cho widget: ĐTB, Tổng, Ẩn
reviewsRouter.get("/stats", auth(), requireRole("MANAGER"), getStats);
