import { Request, Response } from "express";
import { authMiddleware } from "../middleware/authMiddleware"; // Ensure correct import if needed
import User, { IUser } from "../models/User"; // Import your User model

// Extend Request to include `user`
interface AuthRequest extends Request {
    user?: IUser; 
}

export const getCandidateDashboard = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        res.json({ message: "Candidate Dashboard", user: req.user }); // Send user details if needed
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};
