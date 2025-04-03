import { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { authMiddleware } from "../middleware/authMiddleware";
import User, { IUser } from "../models/User";
import Profile, {IProfile} from "../models/candidate/profile";
import moment from "moment";

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

export const Register = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    // Ensure user is authenticated
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized. Please log in." });
      return;
    }

    // Ensure only candidates can register
    if (req.user.role !== "CANDIDATE") {
      res.status(403).json({ message: "Forbidden. Only candidates can register." });
      return;
    }

    // Check if the candidate already has a profile
    const existingProfile = await Profile.findOne({ candidate_id: req.user._id });
    if (existingProfile) {
      res.status(400).json({ 
        message: "Profile already registered. Please go to the update route.", 
        updateProfileRoute: "/api/candidate/profile/update" 
      });
      return;
    }

    const { dob, marks, university, skills, resume, working, company, workExperience, designation } = req.body;

    // Convert "DD-MM-YYYY" to ISO Date format
    const formattedDob = moment(dob, "DD-MM-YYYY").toISOString(); // Converts to "YYYY-MM-DDTHH:mm:ss.sssZ"

    // Create a new candidate profile
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
          dob: moment(newProfile.dob).format("DD-MM-YYYY"), // Convert to readable format
      },
  });
  } catch (error) {
    console.error("Error in Register Controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getProfile = async (req: AuthRequest, res: Response): Promise<void>=> {
  try {
    // Fetch the profile by candidate ID
    const profile = await Profile.findOne({ candidate_id: req.user._id });

    if (!profile) {
      console.log("Profile not found...")
      res.status(404).json({ message: "Profile not found" });
      return
    }

    console.log("Profile fetched sucessfully: ", profile)
    res.status(200).json({
      message: "Profile fetched successfully.",
      profile,
    });
  } catch (error) {
    console.error("Error fetching profile:", error.message);
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};