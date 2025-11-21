import { Router } from "express";
import { auth } from "../middleware/auth.js";
import { listMyNotifications, markRead } from "../controllers/notifications.controller.js";

export const notificationsRouter = Router();
notificationsRouter.get("/", auth(), listMyNotifications);
notificationsRouter.patch("/:id/read", auth(), markRead);
