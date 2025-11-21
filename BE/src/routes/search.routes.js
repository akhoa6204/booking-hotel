import { Router } from "express";
import { auth } from "../middleware/auth.js";
import { searchRooms } from "../controllers/search.controller.js";

export const searchRouter = Router();
searchRouter.get("/rooms", auth(false), searchRooms);
