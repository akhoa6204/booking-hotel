import { Router } from "express";
import { auth, notRequireRole } from "../middleware/auth.js";
import * as housekeepingController from "../controllers/admin/housekeepings.controller.js";
export const houseKeepingRoutes = Router();

houseKeepingRoutes.get(
  "/",
  auth(true),
  notRequireRole("CUSTOMER"),
  housekeepingController.list,
);

houseKeepingRoutes.get(
  "/:id",
  auth(true),
  notRequireRole("CUSTOMER"),
  housekeepingController.getById,
);

houseKeepingRoutes.patch(
  "/:id",
  auth(true),
  notRequireRole("CUSTOMER"),
  housekeepingController.update,
);

houseKeepingRoutes.post(
  "/",
  auth(true),
  notRequireRole("CUSTOMER"),
  notRequireRole("HOUSEKEEPING"),
  housekeepingController.create,
);
