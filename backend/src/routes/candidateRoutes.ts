import express, { Request, Response } from "express";
import { authMiddleware, roleMiddleware } from "../middleware/authMiddleware";
import User, { IUser } from "../models/User";
import { getCandidateDashboard } from "../controllers/candidateController";

const router = express.Router();

// Candidate Dashboard Route
router.get(
    "/", // Changed from "/dashboard" to "/" if the base route is "/api/dashboard/candidate"
    authMiddleware,
    roleMiddleware(["CANDIDATE"]), // Removed the extra comma
    getCandidateDashboard
);

export default router;
