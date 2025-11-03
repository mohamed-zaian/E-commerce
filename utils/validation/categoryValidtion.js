import { check } from "express-validator";
import ValidationMiddleware from "../../middleware/validationMiddleware.js";


export const getCategoryValidator = [
  check("id").isMongoId().withMessage("Invalid category ID format"),
  ValidationMiddleware,
];

export const CreateCategoryValidor = [
  check("name")
    .notEmpty()
    .withMessage("The name is required")
    .isLength({ min: 2 })
    .withMessage("The name is too short")
    .isLength({ max: 32 })
    .withMessage("The name is too long"),
  ValidationMiddleware,
];

export const updateCategoryValidator = [
  check("id").isMongoId().withMessage("Invalid category ID format"),
  ValidationMiddleware,
];

export const deleteCategoryValidator = [
  check("id").isMongoId().withMessage("Invalid category ID format"),
  ValidationMiddleware,
];
