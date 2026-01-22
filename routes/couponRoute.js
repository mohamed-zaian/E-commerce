import express from "express";

import { restrictTo, protect } from "../services/authService.js";
import {
  CreateCoupon,
  getCoupon,
  getListOfCoupons,
  deleteCoupon,
  updateCoupon,
} from "../services/couponService.js";

const couponRouter = express.Router();
couponRouter.use(protect, restrictTo("admin", "manager"));

couponRouter.route("/").post(CreateCoupon).get(getListOfCoupons);
couponRouter
  .route("/:id")
  .put(updateCoupon)
  .delete(deleteCoupon)
  .get(getCoupon);
export default couponRouter;
