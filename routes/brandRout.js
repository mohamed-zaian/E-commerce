import express from "express";
import {
  getListOfBrands,
  getBrand,
  updateBrand,
  deleteBrand,
  CreateBrand,
  uploadBrandImage,
} from "../services/brandServices.js";
import {
  CreateBrandValidator,
  deleteBrandValidator,
  getBrandValidator,
  updateBrandValidator,
} from "../utils/validation/brandValidation.js";
import { setImageUrl } from "../services/categoryServices.js";
import { protect, restrictTo } from "../services/authService.js";
import { createFilterObj } from "../services/reviewService.js";

const brandRouter = express.Router();

brandRouter
  .route("/")
  .post(protect , restrictTo("admin" , "manager"),uploadBrandImage, setImageUrl, CreateBrandValidator, CreateBrand)
  .get(createFilterObj ,  getListOfBrands);
brandRouter
  .route("/:id")
  .get(getBrandValidator, getBrand)
  .put(protect , restrictTo("admin" , "manager"),uploadBrandImage, updateBrandValidator, updateBrand)
  .delete(protect , restrictTo("admin" , "manager"), deleteBrandValidator, deleteBrand);

export default brandRouter;
