import Category from "../model/categoryModel.js";
import FactoryHandler from "./factoryhandler.js";

const factoryHandler = new FactoryHandler(Category);

export const CreateCategory = factoryHandler.createOne;

export const getListOfCategories = factoryHandler.getAll;

export const getCategory = factoryHandler.getOne;

export const updateCategory = factoryHandler.updateOne;
export const deleteCategory = factoryHandler.deleteOne;
