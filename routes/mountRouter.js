import categoryRouter from "./categoryRout.js";
import subCategoryRouter from "./subcategoryRout.js";
import productRoute from "./productRoute.js";
import userRouter from "./userRoute.js";
import authRouter from "./authRoute.js";
import reviewRoute from "./reviewRoute.js";
import wishlistRouter from "./wishListRoute.js";
import addressRoute from "./addressRoute.js";
import couponRouter from "./couponRoute.js";
import cartRoute from "./cartRoute.js";
import orderRouter from "./orderRoute.js";
import adminRouter from "./adminRoute.js";


const mountRoute = (app) => {
  app.use("/api/v1/category", categoryRouter);
  app.use("/api/v1/subcategory", subCategoryRouter);
  app.use("/api/v1/product", productRoute);
  app.use("/api/v1/user", userRouter);
  app.use("/api/v1/auth", authRouter);
  app.use("/api/v1/products/:productId/reviews", reviewRoute);
  app.use("/api/v1/wishlist", wishlistRouter);
  app.use("/api/v1/address", addressRoute);
  app.use("/api/v1/coupon", couponRouter);
  app.use("/api/v1/cart", cartRoute);
  app.use("/api/v1/order", orderRouter);
  app.use("/api/v1/admin", adminRouter);

};

export default mountRoute;