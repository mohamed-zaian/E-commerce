import mongoose from "mongoose";

const dbConnection = async () => {
  try {


    await mongoose.connect(process.env.DB_URL, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log("✅ Database connection successful\n");


  } catch (error) {
    console.log("❌ Database connection failed:", error.message)
  
    throw error; // Re-throw to let server know connection failed
  }
};

export default dbConnection;
