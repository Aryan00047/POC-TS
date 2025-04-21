import express, { Request, Response } from "express";
import { authMiddleware, roleMiddleware } from "../middleware/authMiddleware";
import User, { IUser } from "../models/User"; // Ensure correct import
import {postJob, fetchAvailableJobs, fetchCandidates, fetchCandidateProfile} from "../controllers/hrController"

const router = express.Router();

router.post("/post-job",authMiddleware,roleMiddleware(["HR"]), postJob);
router.get("/get-jobs",authMiddleware, roleMiddleware(["HR"]), fetchAvailableJobs);
router.get("/candidates",authMiddleware, roleMiddleware(["HR"]), fetchCandidates);
router.get("/candidateProfile/:email", authMiddleware, roleMiddleware(["HR"]), fetchCandidateProfile);
export default router;
