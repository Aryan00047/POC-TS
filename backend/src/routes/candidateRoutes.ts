import express, { Request, Response } from "express";
import { authMiddleware, roleMiddleware } from "../middleware/authMiddleware";
import User, { IUser } from "../models/User";
import { Register, getProfile } from "../controllers/candidateController";

const router = express.Router();

// Candidate Dashboard Route
router.post(
    "/candidateDashboard", // Changed from "/dashboard" to "/" if the base route is "/api/dashboard/candidate"
    authMiddleware,
    roleMiddleware(["CANDIDATE"]), // Removed the extra comma
    Register
);

router.get(
    "/candidateDashboard", // Changed from "/dashboard" to "/" if the base route is "/api/dashboard/candidate"
    authMiddleware,
    roleMiddleware(["CANDIDATE"]), // Removed the extra comma
    getProfile);
export default router;
