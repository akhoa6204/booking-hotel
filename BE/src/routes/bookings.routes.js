import { Router } from "express";
import { auth, notRequireRole } from "../middleware/auth.js";
import * as AdminBookingController from "../controllers/admin/bookings.controller.js";
import * as bookingController from "../controllers/common/booking.controller.js";

export const bookingsRouter = Router();
bookingsRouter.get("/", auth(true), bookingController.list);
bookingsRouter.post("/", auth(), bookingController.create);
bookingsRouter.get("/:id", auth(), bookingController.getById);

export const adminBookingsRouter = Router();

adminBookingsRouter.get(
  "/",
  auth(true),
  notRequireRole("CUSTOMER"),
  AdminBookingController.list,
);

adminBookingsRouter.post(
  "/",
  auth(true),
  notRequireRole("CUSTOMER"),
  AdminBookingController.create,
);

adminBookingsRouter.patch(
  "/:id",
  auth(true),
  notRequireRole("CUSTOMER"),
  AdminBookingController.update,
);

adminBookingsRouter.get(
  "/:id",
  auth(true),
  notRequireRole("CUSTOMER"),
  AdminBookingController.getById,
);
