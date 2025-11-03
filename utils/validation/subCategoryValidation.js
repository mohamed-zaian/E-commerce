import { check } from "express-validator";
import ValidationMiddleware from "../../middleware/validationMiddleware.js";
import subCategoryModel from "../../model/subcCategoryModel.js";

export const getSubCategoryValidator = [
  check("id").isMongoId().withMessage("Invalid SubCategory ID format"),
  ValidationMiddleware,
];

export const createSubCategoryValidator = [
  check("name")
    .notEmpty()
    .withMessage("The name is required")
    .isLength({ min: 2 })
    .withMessage("The name is too short")
    .isLength({ max: 32 })
    .withMessage("The name is too long")
    .custom(async (value) => {
      const existingSubCategory = await subCategoryModel.findOne({
        name: value,
      });
      if (existingSubCategory) {
        throw new Error("SubCategory is existing in dataBase    ");
      }
      return true;
    }),
  check("category")
    .notEmpty()
    .withMessage("Subcategory must belong to a category")
    .isMongoId()
    .withMessage("Invalid category ID format"),
  ValidationMiddleware,
];

export const updateSubSubCategoryValidator = [
    check("id").isMongoId().withMessage("Invalid SubCategory ID format"),
    check("name").custom(async (value) => {
      const existingSubCategory = await subCategoryModel.findOne({ name: value });
      if (existingSubCategory) {
        throw new Error("SubCategory name must be unique");
      }
      return true;
    }),
  ValidationMiddleware,
];

export const deleteSubCategoryValidator = [
  check("id").isMongoId().withMessage("Invalid SubCategory ID format"),
  ValidationMiddleware,
];
