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
import ApplicationModel from "../models/candidate/application";
import {newApplicationEmailTemplate} from "../middleware/emailTemplate";
import nodemailer, { SendMailOptions, SentMessageInfo } from "nodemailer";

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

    const parsedDob = moment.utc(dob, "DD-MM-YYYY", true);
    
    if (parsedDob.isValid()) {
      formattedDob = parsedDob.toISOString(); // or .toDate() if saving as Date
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
    if (dob) {
      const parsedDob = moment.utc(dob, "DD-MM-YYYY", true);
    
      if (parsedDob.isValid()) {
        existingProfile.dob = parsedDob.toDate();
      } else {
        res.status(400).json({ message: "Invalid date format (DD-MM-YYYY)." });
        return;
      }
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

export const applyForJob = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
      console.log("Request Params:", req.params);
      const { jobId } = req.params;
      const candidateId = req.user._id;

      // Validate jobId
      const numericJobId = parseInt(jobId, 10);
      if (isNaN(numericJobId)) {
          res.status(400).json({ error: "Invalid jobId format. Must be a number." });
          return;
      }

      // Fetch job details
      const job = await Job.findOne({ jobId: numericJobId });
      if (!job) {
          res.status(404).json({ error: "Job not found" });
          return
      }

      // Fetch HR's email
      const hr = await User.findById(job.hrId);
      if (!hr || hr.role !== "HR") {
          res.status(404).json({ error: "HR associated with this job not found." });
          return
      }

      // Fetch candidate profile
      const profile = await Profile.findOne({ candidate_id: candidateId });
      if (!profile) {
           res.status(404).json({
              error: "Profile not found. Please update your profile before applying."
          });
          return;
      }

      // Check for duplicate application
      const existingApplication = await ApplicationModel.findOne({ candidateId, jobId: job._id });
      if (existingApplication) {
          res.status(400).json({ error: "You have already applied for this job." });
          return;
      }

      // Create and save new application
      const newApplication = new ApplicationModel({
          jobId: job._id,
          numericJobId: job.jobId,
          candidateId,
          name: profile.name,
          email: profile.email,
          skills: profile.skills,
          resume: profile.resume, // Keep reference to GridFS ID
          workExperience: profile.workExperience
      });

      await newApplication.save();

      const resumeId = profile.resume;
      if (!resumeId) {
          res.status(400).json({ error: "Resume file not found in GridFS." });
          return;
      }

      // Convert resumeId to ObjectId if needed
      const fileId = new ObjectId(resumeId);

      // Setup GridFS Bucket
      const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
          bucketName: "resumes"
      });

      // Create email template
      const emailTemplate = newApplicationEmailTemplate(hr, job, profile);

      // Fetch resume as stream from GridFS
      const resumeStream = bucket.openDownloadStream(fileId);

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      // Send email with resume as attachment
      const mailOptions: SendMailOptions = {
          from: process.env.EMAIL_USER,
          to: hr.email,
          subject: `New Application for Job ID: ${job.jobId}`,
          html: emailTemplate,
          attachments: [
              {
                  filename: "resume.pdf",
                  content: resumeStream, // Stream resume directly from GridFS
                  contentType: "application/pdf"
              }
          ]
      };

      // Send email
      transporter.sendMail(mailOptions, (err, info) => {
          if (err) {
              console.error("Error sending email:", err);
              return res.status(500).json({ error: "Failed to send email to HR." });
          }
          console.log("Email sent to HR:", info.response);
          res.status(201).json({
              message: "Application submitted successfully, and HR notified.",
              application: newApplication
          });
      });

  } catch (error) {
      console.error("Error applying for job:", error.message);
      res.status(500).json({ error: "Server error", details: error.message });
  }
};

export const viewCandidateApplications = async (req: AuthRequest, res: Response): Promise<void> => {
  const candidateId = req.user._id; // Candidate ID from the JWT token

  try {
    // Verify if the user is a candidate
    if (req.user.role !== "CANDIDATE") {
      console.log("You must be candidate to access this...")
      res.status(403).json({
        message: "Access denied. Only candidates can view their applications.",
      });
      return;
    }

    // Fetch all applications submitted by the candidate and populate job details
    const applications = await ApplicationModel.find({ candidateId })
      .populate({
        path: "jobId", // Populate the job details
        select: "designation company jobDescription experienceRequired salary", // Select relevant job fields
        match: { _id: { $exists: true } }, // Ensure the jobId is valid
      })
      .populate("candidateId", "name email"); // Optional: Populate candidate details (name, email)

    if (!applications || applications.length === 0) {
      console.log("No applications found...")
      res.status(404).json({ message: "No applications found." });
      return;
    }

    console.log("Applications fetched sucessfully...")
    res.status(200).json({
      message: "Applications fetched successfully",
      applications,
    });
  } catch (error) {
    console.error("Error fetching candidate applications:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

