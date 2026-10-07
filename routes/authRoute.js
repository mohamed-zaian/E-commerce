import express from "express";
import { rateLimit } from "express-rate-limit";

import {
  login,
  signUP,
  forgotPassword,
  protect,
  verifyPasswordCode,
  resetPassword,
  logout,
} from "../services/authService.js";
import { signUpValidator } from "../utils/validation/authValidation.js";
import {
  getLoggedUserData,
  getUser,
  updateLoggedUserData,
  changeMyPassword,
} from "../services/userService.js";
import {
  changeMyPasswordValidator,
  updateLoggedUserValidator,
} from "../utils/validation/userValidation.js";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 5,
});
const authRouter = express.Router();

authRouter.post("/register",signUpValidator, signUP); // Alias for frontend
authRouter.post("/login", login);
authRouter.post("/logout", logout);
authRouter.get("/me", protect, getLoggedUserData, getUser);
authRouter.put(
  "/profile",
  protect,
  updateLoggedUserValidator,
  updateLoggedUserData,
);
authRouter.post(
  "/change-password",
  protect,
  changeMyPasswordValidator,
  changeMyPassword,
);
authRouter.post("/forgotPassword", protect, forgotPassword);
authRouter.post("/verifyPasswordCode", verifyPasswordCode);
authRouter.put("/resetPassword", limiter, resetPassword);

export default authRouter;
