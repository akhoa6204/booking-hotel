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
