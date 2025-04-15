// import express, { Request, Response } from "express";
// import { authMiddleware, roleMiddleware } from "../middleware/authMiddleware";
// import User, { IUser } from "../models/User";
// import { register, getProfile, uploadResume, upload, updateProfile } from "../controllers/candidateController";

// const router = express.Router();

// // Candidate Dashboard Route
// router.post(
//     "/candidateDashboard",
//     authMiddleware,
//     upload.single("resume"), // This handles file upload
//     uploadResume, // This uploads file to GridFS and returns fileId
//     roleMiddleware(["CANDIDATE"]),
//     register // Saves profile with resume fileId
//   );

// router.get(
//     "/candidateDashboard", // Changed from "/dashboard" to "/" if the base route is "/api/dashboard/candidate"
//     authMiddleware,
//     roleMiddleware(["CANDIDATE"]), // Removed the extra comma
//     getProfile);
// export default router;

// router.put(
//     "/candidateDashboard",
//     authMiddleware,
//     upload.single("resume"), // This handles file upload
//     uploadResume, // This uploads file to GridFS and returns fileId
//     roleMiddleware(["CANDIDATE"]),
//     updateProfile // Saves profile with resume fileId
//   );
  

import express from "express";
import { authMiddleware, roleMiddleware } from "../middleware/authMiddleware";
import { register, getProfile, uploadResume, upload, updateProfile, getResumeByEmail } from "../controllers/candidateController";

const router = express.Router();

// ✅ Register Profile Route (POST)
router.post(
  "/profile/register",
  authMiddleware,
  roleMiddleware(["CANDIDATE"]), // ✅ Role check BEFORE file upload
  upload.single("resume"), // ✅ Handles file upload
  uploadResume, // ✅ Uploads to GridFS & sets fileId
  register // ✅ Saves profile with resume fileId
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
  
export default router;
