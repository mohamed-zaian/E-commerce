import mongoose from "mongoose";

const dbConnection = async () => {
  try {


    await mongoose.connect(process.env.DB_URL, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });


  } catch (error) {
  
    throw error; // Re-throw to let server know connection failed
  }
};

export default dbConnection;
