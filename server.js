import express from "express";
import morgan from "morgan";
import dotenv from "dotenv";
// eslint-disable-next-line import/no-extraneous-dependencies
import qs from "qs";
import dbConnection from "./config/db.js";
import categoryRouter from "./routes/categoryRout.js";
import subCategoryRouter from "./routes/subcategoryRout.js";
import brandRouter from "./routes/brandRout.js";
import productRoute from "./routes/productRoute.js";

dotenv.config({ path: "./config.env" });

dbConnection();
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("query parser", (str) => qs.parse(str));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use("/api/v1/category", categoryRouter);
app.use("/api/v1/subcategory", subCategoryRouter);
app.use("/api/v1/brand", brandRouter);
app.use("/api/v1/product", productRoute);

app.use((req, res, next) => {
  const err = new Error(`Not found: ${req.originalUrl}`);
  err.status = 404;
  next(err);
});

const port = process.env.PORT;

app.listen(port, () => {
  console.log(`we are live on ${port}`);
});
