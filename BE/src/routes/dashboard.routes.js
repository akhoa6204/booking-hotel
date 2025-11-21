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
import { auth, requireRole } from "../middleware/auth.js";

export const dashboardRoutes = Router();
dashboardRoutes.get(
  "/summary",
  auth(),
  requireRole("MANAGER"),
  getDashboardSummary
);

dashboardRoutes.get(
  "/checkins",
  auth(),
  requireRole("MANAGER"),
  getDashboardCheckins
);
dashboardRoutes.get(
  "/checkouts",
  auth(),
  requireRole("MANAGER"),
  getDashboardCheckouts
);

dashboardRoutes.get(
  "/monthly-kpis",
  auth(),
  requireRole("MANAGER"),
  getMonthlyKpis
);

dashboardRoutes.get(
  "/monthly-revenue",
  auth(),
  requireRole("MANAGER"),
  getMonthlyRevenue
);

dashboardRoutes.get(
  "/monthly-booking-stats",
  auth(),
  requireRole("MANAGER"),
  getMonthlyBookingStats
);

dashboardRoutes.get(
  "/top-customers",
  auth(),
  requireRole("MANAGER"),
  getTopCustomers
);
