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
import { protect, restrictTo } from "../services/authService.js";
import { createReviewValidator, deleteReviewValidator, updateReviewValidator } from "../utils/validation/reviewValidation.js";


const reviewRoute = express.Router({mergeParams : true});
reviewRoute.use(protect, restrictTo("user", "admin", "manager"));

reviewRoute
  .route("/")
  .get(createFilterObj , getAllReviews)
  .post(setUserID, createReviewValidator, createReview);

reviewRoute
  .route("/:id")
  .get(getReview)
  .put(updateReviewValidator, updateReview)
  .delete(deleteReviewValidator, deleteReview);

export default reviewRoute;
