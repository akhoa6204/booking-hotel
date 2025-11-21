// routes/rooms.routes.ts
import { Router } from "express";
import { auth, requireRole } from "../middleware/auth.js";
import {
  listRooms,
  createRoom,
  updateRoom,
  getRoom,
  toggleRoomActiveStatus,
  getRoomsAvailable,
} from "../controllers/rooms.controller.js";

export const roomsRouter = Router();

roomsRouter.get("/", auth(false), listRooms);

roomsRouter.get("/:id", auth(), requireRole("MANAGER"), getRoom);

roomsRouter.post("/", auth(), requireRole("MANAGER"), createRoom);

roomsRouter.put("/:id", auth(), requireRole("MANAGER"), updateRoom);

roomsRouter.patch(
  "/:id/toggle",
  auth(),
  requireRole("MANAGER"),
  toggleRoomActiveStatus
);

roomsRouter.post("/available", auth(false), getRoomsAvailable);
