import FactoryHandler from "./factoryhandler.js";
import Review from "../model/reviewModel.js";

const factoryHandler = new FactoryHandler(Review);

export const setUserID = (req, res, next) => {
  if (!req.body.user) req.body.user = req.user._id;
  next();
};

export const createFilterObj = (req, res, next) => {
  req.filter = {}; // always initialize as object

  if (req.params.id) {
    req.filter.product = req.params.id;
  }

  next();
};


export const createReview = factoryHandler.createOne;
export const getAllReviews = factoryHandler.getAll;
export const getReview = factoryHandler.getOne();
export const updateReview = factoryHandler.updateOne;
export const deleteReview = factoryHandler.deleteOne;
