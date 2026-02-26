import { Router } from "express";
import {
  login,
  me,
  register,
  requestPasswordReset,
  resetPassword,
  changePassword,
  updateAccount,
} from "../controllers/common/auth.controller.js";
import { auth } from "../middleware/auth.js";

export const authRouter = Router();
authRouter.post("/register", register);
authRouter.post("/login", login);

authRouter.get("/me", auth(true), me);
authRouter.patch("/me", auth(true), updateAccount);

authRouter.patch("/password", auth(true), changePassword);

authRouter.post("/password/reset-request", requestPasswordReset);
authRouter.post("/password/reset", resetPassword);
