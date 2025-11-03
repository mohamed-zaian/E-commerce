import express from "express";
import {
  getlistProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  createProduct,
  setCategoryID,
} from "../services/productServices.js";
import {
  cretaProductValidator,
  deleteProductValidator,
  getProductValidator,
  updateProductValidator,
} from "../utils/validation/productValidation.js";

const productRoute = express.Router({mergeParams : true});

productRoute
  .route("/")
  .post(setCategoryID, cretaProductValidator, createProduct)
  .get( getlistProducts);
productRoute
  .route("/:id")
  .get(getProductValidator, getProduct)
  .put(updateProductValidator, updateProduct)
  .delete(deleteProductValidator, deleteProduct);

export default productRoute;
