import asyncHandler from "express-async-handler";

import FactoryHandler from "./factoryhandler.js";
import Review from "../model/reviewModel.js";
import Product from "../model/productModel.js";
import redisClient, { redisReady } from "../config/redis.js";

const factoryHandler = new FactoryHandler(Review);
const CACHE_TTL = 60;

// Invalidate review and related product caches
const invalidateReviewCache = async (productId) => {
  try {
    if (!redisClient.isReady) return;

    const patterns = [
      "Review:*",
      "Product:*",
      ...(productId ? [`Product:details:${productId}`] : []),
    ];

    await Promise.all(
      patterns.map(async (pattern) => {
        const keys = [];

        // Use scanIterator to find matching keys
        for await (const key of redisClient.scanIterator({
          MATCH: pattern,
          COUNT: 100,
        })) {
          keys.push(key);
        }

        if (keys.length) {
          await redisClient.del(keys);
        }
      }),
    );
  } catch (error) {
    console.error("[Redis] Review cache invalidation failed:", error.message);
  }
};

export const setUserID = (req, res, next) => {
  if (!req.body.user) req.body.user = req.user._id;
  next();
};

export const createFilterObj = (req, res, next) => {
  req.filter = {};

  if (req.params.productId) {
    req.filter.product = req.params.productId;

    if (req.method !== "GET") {
      req.body.product = req.params.productId;
    }
  }

  next();
};

// Create review and invalidate related caches
export const createReview = asyncHandler(async (req, res, next) => {
  await factoryHandler.createOne(req, res, async () => {
    await invalidateReviewCache(req.body.product);
    next();
  });
});

// Read operations use FactoryHandler caching
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

  await invalidateReviewCache(review.product.toString());

  return res.status(200).json({
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

  await invalidateReviewCache(review.product.toString());

  return res.status(200).json({
    message: "Review deleted successfully",
  });
});
