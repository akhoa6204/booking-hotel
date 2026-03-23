import { Router } from "express";
import * as dasboardController from "../controllers/admin/dashboard.controller.js";
import { auth, requireRole, requireRoles } from "../middleware/auth.js";

export const dashboardRoutes = Router();
dashboardRoutes.get(
  "/summary",
  auth(true),
  requireRoles(["ADMIN", "MANAGER", "RECEPTION"]),
  dasboardController.getDashboardSummary,
);

dashboardRoutes.get(
  "/checkins",
  auth(true),
  requireRoles(["ADMIN", "MANAGER", "RECEPTION"]),
  dasboardController.getDashboardCheckins,
);
dashboardRoutes.get(
  "/checkouts",
  auth(true),
  requireRoles(["ADMIN", "MANAGER", "RECEPTION"]),
  dasboardController.getDashboardCheckouts,
);

dashboardRoutes.get(
  "/monthly-kpis",
  auth(true),
  requireRoles(["ADMIN", "MANAGER"]),
  dasboardController.getMonthlyKpis,
);

dashboardRoutes.get(
  "/monthly-revenue",
  auth(true),
  requireRoles(["ADMIN", "MANAGER"]),
  dasboardController.getMonthlyRevenue,
);

dashboardRoutes.get(
  "/monthly-booking-stats",
  auth(true),
  requireRoles(["ADMIN", "MANAGER"]),
  dasboardController.getMonthlyBookingStats,
);
