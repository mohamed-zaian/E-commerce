import { check } from "express-validator";
import ValidationMiddleware from "../../middleware/validationMiddleware.js";

export const getBrandValidator = [
  check("id").isMongoId().withMessage("Invalid brand ID format"),
  ValidationMiddleware,
];

export const CreateBrandValidator = [
  check("name")
    .notEmpty()
    .withMessage("The name is required")
    .isLength({ min: 2 })
    .withMessage("The name is too short")
    .isLength({ max: 32 })
    .withMessage("The name is too long"),
  ValidationMiddleware,
];

export const updateBrandValidator = [
  check("id").isMongoId().withMessage("Invalid brand ID format"),
  check("name")
    .optional()
    .isLength({ min: 2 })
    .withMessage("The name is too short")
    .isLength({ max: 32 })
    .withMessage("The name is too long"),
  ValidationMiddleware,
];

export const deleteBrandValidator = [
  check("id").isMongoId().withMessage("Invalid brand ID format"),
  ValidationMiddleware,
];
