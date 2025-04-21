import express from "express";
import { authMiddleware, roleMiddleware } from "../middleware/authMiddleware";
import { register, getProfile, uploadResume, upload, updateProfile, getResumeByEmail, fetchAvailableJobs } from "../controllers/candidateController";

const router = express.Router();

// ✅ Register Profile Route (POST)
router.post(
  "/profile/register",
  authMiddleware,
  roleMiddleware(["CANDIDATE"]),
  upload.single("resume"), // Handles file upload
  uploadResume, // Uploads to GridFS & sets fileId
  register 
);

// ✅ Get Profile Route (GET)
router.get(
  "/profile",
  authMiddleware,
  roleMiddleware(["CANDIDATE"]),
  getProfile
);

// ✅ Update Profile Route (PUT)
router.put(
  "/profile/update",
  authMiddleware,
  roleMiddleware(["CANDIDATE"]), // ✅ Role check BEFORE file upload
  upload.single("resume"),
  uploadResume,
  updateProfile
);

router.get(
    "/profile/resume/:email",
    authMiddleware,
    roleMiddleware(["CANDIDATE"]), // Only candidates can access their resumes
    getResumeByEmail
  );
  
router.get(
  "/profile/jobs",
  authMiddleware,
  roleMiddleware(['CANDIDATE']),
  fetchAvailableJobs
)
export default router;
