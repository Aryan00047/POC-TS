import express from "express";
import {register, login, logout, forgotPassword, resetPassword} from "../controllers/authController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/login", login);
router.post("/register", register);
router.post("/logout", authMiddleware, logout);
router.post("/forgotpassword", forgotPassword);
router.post("/reset-password/:resetToken", resetPassword);

export default router;