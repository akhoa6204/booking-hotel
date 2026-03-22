import { Router } from "express";
import {
  auth,
  notRequireRole,
  notRequireRoles,
  requireRoles,
} from "../middleware/auth.js";
import * as AdminPaymentController from "../controllers/admin/payments.controller.js";
import * as paymentController from "../controllers//common/payment.controller.js";

export const adminPaymentRouter = Router();
export const paymentRouter = Router();
adminPaymentRouter.post(
  "/",
  auth(true),
  notRequireRoles(["CUSTOMER", "HOUSEKEEPING"]),
  AdminPaymentController.create,
);

adminPaymentRouter.patch(
  "/:id",
  auth(true),
  notRequireRoles(["CUSTOMER", "HOUSEKEEPING"]),
  AdminPaymentController.updateStatus,
);

paymentRouter.post("/", auth(), paymentController.create);
paymentRouter.patch("/:id", auth(), paymentController.updateStatus);
paymentRouter.post(
  "/:id/checkout-link",
  auth(),
  paymentController.createCheckoutLink,
);
