import express from "express";
import {
  changeMyPassword,
  createUser,
  deleteUSer,
  getAllUser,
  getLoggedUserData,
  getUser,
  setImagetoBody,
  updateLoggedUserData,
  updateUser,
  uploadImage,
} from "../services/userService.js";
import {
  changeMyPasswordValidator,
  createUserVaildator,
  deleteUserValidator,
  getUserValidator,
  updateLoggedUserValidator,
  updateUserValidator,
} from "../utils/validation/userValidation.js";

import { protect, restrictTo } from "../services/authService.js";
import { createFilterObj } from "../services/reviewService.js";

const userRouter = express.Router();
userRouter.use(protect);

userRouter.get("/me", getLoggedUserData, getUser);
userRouter.put("/changeMyPassword", changeMyPasswordValidator, changeMyPassword);

userRouter.put(
  "/updateLoggedUser",
  updateLoggedUserValidator,
  updateLoggedUserData
);

userRouter.use(restrictTo("admin" ,"manager"));

userRouter
  .route("/")
  .get( createFilterObj, getAllUser)
  .post(uploadImage, setImagetoBody, createUserVaildator, createUser);

userRouter
  .route("/:id")
  .get(getUserValidator, getUser)
  .put(updateUserValidator, updateUser)
  .delete(deleteUserValidator, deleteUSer);

export default userRouter;
