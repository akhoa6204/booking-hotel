import { Router } from "express";
import { auth, notRequireRole } from "../middleware/auth.js";

export const bookingsRouter = Router();

import * as AdminBookingController from "../controllers/admin/bookings.controller.js";

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
