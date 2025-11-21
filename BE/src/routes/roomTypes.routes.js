// routes/roomTypes.routes.ts
import { Router } from "express";
import {
  createRoomType,
  listRoomTypes,
  getRoomType,
  updateRoomType,
  deleteRoomType,
  listRoomTypesForGuest,
  getRoomTypeForGuest,
  getReviewsByRoomType,
  getReviewStatsByRoomType
} from "../controllers/roomTypes.controller.js";
import { auth, requireRole } from "../middleware/auth.js";
import {
  uploadRoomTypeImages,
  handleUploadError,
} from "../middleware/upload.js";

export const roomTypeRoute = Router();

/** Public (guest) */
roomTypeRoute.get("/customer", listRoomTypesForGuest);
roomTypeRoute.get("/customer/:id", getRoomTypeForGuest);
roomTypeRoute.get("/customer/:id/reviews", getReviewsByRoomType);
roomTypeRoute.get("/customer/:id/reviews-stats", getReviewStatsByRoomType);

/** Admin */
roomTypeRoute.get("/admin", auth(), requireRole("MANAGER"), listRoomTypes);
roomTypeRoute.get("/admin/:id", auth(), requireRole("MANAGER"), getRoomType);

roomTypeRoute.post(
  "/admin",
  auth(),
  requireRole("MANAGER"),
  uploadRoomTypeImages,
  handleUploadError,
  createRoomType
);

roomTypeRoute.put(
  "/admin/:id",
  auth(),
  requireRole("MANAGER"),
  uploadRoomTypeImages,
  handleUploadError,
  updateRoomType
);

roomTypeRoute.delete(
  "/admin/:id",
  auth(),
  requireRole("MANAGER"),
  deleteRoomType
);
