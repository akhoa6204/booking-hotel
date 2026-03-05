import { Router } from "express";
import { auth, notRequireRole, requireRoles } from "../middleware/auth.js";
import * as shiftController from "../controllers/admin/shifts.controller.js";

export const shiftsRouter = Router();

shiftsRouter.get(
  "/",
  auth(true),
  notRequireRole("CUSTOMER"),
  shiftController.list,
);

shiftsRouter.delete(
  "/:id",
  auth(true),
  requireRoles(["ADMIN", "MANAGER"]),
  shiftController.remove,
);

shiftsRouter.post(
  "/",
  auth(true),
  requireRoles(["ADMIN", "MANAGER"]),
  shiftController.create,
);

shiftsRouter.get(
  "/definitions",
  auth(true),
  notRequireRole("CUSTOMER"),
  shiftController.listShift,
);
