import { Router } from "express";
import { auth, notRequireRole } from "../middleware/auth.js";
import * as serviceController from "../controllers/admin/services.controller.js";

export const servicesRouter = Router();
servicesRouter.get(
  "/",
  auth(true),
  notRequireRole("CUSTOMER"),
  serviceController.list,
);

servicesRouter.get(
  "/:id",
  auth(true),
  notRequireRole("CUSTOMER"),
  serviceController.getById,
);

servicesRouter.post(
  "/",
  auth(true),
  notRequireRole("CUSTOMER"),
  serviceController.create,
);
servicesRouter.patch(
  "/:id",
  auth(true),
  notRequireRole("CUSTOMER"),
  serviceController.update,
);

servicesRouter.delete(
  "/:id",
  auth(true),
  notRequireRole("CUSTOMER"),
  serviceController.remove,
);
