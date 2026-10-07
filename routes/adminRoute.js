import express from "express";
import { protect, restrictTo } from "../services/authService.js";
import {
  getDashboardStats,
  getBestSellers,
  getAnalytics,
  getAllCustomers,
  getAllOrdersForAdmin,
} from "../services/adminService.js";

const adminRouter = express.Router();

// All admin routes require protection and admin role
adminRouter.use(protect, restrictTo("admin"));

// Dashboard stats
adminRouter.get("/stats", getDashboardStats);

// Best sellers
adminRouter.get("/bestsellers", getBestSellers);

// Analytics data
adminRouter.get("/analytics", getAnalytics);

// Customers (alias for /user with admin role)
adminRouter.get("/customers", getAllCustomers);

// Orders (alias for /order with admin role)
adminRouter.get("/orders", getAllOrdersForAdmin);

export default adminRouter;