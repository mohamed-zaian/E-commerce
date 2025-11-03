import express from "express";
import {
  getListOfCategories,
  getCategory,
  updateCategory,
  deleteCategory,
  CreateCategory,
} from "../services/categoryServices.js";
import {
  CreateCategoryValidor,
  deleteCategoryValidator,
  getCategoryValidator,
  updateCategoryValidator,
} from "../utils/validation/categoryValidtion.js";
import subCategoryRouter from "./subcategoryRout.js";
import productRoute from "./productRoute.js";

const categoryRouter = express.Router();
categoryRouter.use("/:id/subcategory", subCategoryRouter);
categoryRouter.use("/:id/product", productRoute);

categoryRouter
  .route("/")
  .post(CreateCategoryValidor, CreateCategory)
  .get(getListOfCategories);
categoryRouter
  .route("/:id")
  .get(getCategoryValidator, getCategory)
  .put(updateCategoryValidator, updateCategory)
  .delete(deleteCategoryValidator, deleteCategory);

export default categoryRouter;
