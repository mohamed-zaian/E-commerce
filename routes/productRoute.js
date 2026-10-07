import express from "express";

import {
  getlistProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  createProduct,
  uploadproductImage,
  setImagetoBody,
  getFeaturedProducts,
  getNewArrivals,
  getOnSaleProducts,
  getBestSellers,
  getTrendingProducts,
  getRelatedProducts,
  parseProductFields
} from "../services/productServices.js";

import {
  cretaProductValidator,
  deleteProductValidator,
  getProductValidator,
  updateProductValidator,
} from "../utils/validation/productValidation.js";

import { protect, restrictTo } from "../services/authService.js";

import reviewRoute from "./reviewRoute.js";

const productRoute = express.Router({
  mergeParams: true,
});

// Special routes FIRST

productRoute.get("/special/featured", getFeaturedProducts);

productRoute.get("/special/new-arrivals", getNewArrivals);

productRoute.get("/special/on-sale", getOnSaleProducts);

productRoute.get("/special/bestsellers", getBestSellers);

productRoute.get("/special/trending", getTrendingProducts);

productRoute.get("/special/related/:id", getRelatedProducts);


// Reviews
productRoute.use("/:id/reviews", reviewRoute);
// Main CRUD

productRoute
  .route("/")

  .post(
    protect,
    restrictTo("admin"),
    uploadproductImage,
    setImagetoBody,
    parseProductFields,
    cretaProductValidator,
    createProduct,
  )

  .get(getlistProducts);

productRoute
  .route("/:id")

  .get(getProductValidator, getProduct)

  .put(
    protect,
    restrictTo("admin"),
    uploadproductImage,
    setImagetoBody,
    parseProductFields,
    updateProductValidator,
    updateProduct,
  )

  .delete(
    protect,
    restrictTo("admin"),
    deleteProductValidator,
    deleteProduct,
  );

export default productRoute;
