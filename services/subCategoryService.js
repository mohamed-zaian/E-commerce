import subCategoryModel from "../model/subcCategoryModel.js";
import FactoryHandler from "./factoryhandler.js";

const factoryHandler = new FactoryHandler(subCategoryModel);

export const CreateSubCategory = factoryHandler.createOne;

export const setID = (req, res, next) => {
  if (req.params.id) {
    req.body.category = req.params.id;
  }
  next();
};
export const getListOfSubCategories = async (req, res) => {
  let filter = {};

  if (req.params.categoryId) {
    filter.category = req.params.categoryId;
  }

  const subCategories = await subCategoryModel.find(filter);

  const uniqueSubCategories = [
    ...new Map(subCategories.map((item) => [item.name, item])).values(),
  ];

  res.status(200).json({
    results: uniqueSubCategories.length,
    data: uniqueSubCategories,
  });
};
export const getSubCategory = factoryHandler.getOne();

export const updateSubCategory = factoryHandler.updateOne;
export const deleteSubCategory = factoryHandler.deleteOne;
