import { check } from "express-validator";
import User from "../../model/userModel.js";
import ValidationMiddleware from "../../middleware/validationMiddleware.js";

export const signUpValidator = [
  check("firstName")
    .notEmpty()
    .withMessage("the first name is required"),
  check("lastName")
    .notEmpty()
    .withMessage("the last name is required"),
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
    .withMessage("password is required")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/
    )
    .withMessage(
      "Password must be at least 8 characters, include uppercase, lowercase, number, and special character"
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

  ValidationMiddleware,
];

export const loginValidator = [
  check("email")
    .notEmpty()
    .withMessage("email is required")
    .isEmail()
    .withMessage("the email not valid"),

  check("password").notEmpty().withMessage("password is required"),

  ValidationMiddleware  
];
