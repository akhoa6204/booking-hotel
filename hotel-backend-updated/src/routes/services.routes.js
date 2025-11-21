import { Router } from "express";
import { auth, requireRole } from "../middleware/auth.js";
import { listServices, createService, updateService, deleteService } from "../controllers/services.controller.js";

export const servicesRouter = Router();
servicesRouter.get("/", auth(false), listServices);
servicesRouter.post("/", auth(), requireRole("MANAGER"), createService);
servicesRouter.put("/:id", auth(), requireRole("MANAGER"), updateService);
servicesRouter.delete("/:id", auth(), requireRole("MANAGER"), deleteService);
