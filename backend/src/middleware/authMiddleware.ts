import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface AuthRequest extends Request{
    user?: string;
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void>=> {
    const token = req.header("Authorization")?.split(" ")[1];

    if(!token){
        res.status(401).json({message: "Unauthorised"});
        return;
    }

    // Define the payload structure explicitly so that ts knows jwt payload has an id
    interface JwtPayload {
        id: string;
      }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
        req.user = decoded.id;
        next();
    } catch (error) {
        res.status(401).json({message: "Invalid Token"});
    }
} 