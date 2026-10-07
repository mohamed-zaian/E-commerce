import { check } from "express-validator";
import bcrypt from "bcrypt";
import ValidationMiddleware from "../../middleware/validationMiddleware.js";
import User from "../../model/userModel.js";

export const createUserVaildator = [
  check("name").notEmpty().withMessage("the name is required"),
  check("email")
    .notEmpty()
    .withMessage("email is required")
    .isEmail()
    .withMessage("the email not valid")
    .custom(async (value) => {
      const existedUser = await User.findOne({ email: value });
      if (existedUser) {
        throw new Error("this email existed used");
      }
      return true;
    }),
  check("password")
    .notEmpty()
    .withMessage("passsword is required")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/,
    )
    .withMessage(
      "Password must be at least 8 characters, include uppercase, lowercase, number, and special character",
    )
    .custom((value, { req }) => {
      if (value !== req.body.confirmPassword) {
        throw new Error("the password not match with confirm password");
      }
      return true;
    }),
  check("confirmPassword")
    .notEmpty()
    .withMessage("you must enter confirm passwrod"),
  check("phone")
    .optional()
    .isMobilePhone("ar-EG")
    .withMessage("Invalid Egyptian phone number"),

  ValidationMiddleware,
];

export const changePasswordValidator = [
  check("confirmPassword")
    .notEmpty()
    .withMessage("you must enter confirm password"),
  check("currentPassword")
    .notEmpty()
    .withMessage("you must enter current password"),
  check("password")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/,
    )
    .withMessage(
      "Password must be at least 8 characters, include uppercase, lowercase, number, and special character",
    )
    .notEmpty()
    .withMessage("you must enter password")
    .custom(async (value, { req }) => {
      const user = await User.findById(req.params.id);
      if (!user) {
        throw new Error("this user in not found");
      }
      const isMatch = await bcrypt.compare(
        req.body.currentPassword,
        user.password,
      );
      if (!isMatch) {
        throw new Error("the current password is incorrect");
      }
      if (value !== req.body.confirmPassword) {
        throw new Error("the password not match with confirm password");
      }
      return true;
    }),

  ValidationMiddleware,
];

export const deleteUserValidator = [
  check("id").isMongoId().withMessage("this id format is not valid"),
];

export const updateUserValidator = [
  check("phone")
    .optional()
    .isMobilePhone("ar-EG")
    .withMessage("Invalid Egyptian phone number"),
  check("email")
    .optional()
    .isEmail()
    .withMessage("the email not valid")
    .custom(async (value) => {
      console.log(req.user._id);
      const existedUser = await User.findOne({
        email: value,
      });

      if (existedUser) {
        throw new Error("this email already exists");
      }

      return true;
    }),
];
export const getUserValidator = [
  check("id").isMongoId().withMessage("this id format is not valid"),
];

export const updateLoggedUserValidator = [
  check("phone")
    .optional()
    .isMobilePhone("ar-EG")
    .withMessage("Invalid Egyptian phone number"),
  check("email")
    .optional()
    .isEmail()
    .withMessage("the email not valid")
    .custom(async (value, { req }) => {
      const existedUser = await User.findOne({
        email: value,
        _id: { $ne: req.user._id },
      });
      if (existedUser) {
        throw new Error("this email existed used");
      }
      return true;
    }),
  ValidationMiddleware,
];
export const changeMyPasswordValidator = [
  check("confirmPassword")
    .notEmpty()
    .withMessage("you must enter confirm password"),
  check("currentPassword")
    .notEmpty()
    .withMessage("you must enter current password"),
  check("password")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/,
    )
    .withMessage(
      "Password must be at least 8 characters, include uppercase, lowercase, number, and special character",
    )
    .notEmpty()
    .withMessage("you must enter password")
    .custom(async (value, { req }) => {
      const user = await User.findById(req.user._id);
      if (!user) {
        throw new Error("this user in not found");
      }
      const isMatch = await bcrypt.compare(
        req.body.currentPassword,
        user.password,
      );
      if (!isMatch) {
        throw new Error("the current password is incorrect");
      }
      if (value !== req.body.confirmPassword) {
        throw new Error("the password not match with confirm password");
      }
      return true;
    }),

  ValidationMiddleware,
];
