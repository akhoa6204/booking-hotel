import { Router } from "express";
import { list } from "../controllers/admin/amenities.controller.js";
import { auth } from "../middleware/auth.js";

export const amenitiesRouter = Router();
amenitiesRouter.get("/", auth(true), list);
