import { Router } from "express";
import { auth, requireRole } from "../middleware/auth.js";
import {
  listMyBookings,
  listAllBookings,
  createBooking,
  updateBookingStatus,
  cancelBooking,
  adminCreateBooking,
  createPaymentBanking,
  checkPayment,
  getBookingQuote,
  getBookingById,
} from "../controllers/bookings.controller.js";

export const bookingsRouter = Router();

/* ----- Public callback từ VNPay: đặt TRƯỚC route động ----- */
bookingsRouter.get("/check-payment-vnpay", checkPayment);

/* ----- Admin / Manager ----- */
bookingsRouter.get("/admin", auth(), requireRole("MANAGER"), listAllBookings);
// optional: giữ đường dẫn cũ /all để không gãy FE cũ
bookingsRouter.get("/all", auth(), requireRole("MANAGER"), listAllBookings);

bookingsRouter.post(
  "/admin",
  auth(),
  requireRole("MANAGER"),
  adminCreateBooking
);
bookingsRouter.patch(
  "/:id/status",
  auth(),
  requireRole("MANAGER"),
  updateBookingStatus
);
// xem chi tiết bất kỳ booking
bookingsRouter.get("/:id", auth(), getBookingById);

/* ----- User ----- */
bookingsRouter.get("/", auth(), listMyBookings);
bookingsRouter.post("/",auth(false), createBooking);
bookingsRouter.post("/quote", getBookingQuote);

bookingsRouter.post("/:id/cancel", auth(), cancelBooking);

/* ----- Thanh toán ----- */
bookingsRouter.post("/:id/pay", createPaymentBanking); 
bookingsRouter.post("/check-payment", checkPayment); // ghi nhận offline
