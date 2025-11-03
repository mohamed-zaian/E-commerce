import slugify from "slugify";
import asyncHandler from "express-async-handler";
import Product from "../model/productModel.js";
import FactoryHandler from "./factoryhandler.js";

const factoryHandler = new FactoryHandler(Product);
export const setCategoryID = (req, res, next) => {
  if (req.params.id) {
    req.body.category = req.params.id;
  }
  next();
};
export const createProduct = asyncHandler(async (req, res) => {
  req.body.slug = slugify(req.body.name);

  const product = await Product.create(req.body);

  res.status(201).json({ product });
});

export const getlistProducts = factoryHandler.getAll;
export const getProduct = factoryHandler.getOne;

export const updateProduct = factoryHandler.updateOne;
export const deleteProduct = factoryHandler.deleteOne;
