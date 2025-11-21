import { Router } from "express";
import {
  login,
  me,
  register,
  requestPasswordReset,
  resetPassword,
  changePassword,
  updateAccount,
} from "../controllers/auth.controller.js";
import { auth } from "../middleware/auth.js";

export const authRouter = Router();
authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/password/request-reset", requestPasswordReset);
authRouter.post("/password/reset", resetPassword);
authRouter.get("/me", auth(), me);
authRouter.post("/change-password", auth(), changePassword);
authRouter.post("/info", auth(), updateAccount);
