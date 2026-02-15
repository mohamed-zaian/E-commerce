import express from "express";
import morgan from "morgan";
import dotenv from "dotenv";
import qs from "qs";
import hpp from "hpp";
import path from "path";
import { fileURLToPath } from "url";

import dbConnection from "./config/db.js";
import mountRoute from "./routes/mountRouter.js";

dotenv.config({ path: "./config.env" });

// Connect to database
dbConnection();

const app = express();

// Middleware
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));
app.set("query parser", (str) => qs.parse(str));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(hpp());

// Mount your API routes
mountRoute(app);

// ES Modules workaround for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve Flutter web build folder
app.use(express.static(path.join(__dirname, "build/web")));

// Send index.html for all other GET requests (frontend routing)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build/web/index.html"));
});

// 404 handler (optional, now mostly for API errors)
app.use((req, res, next) => {
  const err = new Error(`Not found: ${req.originalUrl}`);
  err.status = 404;
  next(err);
});

// Start server
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
