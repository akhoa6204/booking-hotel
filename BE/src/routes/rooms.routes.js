// routes/rooms.routes.ts
import { Router } from "express";
import { auth, requireRole, requireRoles } from "../middleware/auth.js";
import * as AdminRoomsController from "../controllers/admin/rooms.controller.js";
import * as RoomsController from "../controllers/common/rooms.controller.js";

export const adminRoomsRouter = Router();
export const roomsRouter = Router();

adminRoomsRouter.get(
  "/",
  auth(),
  requireRoles(["ADMIN", "MANAGER"]),
  AdminRoomsController.list,
);

adminRoomsRouter.get(
  "/:id",
  auth(true),
  requireRoles(["ADMIN", "MANAGER"]),
  AdminRoomsController.getById,
);

adminRoomsRouter.post(
  "/",
  auth(true),
  requireRoles(["ADMIN", "MANAGER"]),
  AdminRoomsController.create,
);

adminRoomsRouter.patch(
  "/:id",
  auth(true),
  requireRoles(["ADMIN", "MANAGER"]),
  AdminRoomsController.update,
);

adminRoomsRouter.delete(
  "/:id",
  auth(true),
  requireRoles(["ADMIN", "MANAGER"]),
  AdminRoomsController.remove,
);

roomsRouter.post("/available", RoomsController.getAvailable);
roomsRouter.post("/quote", auth(false), RoomsController.quote);
