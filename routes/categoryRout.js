import express from "express";
import {
  getListOfCategories,
  getCategory,
  updateCategory,
  deleteCategory,
  CreateCategory,
  uploadCategoryImage,
  setImageUrl,
} from "../services/categoryServices.js";
import {
  CreateCategoryValidor,
  deleteCategoryValidator,
  getCategoryValidator,
  updateCategoryValidator,
} from "../utils/validation/categoryValidtion.js";
import subCategoryRouter from "./subcategoryRout.js";
import productRoute from "./productRoute.js";
import { protect, restrictTo } from "../services/authService.js";
import { createFilterObj } from "../services/reviewService.js";

const categoryRouter = express.Router();
categoryRouter.use("/:id/subcategory", subCategoryRouter);
categoryRouter.use("/:id/product", productRoute);

categoryRouter
  .route("/")
  .post( protect , restrictTo("admin" , "manager") , uploadCategoryImage, setImageUrl, CreateCategoryValidor, CreateCategory)
  .get(createFilterObj , getListOfCategories);
categoryRouter
  .route("/:id")
  .get(getCategoryValidator, getCategory)
  .put(
    protect , restrictTo("admin" , "manager"),
    uploadCategoryImage,

    updateCategoryValidator,
    updateCategory
  )
  .delete(protect , restrictTo("admin" , "manager"), deleteCategoryValidator, deleteCategory);

export default categoryRouter;
