import { Router } from "express";
import { auth, notRequireRole, notRequireRoles, requireRoles } from "../middleware/auth.js";
import * as AdminPaymentController from "../controllers/admin/payments.controller.js";

export const adminPaymentRouter = Router();

adminPaymentRouter.post(
  "/",
  auth(true),
  notRequireRoles(["CUSTOMER", "HOUSEKEEPING"]),
  AdminPaymentController.create,
);

adminPaymentRouter.post(
  "/:id/checkout",
  auth(true),
  notRequireRoles(["CUSTOMER", "HOUSEKEEPING"]),
  AdminPaymentController.createPaymentOnlineLink,
);

adminPaymentRouter.patch(
  "/:id/confirm",
  auth(true),
  notRequireRoles(["CUSTOMER", "HOUSEKEEPING"]),
  AdminPaymentController.markAsPaid,
);

adminPaymentRouter.patch(
  "/:id/cancel",
  auth(true),
  notRequireRoles(["CUSTOMER", "HOUSEKEEPING"]),
  AdminPaymentController.markAsFailed,
);
