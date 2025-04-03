import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User, { IUser } from "../models/User"; // Import your User model

// Extend Request to include `user`
interface AuthRequest extends Request {
    user?: IUser; 
}

// Define JWT Payload explicitly
interface JwtPayload {
    id: string;
    iat?: number;
    exp?: number;
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const token = req.header("Authorization")?.split(" ")[1];

    if (!token) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }

    if (!process.env.JWT_SECRET) {
        console.error("JWT_SECRET is not defined");
        res.status(500).json({ message: "Internal Server Error" });
        return;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
        
        // Fetch user details from the database
        const user = await User.findById(decoded.id).select("-password"); // Exclude password from selection
        
        if (!user) {
            res.status(401).json({ message: "User not found" });
            return;
        }

        req.user = user; // Attach full user object
        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            res.status(401).json({ message: "Token expired, please log in again" });
            return;
        }
        res.status(401).json({ message: "Invalid token" });
        return;
    }
};

// Role-based middleware
export const roleMiddleware = (allowedRoles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
      if (!req.user) {
        res.status(403).json({ message: "Access denied. No user found." });
        return;
      }
  
      if (!allowedRoles.includes(req.user.role)) {
        res.status(403).json({ message: "Access denied. Insufficient permissions." });
        return;
      }
  
      next(); //Correct way to pass execution to next middleware
    };
  };
