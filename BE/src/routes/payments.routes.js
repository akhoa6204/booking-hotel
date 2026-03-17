import { Router } from "express";
import {
  auth,
  notRequireRole,
  notRequireRoles,
  requireRoles,
} from "../middleware/auth.js";
import * as AdminPaymentController from "../controllers/admin/payments.controller.js";

export const adminPaymentRouter = Router();

adminPaymentRouter.post(
  "/",
  auth(true),
  notRequireRoles(["CUSTOMER", "HOUSEKEEPING"]),
  AdminPaymentController.create,
);

adminPaymentRouter.post(
  "/:id/checkout-link",
  auth(true),
  notRequireRoles(["CUSTOMER", "HOUSEKEEPING"]),
  AdminPaymentController.createCheckoutLink,
);

adminPaymentRouter.patch(
  "/:id",
  auth(true),
  notRequireRoles(["CUSTOMER", "HOUSEKEEPING"]),
  AdminPaymentController.updateStatus,
);
