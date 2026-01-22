import express from "express";
import { rateLimit } from "express-rate-limit";

import {
  login,
  signUP,
  forgotPassword,
  protect,
  verifyPasswordCode,
  resetPassword,
} from "../services/authService.js";
import { signUpValidator } from "../utils/validation/authValidation.js";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 5,
});
const authRouter = express.Router();

authRouter.post("/signUp", signUpValidator, signUP);
authRouter.post("/login", login);
authRouter.post("/forgotPassword", protect, forgotPassword);
authRouter.post("/verifyPasswordCode", verifyPasswordCode);
authRouter.put("/resetPassword", limiter, resetPassword);

export default authRouter;
