import express from "express";
import { checkoutSession } from "../services/orderService.js";

import { protect, restrictTo } from "../services/authService.js";
import { getAllReviews } from "../services/reviewService.js";

const orderRouter = express.Router();

orderRouter.get(
  "/checkout/:cartId",
  protect,
  restrictTo("user"),
  checkoutSession,
);


orderRouter.route("/").get(getAllReviews)

export default orderRouter