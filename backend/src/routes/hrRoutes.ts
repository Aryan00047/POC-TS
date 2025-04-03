import express, { Request, Response } from "express";
import { authMiddleware, roleMiddleware } from "../middleware/authMiddleware";
import User, { IUser } from "../models/User"; // Ensure correct import

const router = express.Router();

// Candidate Dashboard Route
router.get(
  "/dashboard",
  authMiddleware,
  roleMiddleware(["HR"]), // Role should match the enum string
  async (req: Request, res: Response) => { // declared AuthRequest globally in types dir
    res.json({ message: "HR Dashboard" });
  }
);

export default router;
