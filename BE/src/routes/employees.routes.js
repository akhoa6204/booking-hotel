import { Router } from "express";
import * as EmployeesController from "../controllers/admin/employees.controller.js";
import { auth, requireRole, requireRoles } from "../middleware/auth.js";
export const employeesRouter = Router();

employeesRouter.get(
  "/",
  auth(true),
  requireRoles(["ADMIN", "MANAGER"]),
  EmployeesController.list,
);

employeesRouter.get(
  "/:id",
  auth(true),
  requireRoles(["ADMIN", "MANAGER"]),
  EmployeesController.getById,
);

employeesRouter.patch(
  "/:id",
  auth(true),
  requireRoles(["ADMIN", "MANAGER"]),
  EmployeesController.update,
);

employeesRouter.patch(
  "/:id/reset-password",
  auth(true),
  requireRoles(["ADMIN", "MANAGER"]),
  EmployeesController.changePassword,
);

employeesRouter.post(
  "/",
  auth(true),
  requireRoles(["ADMIN", "MANAGER"]),
  EmployeesController.create,
);
