import express, { Request, Response } from "express";
import { authMiddleware, roleMiddleware } from "../middleware/authMiddleware";

const router = express.Router();

// Candidate Dashboard Route
router.get(
  "/dashboard",
  authMiddleware,
  roleMiddleware(["ADMIN"]), // Role should match the enum string
  async (req: Request, res: Response) => {
    res.json({ message: "ADMIN Dashboard" });
  }
);

export default router;
