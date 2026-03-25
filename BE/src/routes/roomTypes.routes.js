import { Router } from "express";
import * as AdminController from "../controllers/admin/roomtypes.controller.js";
import * as CustomerController from "../controllers/common/roomtypes.controller.js";
import {
  auth,
  notRequireRole,
  requireRole,
  requireRoles,
} from "../middleware/auth.js";
import {
  uploadRoomTypeImages,
  handleUploadError,
} from "../middleware/upload.js";

export const roomTypeRoute = Router();
roomTypeRoute.get("/", CustomerController.list);
roomTypeRoute.get("/:id", CustomerController.getById);
roomTypeRoute.get("/:id/avaibility", CustomerController.getRoomAvailable);
roomTypeRoute.get("/:id/reviews", CustomerController.getReviews);
roomTypeRoute.get("/:id/review-stats", CustomerController.getReviewStats);

export const roomTypeAdminRoute = Router();
roomTypeAdminRoute.get(
  "/",
  auth(true),
  requireRoles(["ADMIN", "MANAGER"]),
  AdminController.list,
);

roomTypeAdminRoute.post(
  "/",
  auth(true),
  requireRoles(["ADMIN", "MANAGER"]),
  uploadRoomTypeImages,
  handleUploadError,
  AdminController.create,
);

roomTypeAdminRoute.get(
  "/:id",
  auth(true),
  requireRoles(["ADMIN", "MANAGER"]),
  AdminController.getById,
);

roomTypeAdminRoute.patch(
  "/:id",
  auth(true),
  requireRoles(["ADMIN", "MANAGER"]),
  uploadRoomTypeImages,
  handleUploadError,
  AdminController.update,
);
roomTypeAdminRoute.delete(
  "/:id",
  auth(true),
  requireRoles(["ADMIN", "MANAGER"]),
  AdminController.remove,
);
