import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./db/connect";
import authRoutes from "./routes/authRoute";

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {console.log(`Server running on ${PORT}`)});

