import express from "express";
import morgan from "morgan";
import dotenv from "dotenv";
import qs from "qs";
import hpp from "hpp";
import cors from "cors";

import dbConnection from "./config/db.js";

dotenv.config({
  path: "./config.env",
});



const app = express();
const allowedOrigins = [
  "http://localhost:5174",
  "https://rock-six-gilt.vercel.app",
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);

// =======================
// Middlewares
// =======================

// CORS Configuration

app.use(
  express.json({
    limit: "10kb",
  }),
);

app.use(
  express.urlencoded({
    extended: true,
  }),
);

app.set("query parser", (str) => qs.parse(str));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(hpp());

// =======================
// Start Server
// =======================

const startServer = async () => {
  try {
    // Connect database first

    await dbConnection();

    // Import models/routes after connection

    const { default: Product } = await import("./model/productModel.js");

    const { default: mountRoute } = await import("./routes/mountRouter.js");

    // =======================
    // Routes
    // =======================

    mountRoute(app);

    // Test Product API

  

    // =======================
    // 404 Handler
    // =======================

    app.use((req, res, next) => {
      const err = new Error(`Not found: ${req.originalUrl}`);

      err.status = 404;

      next(err);
    });

    // =======================
    // Error Handler
    // =======================

    app.use((err, req, res, next) => {
      res.status(err.status || 500).json({
        success: false,

        message: err.message || "Server Error",
      });
    });

    const port = process.env.PORT || 8000;

    app.listen(port, () => {});
  } catch (error) {
    process.exit(1);
  }
};

// Run server

startServer();
