
import FactoryHandler from "./factoryhandler.js";
import Coupon from '../model/couponModel.js';


const factoryHandler = new FactoryHandler(Coupon);
export const CreateCoupon = factoryHandler.createOne;
export const getListOfCoupons = factoryHandler.getAll;

export const getCoupon = factoryHandler.getOne();
export const updateCoupon = factoryHandler.updateOne;
export const deleteCoupon = factoryHandler.deleteOne;