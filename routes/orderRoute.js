import express from "express";

import {
  filterByLoggerUser,
  getAllOrders,
  getSpacificOrder,
  createOrder,
  updateOrderStatus,
} from "../services/orderService.js";

import { protect} from "../services/authService.js";

const orderRouter = express.Router();

orderRouter.use(protect, filterByLoggerUser);

// Create order from cart
orderRouter.post("/create/:cartId", createOrder);



// Get all user orders
orderRouter.get("/", getAllOrders);

// Get one order
orderRouter.get("/:id", getSpacificOrder);
orderRouter.patch("/:id/status", updateOrderStatus);

export default orderRouter;
