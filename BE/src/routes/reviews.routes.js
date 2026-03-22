import { Router } from "express";
import { auth, notRequireRole, requireRole } from "../middleware/auth.js";
import * as reviewController from "../controllers/common/reviews.controller.js";

export const reviewsRouter = Router();
export const reviewsAdminRouter = Router();

reviewsRouter.post("/", auth(), reviewController.create);

reviewsRouter.get("/", auth(), reviewController.list);

reviewsRouter.get("/:id", auth(), reviewController.getById);

reviewsAdminRouter.patch(
  "/:id",
  auth(),
  notRequireRole("CUSTOMER"),
  reviewController.updateStatus,
);

// reviewsRouter.get("/stats", auth(), requireRole("MANAGER"), getStats);
