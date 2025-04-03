import { Request, Response } from "express";
import User, { IUser } from "../models/User"; // Import your User model

// Extend Request to include `user`
interface AuthRequest extends Request {
    user?: IUser; 
}

export const getDashboard = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        // Role-based dashboard responses
        switch (req.user.role) {
            case "CANDIDATE":
                res.json({ message: "Welcome to Candidate Dashboard", user: req.user });
                break;
            case "HR":
                res.json({ message: "Welcome to HR Dashboard", user: req.user });
                break;
            case "ADMIN":
                res.json({ message: "Welcome to Admin Dashboard", user: req.user });
                break;
            default:
                res.status(403).json({ message: "Access Denied" });
        }
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};
