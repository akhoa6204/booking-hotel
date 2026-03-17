// routes/rooms.routes.ts
import { Router } from "express";
import { auth, requireRole, requireRoles } from "../middleware/auth.js";
import * as AdminRoomsController from "../controllers/admin/rooms.controller.js";
import * as RoomsController from "../controllers/common/rooms.controller.js";

export const adminRoomsRouter = Router();
export const roomsRouter = Router();

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

roomsRouter.get("/", RoomsController.list);
roomsRouter.get("/:id", RoomsController.getById);
roomsRouter.post("/quote", auth(false), RoomsController.quote);
