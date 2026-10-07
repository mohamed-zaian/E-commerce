import FactoryHandler from "./factoryhandler.js";
import Review from "../model/reviewModel.js";
import asyncHandler from "express-async-handler";
import Product from "../model/productModel.js"
const factoryHandler = new FactoryHandler(Review);
export const setUserID = (req, res, next) => {
  if (!req.body.user) req.body.user = req.user._id;
  next();
};

export const createFilterObj = (req, res, next) => {
  req.filter = {};

  if (req.params.productId) {
    req.filter.product = req.params.productId;

    if (!req.method === "GET") {
      req.body.product = req.params.productId;
    }
  }

  next();
};

export const createReview = factoryHandler.createOne;
export const getAllReviews = factoryHandler.getAll;
export const getReview = factoryHandler.getOne();
export const updateReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.reviewId);

  if (!review) {
    return res.status(404).json({
      message: "Review not found",
    });
  }

  const updatedReview = await Review.findByIdAndUpdate(
    req.params.reviewId,
    {
      title: req.body.title,
      rating: req.body.rating,
    },
    {
      new: true,
      runValidators: true,
    },
  );

  const reviews = await Review.find({
    product: review.product,
  });

  const ratingQuantity = reviews.length;

  const ratingsAverage =
    ratingQuantity === 0
      ? 0
      : reviews.reduce((sum, item) => sum + item.rating, 0) / ratingQuantity;

  await Product.findByIdAndUpdate(review.product, {
    ratingsAverage,
    ratingQuantity,
  });

  res.status(200).json({
    message: "Review updated successfully",
    data: updatedReview,
  });
});


export const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.reviewId);

  if (!review) {
    return res.status(404).json({
      message: "Review not found",
    });
  }

  await Review.findByIdAndDelete(req.params.reviewId);

  const reviews = await Review.find({
    product: review.product,
  });



  const ratingQuantity = reviews.length;

  const ratingsAverage =
    ratingQuantity === 0
      ? 0
      : reviews.reduce((sum, item) => sum + item.rating, 0) / ratingQuantity;

  

  await Product.findByIdAndUpdate(review.product, {
    ratingsAverage,
    ratingQuantity,
  });

  res.status(200).json({
    message: "Review deleted successfully",
  });
});
