import upload from "../middleware/uploadImageMiddleware.js";
import Product from "../model/productModel.js";
import FactoryHandler from "./factoryhandler.js";

export const uploadproductImage = upload("products").fields([
  {
    name: "imageCover",
    maxCount: 1,
  },
  {
    name: "images",
    maxCount: 5,
  },
]);

export const setImagetoBody = (req, res, next) => {
  try {
    const imagesUrl = [];

    // تأكد أن req.files موجود
    if (req.files) {
      // لو في imageCover
      if (req.files.imageCover && req.files.imageCover.length > 0) {
        req.body.imageCover = req.files.imageCover[0].path;
      }

      // لو في images
      if (req.files.images && req.files.images.length > 0) {
        req.files.images.forEach((element) => {
          imagesUrl.push(element.path);
        });
        req.body.images = imagesUrl;
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};

const factoryHandler = new FactoryHandler(Product);
export const setCategoryID = (req, res, next) => {
  if (req.params.id) {
    req.body.category = req.params.id;
  }
  next();
};
export const createProduct = factoryHandler.createOne;

export const getlistProducts = factoryHandler.getAll;
export const getProduct = factoryHandler.getOne("reviews");

export const updateProduct = factoryHandler.updateOne;
export const deleteProduct = factoryHandler.deleteOne;
