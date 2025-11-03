import mongoose from "mongoose";

const dbConnection = async () => {
  try {
    console.log("Connecting to database...");
    await mongoose.connect(process.env.DB_URL);
    console.log("✅ Database connected successfully");
  } catch (error) {
    console.error("❌ Error connecting to database:", error.message);
  }
};

export default dbConnection;
