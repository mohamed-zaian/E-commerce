import express from "express";
import {
  getlistProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  createProduct,
  setCategoryID,
  uploadproductImage,
  setImagetoBody,

} from "../services/productServices.js";
import {
  cretaProductValidator,
  deleteProductValidator,
  getProductValidator,
  updateProductValidator,
} from "../utils/validation/productValidation.js";
import { protect, restrictTo } from "../services/authService.js";
import reviewRoute from "./reviewRoute.js";
import { createFilterObj } from "../services/reviewService.js";


const productRoute = express.Router({mergeParams : true});

productRoute.use("/:id/review" , reviewRoute)
productRoute
  .route("/")
  .post(
    protect,
    restrictTo("admin", "manager"),
    uploadproductImage,
    setImagetoBody,
    setCategoryID,
    cretaProductValidator,
    createProduct
  )
  .get(createFilterObj, getlistProducts);
productRoute
  .route("/:id")
  .get(getProductValidator, getProduct)
  .put(protect , restrictTo("admin" , "manager"), uploadproductImage, updateProductValidator, updateProduct)
  .delete(protect , restrictTo("admin" , "manager"), deleteProductValidator, deleteProduct);

export default productRoute;
