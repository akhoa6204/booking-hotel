import { Router } from "express";
import { auth, requireRole } from "../middleware/auth.js";
import { listPromotions, createPromotion, updatePromotion, deletePromotion } from "../controllers/promotions.controller.js";

export const promosRouter = Router();
promosRouter.get("/", auth(), requireRole("MANAGER"), listPromotions);
promosRouter.post("/", auth(), requireRole("MANAGER"), createPromotion);
promosRouter.put("/:id", auth(), requireRole("MANAGER"), updatePromotion);
promosRouter.delete("/:id", auth(), requireRole("MANAGER"), deletePromotion);
