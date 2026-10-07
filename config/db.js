import mongoose from "mongoose";

const dbConnection = async () => {
  try {
    console.log("Connecting to database...");

    await mongoose.connect(process.env.DB_URL, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log("✅ Database connected successfully");
    console.log(`Database: ${mongoose.connection.name}`);
  } catch (error) {
    console.error("❌ Error connecting to database:", error.message);
    console.error("Full error:", error);
    throw error; // Re-throw to let server know connection failed
  }
};

export default dbConnection;
