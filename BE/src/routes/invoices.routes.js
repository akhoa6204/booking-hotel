import { Router } from "express";
import { auth, notRequireRole } from "../middleware/auth.js";
import * as invoiceController from "../controllers/admin/invoices.controller.js";
import * as customerInvoiceController from "../controllers/common/invoices.controller.js";
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

export const customerInvoiceRoutes = Router();

customerInvoiceRoutes.get("/:id", customerInvoiceController.getById);
