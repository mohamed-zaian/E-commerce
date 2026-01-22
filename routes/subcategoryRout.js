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
import { protect, restrictTo } from "../services/authService.js";
import { createFilterObj } from "../services/reviewService.js";

const subCategoryRouter = express.Router({ mergeParams: true });

subCategoryRouter
  .route("/")
  .post(protect , restrictTo("admin" , "manager")  ,setID, createSubCategoryValidator, CreateSubCategory)
  .get(createFilterObj ,getListOfSubCategories);

subCategoryRouter
  .route("/:id")
  .put(protect , restrictTo("admin" , "manager"), updateSubSubCategoryValidator, updateSubCategory)
  .get(getSubCategoryValidator, getSubCategory)
  .delete(protect , restrictTo("admin" , "manager"), deleteSubCategoryValidator, deleteSubCategory);

export default subCategoryRouter;
