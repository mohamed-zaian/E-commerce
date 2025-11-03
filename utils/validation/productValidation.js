import { check } from "express-validator";
import ValidationMiddleware from "../../middleware/validationMiddleware.js";
import Category from "../../model/categoryModel.js";
import subCategoryModel from "../../model/subcCategoryModel.js";

export const cretaProductValidator = [
  check("name")
    .notEmpty()
    .withMessage("the name is required")
    .isLength({ min: 2 })
    .withMessage("the name is too small"),
  check("description")
    .notEmpty()
    .withMessage("the description is required")
    .isLength({ max: 1000 })
    .withMessage("Too long description"),
  check("quantity")
    .notEmpty()
    .withMessage("the price is required")
    .isNumeric()
    .withMessage("the product quantity shoud be number"),
  check("sold").optional().isNumeric().withMessage("sold shoud be number"),
  check("price")
    .notEmpty()
    .withMessage("the price is required")
    .isNumeric()
    .withMessage("the price shoud be number"),
  check("priceAfterDiscount")
    .optional()
    .isNumeric()
    .toFloat()
    .custom((value, { req }) => {
      if (req.body.price <= value) {
        throw new Error("priceAfterDiscount must be lower than price");
      }
      return true;
    }),
  check("images")
    .optional()
    .isArray()
    .withMessage("images should be array of string"),
  check("colors")
    .optional()
    .isArray()
    .withMessage("availableColors should be array of string"),
  check("imageCover").notEmpty().withMessage("Product imageCover is required"),
  check("category")
    .notEmpty()
    .withMessage("the category is required")
    .isMongoId()
    .custom((category) =>
      Category.findById(category).then((categoryId) => {
        if (!categoryId) {
          return Promise.reject(new Error("this category not found"));
        }
        return true;
      })
    ),

  check("subcategories")
    .optional()
    .isArray()
    .withMessage("Subcategories must be an array of IDs")
    .custom((value) =>
      subCategoryModel.find({ _id: { $in: value } }).then((result) => {
        const checker = result.length !== value.length;
        console.log(checker);

        if (checker) {
          return Promise.reject(new Error("Subcategory is not found"));
        }

        return true;
      })
    )
    .custom((value, { req }) =>
      subCategoryModel.find({ category: req.body.category }).then((result) => {
        const subcategoriesID = result.map((s) => s._id.toString());
        const checker = value.every((id) => subcategoriesID.includes(id));
        if (!checker) {
          return Promise.reject(
            new Error("the subcategory not blong to this category")
          );
        }
        return true;
      })
    ),

  check("brand").optional().isMongoId().withMessage("Invalid ID formate"),
  check("ratingsAverage")
    .optional()
    .isNumeric()
    .withMessage("ratingsAverage must be a number")
    .isLength({ min: 1 })
    .withMessage("Rating must be above or equal 1.0")
    .isLength({ max: 5 })
    .withMessage("Rating must be below or equal 5.0"),
  check("ratingsQuantity")
    .optional()
    .isNumeric()
    .withMessage("ratingsQuantity must be a number"),
  ValidationMiddleware,
];

export const getProductValidator = [
  check("id").isMongoId().withMessage("Invalid ID formate"),
  ValidationMiddleware,
];
export const updateProductValidator = [
  check("id").isMongoId().withMessage("Invalid ID formate"),
];
export const deleteProductValidator = [
  check("id").isMongoId().withMessage("Invalid ID formate"),
];
