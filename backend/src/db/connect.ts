import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.Mongo_URL as string);
        console.log("DB connection established successfully");
    } catch (error) {
        console.log("Connection to databse failed!!!");
        process.exit(1);
    }
}

export default connectDB;