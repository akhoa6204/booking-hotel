import { Router } from "express";
import { auth, requireRoles } from "../middleware/auth.js";
import * as PromotionController from "../controllers/admin/promotions.controller.js";

export const promosRouter = Router();
promosRouter.get(
  "/",
  auth(true),
  requireRoles(["ADMIN", "MANAGER"]),
  PromotionController.list,
);
promosRouter.get(
  "/:id",
  auth(true),
  requireRoles(["ADMIN", "MANAGER"]),
  PromotionController.getById,
);
promosRouter.post(
  "/",
  auth(true),
  requireRoles(["ADMIN", "MANAGER"]),
  PromotionController.create,
);
promosRouter.patch(
  "/:id",
  auth(true),
  requireRoles(["ADMIN", "MANAGER"]),
  PromotionController.update,
);
promosRouter.delete(
  "/:id",
  auth(true),
  requireRoles(["ADMIN", "MANAGER"]),
  PromotionController.remove,
);
