import express from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { getDashboard } from "../controllers/dashboardController";

const router = express.Router();

// Single route to handle all dashboards based on role
router.get("/", authMiddleware, getDashboard);

export default router;
