import slugify from "slugify";
import asyncHandler from "express-async-handler";
import subCategoryModel from "../model/subcCategoryModel.js";
import FactoryHandler from "./factoryhandler.js";

const factoryHandler = new FactoryHandler(subCategoryModel);

export const CreateSubCategory = asyncHandler(async (req, res) => {
  const { name, category } = req.body;

  const SubCategory = await subCategoryModel.create({
    name,
    category,
    slug: slugify(name),
  });

  res.status(201).json({ SubCategory });
});

export const setID = (req, res, next) => {
  if (req.params.id) {
    req.body.category = req.params.id;
  }
  next();
};

export const getListOfSubCategories = factoryHandler.getAll;

export const getSubCategory = factoryHandler.getOne;

export const updateSubCategory = factoryHandler.updateOne;
export const deleteSubCategory = factoryHandler.deleteOne;
