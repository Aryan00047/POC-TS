import { IUser } from "../models/User"; // Ensure correct import path

declare global {
  namespace Express {
    export interface Request {
      user?: IUser;
    }
  }
}