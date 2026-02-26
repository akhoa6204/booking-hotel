import { Router } from "express";
import {
  getDashboardSummary,
  getDashboardCheckins,
  getDashboardCheckouts,
  getMonthlyKpis,
  getMonthlyRevenue,
  getMonthlyBookingStats,
  getTopCustomers,
} from "../controllers/dashboard.controller.js";
import { auth, requireRole, requireRoles } from "../middleware/auth.js";

export const dashboardRoutes = Router();
dashboardRoutes.get(
  "/summary",
  auth(true),
  requireRoles(["ADMIN", "MANAGER"]),
  getDashboardSummary,
);

dashboardRoutes.get(
  "/checkins",
  auth(true),
  requireRoles(["ADMIN", "MANAGER"]),
  getDashboardCheckins,
);
dashboardRoutes.get(
  "/checkouts",
  auth(true),
  requireRoles(["ADMIN", "MANAGER"]),
  getDashboardCheckouts,
);

dashboardRoutes.get(
  "/monthly-kpis",
  auth(true),
  requireRoles(["ADMIN", "MANAGER"]),
  getMonthlyKpis,
);

dashboardRoutes.get(
  "/monthly-revenue",
  auth(true),
  requireRoles(["ADMIN", "MANAGER"]),
  getMonthlyRevenue,
);

dashboardRoutes.get(
  "/monthly-booking-stats",
  auth(true),
  requireRoles(["ADMIN", "MANAGER"]),
  getMonthlyBookingStats,
);

dashboardRoutes.get(
  "/top-customers",
  auth(true),
  requireRoles(["ADMIN", "MANAGER"]),
  getTopCustomers,
);
