import express from "express";
import { restrictTo, protect } from "../services/authService.js";

import {
  addProductToCart,
  applyCoupon,
  clearCart,
  getCart,
  removeProductFromCart,
  updateProductQuantityInCart,
  getCartItem,
} from "../services/cartService.js";

const router = express.Router();
router.use(protect, restrictTo("user" , "admin"));

router.route("/applyCoupon").put(applyCoupon);

router.route("/").get(getCart).delete(clearCart).post(addProductToCart);
router
  .route("/:productId")
  .get(getCartItem)
  .delete(removeProductFromCart)
  .put(updateProductQuantityInCart);


export default router;