import Category from "../model/categoryModel.js";
import FactoryHandler from "./factoryhandler.js";
import upload from "../middleware/uploadImageMiddleware.js";

const factoryHandler = new FactoryHandler(Category);

export const uploadCategoryImage = upload("Categories").single("image");

export const setImageUrl = (req, res, next) =>
{
    if (req.file)
    {
     req.body.image = req.file.path   
    }
    next()
}



export const CreateCategory = factoryHandler.createOne;

export const getListOfCategories = factoryHandler.getAll;

export const getCategory = factoryHandler.getOne();

export const updateCategory = factoryHandler.updateOne;
export const deleteCategory = factoryHandler.deleteOne;
