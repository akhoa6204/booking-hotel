import { Router } from "express";
import { auth, requireRole } from "../middleware/auth.js";
import { getHotel, upsertHotel } from "../controllers/hotels.controller.js";

export const hotelsRouter = Router();
hotelsRouter.get("/", auth(false), getHotel);
hotelsRouter.post("/", auth(), requireRole("MANAGER"), upsertHotel);
