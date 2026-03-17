import { Router } from "express";
import { auth, notRequireRole } from "../middleware/auth.js";
import * as invoiceController from "../controllers/admin/invoices.controller.js";
export const invoiceRoutes = Router();

invoiceRoutes.patch(
  "/:id",
  auth(true),
  notRequireRole("CUSTOMER"),
  invoiceController.update,
);

invoiceRoutes.get(
  "/:id",
  auth(true),
  notRequireRole("CUSTOMER"),
  invoiceController.getById,
);
