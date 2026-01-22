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

export const getListOfSubCategories = factoryHandler.getAll;

export const getSubCategory = factoryHandler.getOne();

export const updateSubCategory = factoryHandler.updateOne;
export const deleteSubCategory = factoryHandler.deleteOne;
