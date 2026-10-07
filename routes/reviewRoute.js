import express from "express";
import {
  createReview,
  getAllReviews,
  getReview,
  updateReview,
  deleteReview,
  setUserID,
  createFilterObj,
} from "../services/reviewService.js";
import { protect, restrictTo  , } from "../services/authService.js";


const reviewRoute = express.Router({mergeParams : true});
reviewRoute.use(protect, restrictTo("user", "admin", "manager"));

reviewRoute
  .route("/")
  .get(createFilterObj, getAllReviews)
  .post(setUserID, createFilterObj, createReview);

reviewRoute
  .route("/:reviewId")
  .get(getReview)
  .put(updateReview)
  .delete(deleteReview);
export default reviewRoute;
