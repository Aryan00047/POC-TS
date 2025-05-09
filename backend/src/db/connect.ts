import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.Mongo_URL as string);
    console.log("Database connection established successfully");
  } catch (error) {
    console.error("Connection to database failed!", error);
    process.exit(1);
  }
};

export default connectDB;
