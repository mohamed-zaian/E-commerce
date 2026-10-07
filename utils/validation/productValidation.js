import { check } from "express-validator";
import ValidationMiddleware from "../../middleware/validationMiddleware.js";
import Category from "../../model/categoryModel.js";
import SubCategory from "../../model/subcCategoryModel.js";

// ==========================================
// CREATE PRODUCT
// ==========================================

export const cretaProductValidator = [
  // ==========================
  // Name
  // ==========================

  check("name")
    .notEmpty()
    .withMessage("The product name is required")
    .isLength({ min: 2 })
    .withMessage("The product name is too short"),

  // ==========================
  // Description
  // ==========================

  check("description")
    .notEmpty()
    .withMessage("The description is required")
    .isLength({ max: 1000 })
    .withMessage("Description is too long"),

  // ==========================
  // Price
  // ==========================

  check("price")
    .notEmpty()
    .withMessage("The price is required")
    .isNumeric()
    .withMessage("The price must be a number"),

  // ==========================
  // Discount Price
  // ==========================

  check("priceAfterDiscount")
    .optional({ checkFalsy: true })
    .isNumeric()
    .withMessage("priceAfterDiscount must be a number")
    .toFloat()
    .custom((value, { req }) => {
      const price = Number(req.body.price);

      if (value >= price) {
        throw new Error("priceAfterDiscount must be lower than price");
      }

      return true;
    }),

  // ==========================
  // Images
  // ==========================

  check("imageCover").notEmpty().withMessage("Product imageCover is required"),

  check("images").optional().isArray().withMessage("Images must be an array"),

  // ==========================
  // Colors
  // ==========================

  check("colors").optional().isArray().withMessage("Colors must be an array"),

  // ==========================
  // Sizes
  // ==========================

  check("sizes")
    .notEmpty()
    .withMessage("Product sizes are required")
    .isArray()
    .withMessage("Sizes must be an array"),

  // ==========================
  // Category
  // ==========================

  check("category")
    .notEmpty()
    .withMessage("The category is required")
    .isMongoId()
    .withMessage("Invalid category ID")
    .custom(async (category) => {
      const categoryExists = await Category.findById(category);

      if (!categoryExists) {
        throw new Error("This category was not found");
      }

      return true;
    }),

  // ==========================
  // SubCategory
  // ==========================

  // ==========================
  // Boolean fields
  // ==========================

  check("featured")
    .optional()
    .isBoolean()
    .withMessage("featured must be true or false"),

  check("isNewArrival")
    .optional()
    .isBoolean()
    .withMessage("isNewArrival must be true or false"),

  check("onSale")
    .optional()
    .isBoolean()
    .withMessage("onSale must be true or false"),

  check("isBestSeller")
    .optional()
    .isBoolean()
    .withMessage("isBestSeller must be true or false"),

  check("isTrending")
    .optional()
    .isBoolean()
    .withMessage("isTrending must be true or false"),

  // ==========================
  // Materials
  // ==========================

  check("materials")
    .optional()
    .isString()
    .withMessage("Materials must be a string"),

  // ==========================
  // Tags
  // ==========================

  check("tags").optional().isArray().withMessage("Tags must be an array"),

  // ==========================
  // Validation middleware
  // ==========================

  ValidationMiddleware,
];

// ==========================================
// GET PRODUCT
// ==========================================

export const getProductValidator = [
  check("id").isMongoId().withMessage("Invalid ID format"),

  ValidationMiddleware,
];

// ==========================================
// UPDATE PRODUCT
// ==========================================

export const updateProductValidator = [
  check("id").isMongoId().withMessage("Invalid ID format"),

  // Only validate fields that are actually sent

  check("name")
    .optional()
    .isLength({ min: 2 })
    .withMessage("The product name is too short"),

  check("description")
    .optional()
    .isLength({ max: 1000 })
    .withMessage("Description is too long"),

  check("price").optional().isNumeric().withMessage("Price must be a number"),

  check("priceAfterDiscount")
    .optional({ checkFalsy: true })
    .isNumeric()
    .withMessage("priceAfterDiscount must be a number")
    .toFloat()
    .custom((value, { req }) => {
      if (req.body.price !== undefined && value >= Number(req.body.price)) {
        throw new Error("priceAfterDiscount must be lower than price");
      }

      return true;
    }),

  check("images").optional().isArray().withMessage("Images must be an array"),

  check("colors").optional().isArray().withMessage("Colors must be an array"),

  check("sizes").optional().isArray().withMessage("Sizes must be an array"),

  check("category")
    .optional()
    .isMongoId()
    .withMessage("Invalid category ID")
    .custom(async (category) => {
      const categoryExists = await Category.findById(category);

      if (!categoryExists) {
        throw new Error("This category was not found");
      }

      return true;
    }),

  check("featured")
    .optional()
    .isBoolean()
    .withMessage("featured must be true or false"),

  check("isNewArrival")
    .optional()
    .isBoolean()
    .withMessage("isNewArrival must be true or false"),

  check("onSale")
    .optional()
    .isBoolean()
    .withMessage("onSale must be true or false"),

  check("isBestSeller")
    .optional()
    .isBoolean()
    .withMessage("isBestSeller must be true or false"),

  check("isTrending")
    .optional()
    .isBoolean()
    .withMessage("isTrending must be true or false"),

  check("materials")
    .optional()
    .isString()
    .withMessage("Materials must be a string"),

  check("tags").optional().isArray().withMessage("Tags must be an array"),

  // IMPORTANT
  ValidationMiddleware,
];

// ==========================================
// DELETE PRODUCT
// ==========================================

export const deleteProductValidator = [
  check("id").isMongoId().withMessage("Invalid ID format"),

  ValidationMiddleware,
];
