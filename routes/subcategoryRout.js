import express from "express";
import {
  createSubCategoryValidator,
  deleteSubCategoryValidator,
  getSubCategoryValidator,
  updateSubSubCategoryValidator,
} from "../utils/validation/subCategoryValidation.js";
import {
  CreateSubCategory,
  deleteSubCategory,
  getListOfSubCategories,
  getSubCategory,
  updateSubCategory,
  setID,
} from "../services/subCategoryService.js";

const subCategoryRouter = express.Router({ mergeParams: true });

subCategoryRouter
  .route("/")
  .post(setID, createSubCategoryValidator, CreateSubCategory)
  .get(getListOfSubCategories);

subCategoryRouter
  .route("/:id")
  .put(updateSubSubCategoryValidator, updateSubCategory)
  .get(getSubCategoryValidator, getSubCategory)
  .delete(deleteSubCategoryValidator, deleteSubCategory);

export default subCategoryRouter;
