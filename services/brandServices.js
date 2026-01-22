import Brand from "../model/brandModel.js";

import FactoryHandler from "./factoryhandler.js";
import upload from "../middleware/uploadImageMiddleware.js";

export const uploadBrandImage = upload('Brands').single('image')



const factoryHandler = new FactoryHandler(Brand);
export const CreateBrand = factoryHandler.createOne;
export const getListOfBrands = factoryHandler.getAll;

export const getBrand = factoryHandler.getOne();
export const updateBrand = factoryHandler.updateOne;
export const deleteBrand = factoryHandler.deleteOne;
