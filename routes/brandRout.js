import express from "express";
import {
  getListOfBrands,
  getBrand,
  updateBrand,
  deleteBrand,
  CreateBrand,
} from "../services/brandServices.js";
import {
  CreateBrandValidator,
  deleteBrandValidator,
  getBrandValidator,
  updateBrandValidator, 
} from "../utils/validation/brandValidation.js";

const brandRouter = express.Router();

brandRouter
  .route("/")
  .post(CreateBrandValidator, CreateBrand)
  .get(getListOfBrands);
brandRouter
  .route("/:id")
  .get(getBrandValidator, getBrand)
  .put(updateBrandValidator, updateBrand)
  .delete(deleteBrandValidator, deleteBrand);

export default brandRouter;
