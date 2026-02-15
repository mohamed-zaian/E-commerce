import express from "express";
import morgan from "morgan";
import dotenv from "dotenv";
// eslint-disable-next-line import/no-extraneous-dependencies
import qs from "qs";
import hpp from "hpp";
import dbConnection from "./config/db.js";
import mountRoute from "./routes/mountRouter.js";

dotenv.config({ path: "./config.env" });

dbConnection();
const app = express();

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));

app.set("query parser", (str) => qs.parse(str));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
app.use(hpp());

mountRoute(app);

app.use((req, res, next) => {
  const err = new Error(`Not found: ${req.originalUrl}`);
  err.status = 404;
  next(err);
});

const port = process.env.PORT;

app.listen(port, () => {
  console.log(`we are live on ${port}`);
});
