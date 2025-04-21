import { Request, Response, NextFunction} from "express";
import { body, validationResult } from "express-validator";
import { authMiddleware } from "../middleware/authMiddleware";
import User, { IUser } from "../models/User";
import Profile, {IProfile} from "../models/candidate/profile";
import moment from "moment";
import multer from "multer";
import {getGridFSBucket} from "../config/gridfsConfig";
import { GridFSBucket, ObjectId } from "mongodb";
import Job from "../models/hr/job"
import mongoose from "mongoose";

const storage = multer.memoryStorage();
export const upload = multer({ storage });

interface AuthRequest extends Request {
  user?: IUser;
}

// Validation middleware for profile registration
export const validateProfile = [
  body("dob")
  .matches(/^\d{2}-\d{2}-\d{4}$/)
  .withMessage("Invalid date format (DD-MM-YYYY). Use 'DD-MM-YYYY' format."),
  body("marks").isNumeric().withMessage("Marks must be a number."),
  body("university").isString().trim().notEmpty().withMessage("University is required."),
  body("skills").isArray({ min: 1 }).withMessage("At least one skill is required."),
  body("working").isBoolean().withMessage("Working status must be true or false."),
  body("workExperience").isNumeric().withMessage("Work experience must be a number."),
  body("resume").optional().isString().withMessage("Resume must be a string."),
  body("company").optional().isString().withMessage("Company must be a string."),
  body("designation").optional().isString().withMessage("Designation must be a string."),
];

export const register = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    if (!req.user) {
      res.status(401).json({ message: "Unauthorized. Please log in." });
      return;
    }

    if (req.user.role !== "CANDIDATE") {
       res.status(403).json({ message: "Forbidden. Only candidates can register." });
       return;
    }

    const existingProfile = await Profile.findOne({ candidate_id: req.user._id });
    if (existingProfile) {
       res.status(400).json({
        message: "Profile already registered. Please go to the update route.",
        updateProfileRoute: "/api/candidate/profile/update",
      });
      return;
    }

    const { dob, marks, university, skills, working, company, workExperience, designation } = req.body;
    const resume = req.body.resume ? req.body.resume.toString() : null; // ✅ Ensure it's a string or null

    let formattedDob: string | null = null;
    if (dob && moment(dob, "DD-MM-YYYY", true).isValid()) {
      formattedDob = moment(dob, "DD-MM-YYYY").toISOString();
    } else {
      console.error(`Invalid dob format: ${dob}`);
      res.status(400).json({ message: "Invalid date format (DD-MM-YYYY)." });
      return;
    }

    const newProfile: IProfile = new Profile({
      candidate_id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      dob: formattedDob,
      marks,
      university,
      skills,
      resume,
      working,
      company,
      workExperience,
      designation,
    });

    await newProfile.save();

    res.status(201).json({
      message: "Profile registered successfully",
      profile: {
        ...newProfile.toObject(),
        dob: moment(newProfile.dob).format("DD-MM-YYYY"),
      },
    });
  } catch (error) {
    console.error("Error in Register Controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


export const uploadResume = async (req: Request,res: Response,next: NextFunction): Promise<void> => {
  if (!req.file) {
    return next(); // ✅ No file? Proceed to the next middleware
  }

  try {
    const gfs = getGridFSBucket();
    const uploadStream = gfs.openUploadStream(req.file.originalname);

    uploadStream.on("finish", function () {
      if (!uploadStream.id) {
        return res.status(500).json({ message: "Upload failed, file ID missing" });
      }
      req.body.resume = uploadStream.id.toString(); // ✅ Convert ObjectId to string
      console.log("Resume Uploaded, ID:", req.body.resume);
      next(); // ✅ Continue to register or update profile
    });

    uploadStream.on("error", (err) => {
      console.error("Upload Error:", err);
      return res.status(500).json({ message: "Error uploading file" });
    });

    // ✅ Call end AFTER setting listeners
    uploadStream.end(req.file.buffer);
  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


export const getResumeByEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.params;

    // Step 1: Find profile by email
    const profile = await Profile.findOne({ email });
    if (!profile || !profile.resume) {
      res.status(404).json({ message: "Resume not found for this email" });
      return;
    }

    const gfs = getGridFSBucket();

    // Step 2: Convert resume ID string to ObjectId
    const fileId = new mongoose.Types.ObjectId(profile.resume);

    // Step 3: Find the file in GridFS
    const files = await gfs.find({ _id: fileId }).toArray();
    if (!files || files.length === 0) {
      res.status(404).json({ message: "File not found in GridFS" });
      return;
    }

    const file = files[0];

    // Step 4: Set headers and stream file
    res.setHeader("Content-Type", file.contentType || "application/octet-stream");
    res.setHeader("Content-Disposition", `attachment; filename="${file.filename}"`);

    const downloadStream = gfs.openDownloadStream(fileId);
    downloadStream.pipe(res);

    downloadStream.on("error", (err) => {
      console.error("Download error:", err);
      res.status(500).json({ message: "Error downloading file" });
    });

  } catch (err) {
    console.error("Resume download error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized. Please log in." });
      return
    }

    const profile = await Profile.findOne({ candidate_id: req.user._id });
    if (!profile) {
      console.log("Profile not found...");
      res.status(404).json({ message: "Profile not found" });
      return
    }

    console.log("Profile fetched successfully:", profile);
    res.status(200).json({ message: "Profile fetched successfully.", profile });
  } catch (error) {
    console.error("Error fetching profile:", error.message);
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    if (!req.user) {
      res.status(401).json({ message: "Unauthorized. Please log in." });
      return;
    }

    if (req.user.role !== "CANDIDATE") {
      res.status(403).json({ message: "Forbidden. Only candidates can update profile." });
      return;
    }

    const existingProfile = await Profile.findOne({ candidate_id: req.user._id });
    if (!existingProfile) {
      res.status(404).json({ message: "Profile not found. Please register first." });
      return;
    }

    const { dob, marks, university, skills, resume, working, company, workExperience, designation } = req.body;

    // Handle date of birth (dob)
    if (dob && moment(dob, "DD-MM-YYYY", true).isValid()) {
      existingProfile.dob = moment(dob, "DD-MM-YYYY").toDate();
    } else if (dob) {
      res.status(400).json({ message: "Invalid date format (DD-MM-YYYY)." });
      return;
    }

    // Update other fields
    if (marks) existingProfile.marks = marks;
    if (university) existingProfile.university = university;
    if (skills) existingProfile.skills = skills;

    // Handle resume (ensure it's a string or null)
    if (resume) {
      // If you're storing it as a string (e.g., URL or GridFS ID), make sure it's valid
      existingProfile.resume = resume.toString(); // Assuming resume is passed as string or file path
    }

    if (working !== undefined) existingProfile.working = working;
    if (company) existingProfile.company = company;
    if (workExperience) existingProfile.workExperience = workExperience;
    if (designation) existingProfile.designation = designation;

    // Save updated profile
    await existingProfile.save();

    // Send response back
    res.status(200).json({
      message: "Profile updated successfully",
      profile: {
        ...existingProfile.toObject(),
        dob: moment(existingProfile.dob).format("DD-MM-YYYY"), // Format date to send back
      },
    });
  } catch (error) {
    console.error("Error in updateProfile Controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Fetch all available jobs for candidates
export const fetchAvailableJobs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Find all jobs that are currently available (you may want to add filters for availability)
    const jobs = await Job.find().sort({ jobId: 1 }); // Sorting by jobId to show them in order

    if (!jobs.length) {
      console.log("No jobs Available currently")
       res.status(404).json({ message: "No jobs available at the moment." });
       return;
    }

    console.log("Jobs fetched sucessfully...")
    res.status(200).json({
      message: "Available jobs fetched successfully",
      jobs,
    });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    res.status(500).json({
      message: "Error fetching available jobs",
      error: error.message,
    });
  }
};