import { Router } from "express";
import { auth, notRequireRole, requireRole } from "../middleware/auth.js";
import * as reviewController from "../controllers/common/reviews.controller.js";

export const reviewsRouter = Router();
export const reviewsAdminRouter = Router();

reviewsRouter.post("/", auth(), reviewController.create);

reviewsRouter.get("/", auth(), reviewController.list);

reviewsRouter.get("/stats", auth(), reviewController.getStats);

reviewsRouter.get("/:id", auth(), reviewController.getById);

reviewsRouter.patch(
  "/:id",
  auth(true),
  notRequireRole("CUSTOMER"),
  reviewController.updateStatus,
);
