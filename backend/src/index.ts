import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./db/connect";
import authRoutes from "./routes/authRoutes";
import candidateRoutes from "./routes/candidateRoutes";
import hrRoutes from "./routes/hrRoutes";
import adminRoutes from "./routes/adminRoutes";
import dashboradRoutes from "./routes/dashboardRoutes";

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/candidate", candidateRoutes);
app.use("/api/hr", hrRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/dashboard", dashboradRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {console.log(`Server running on ${PORT}`)});

