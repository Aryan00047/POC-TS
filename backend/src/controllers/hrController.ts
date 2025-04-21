// const Job = require('../models/hr/postJob');
// const User = require('../models/userSchema');
// const Application = require('../models/candidate/application')
// const path = require('path');
// const fs = require('fs').promises; // Use the promises API
// const transporter = require('../middleware/emailTransporter');
// const { selectEmailTemplate, rejectEmailTemplate } = require('../middleware/emailTemplates');
import { Request, Response, NextFunction} from "express";
import { body, validationResult } from "express-validator";
import { authMiddleware } from "../middleware/authMiddleware";
import User, { IUser } from "../models/User";
import Profile, {IProfile} from "../models/candidate/profile";
import Job, {IJob} from "../models/hr/job";
import moment from "moment";
import multer from "multer";
import {getGridFSBucket} from "../config/gridfsConfig";
import { GridFSBucket, ObjectId } from "mongodb";
import mongoose from "mongoose";

interface AuthRequest extends Request {
    user?: IUser;
  }

export const validateJob = [
    body("jobDescription").isString().withMessage("Job Description must be a string"),
    body("experienceRequired").isNumeric().withMessage("Experience Required must be a number."),
    body("company").isString().withMessage("Company must be a string."),
    body("designation").isString().withMessage("Designation must be a string."),
    body("salary").isString().withMessage("Job Description must be a string")
];

// Function to post a new job listing
export const postJob = async (req: AuthRequest, res: Response): Promise<void> => {
    // console.log("Job post hit...");
    const hrId = req.user._id; // Assuming 'hrId' is available from the decoded token
    console.log(hrId)
    try{ 
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
          }
      
          if (!req.user) {
            res.status(401).json({ message: "Unauthorized. Please log in." });
            return;
          }
      
          if (req.user.role !== "HR") {
             res.status(403).json({ message: "Forbidden. Only HR's can post job." });
             return;
          }
  
        const { company, designation, jobDescription, experienceRequired, salary } = req.body;
  
    const hr = await User.findById(hrId);
      // Fetch the latest jobId to generate the next jobId
      const latestJob = await Job.findOne().sort({ jobId: -1 }).exec();
  
      // Ensure nextJobId is a number and handle the case where there are no jobs yet
      const nextJobId = latestJob && latestJob.jobId ? latestJob.jobId + 1 : 1;
  
      const newJob: IJob= new Job({
        jobId: nextJobId,
        hrId,
        company,
        designation,
        jobDescription,
        experienceRequired,
        salary,
        name: req.user.name,
        email : req.user.email
      });

      const savedJob = await newJob.save();
      console.log("Job posted successfully...", savedJob)
      res.status(201).json({ message: 'Job posted successfully', job: savedJob });
    } catch (error) {
      console.error("Error posting job:", error);
      res.status(500).json({ message: 'Internal Server error', error: error.message });
    }
  };

// Fetch all available jobs for candidates
export const fetchAvailableJobs = async (req:AuthRequest, res:Response): Promise<void> => {
    try {

        if (!req.user) {
            res.status(401).json({ message: "Unauthorized. Please log in." });
            return;
          }
      
          if (req.user.role !== "HR") {
             res.status(403).json({ message: "Forbidden. Only HR's can post job." });
             return;
          }
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
  
  
export const fetchCandidates = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      console.log("Fetch candidates hit...");
  
      // Ensure the user is authenticated and has the HR role
      if (!req.user || req.user.role !== 'HR') {
        console.log("Unauthorized access. Only HR can access this route...");
        res.status(403).json({ message: 'Access denied. Only HR can access this resource.' });
        return;
      }
  
      // Fetch all candidates from the User collection
      const candidates = await User.find({ role: 'candidate' }, 'name email');
      
      // Map candidates to include their profiles
      const candidatesWithProfiles = await Promise.all(
        candidates.map(async (candidate) => {
          const profile = await Profile.findOne(
            { candidate_id: candidate._id },
            'working skills'
          );
  
          return {
            candidate: {
              name: candidate.name,
              email: candidate.email,
            },
            profile: profile ? {
              working: profile.working,
              skills: profile.skills,
            } : null,
          };
        })
      );
  
      console.log("Candidates fetched successfully...");
      res.status(200).json({ message: 'Candidates fetched successfully', candidates: candidatesWithProfiles });
    } catch (error) {
      console.error("Error fetching candidates:", error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };
  
  // Fetch full candidate profile by email
export const fetchCandidateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
    console.log("Fetch full profile of candidate hit...");
    
    try {
        const { email } = req.params; // Get the email from the request parameters
  
        // Find the profile using email (case-insensitive)
        const profile = await Profile.findOne({ email: new RegExp(`^${email}$`, 'i') });
  
        // Check if the profile exists
        if (!profile) {
          console.log("Candidate's profile not found...")
            res.status(404).json({ message: 'Candidate profile not found' });
            return
        }
  
        // Send full profile information in the response
        console.log("Candidate's profile fetched successfully: ", profile)
        res.status(200).json({
            message: 'Candidate profile fetched successfully',
            profile: {
                name: profile.name,
                email: profile.email,
                dob: profile.dob,
                marks: profile.marks,
                university: profile.university,
                skills: profile.skills,
                working: profile.working,
                company: profile.company,
                designation: profile.designation,
                workExperience: profile.workExperience,
                resume: profile.resume,
            },
        });
    } catch (error) {
        console.error("Error fetching candidate profile:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
  };
  