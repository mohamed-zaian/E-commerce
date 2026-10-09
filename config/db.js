import mongoose from "mongoose";

const dbConnection = async () => {
  try {
    const conn = await mongoose.connect(process.env.DB_URL, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log("✅ Database connection successful");
    console.log("📦 Connected database:", conn.connection.name);
    console.log("🌐 Connected host:", conn.connection.host);
  } catch (error) {
    console.log("❌ Database connection failed:", error.message);
    throw error;
  }
};

export default dbConnection;
