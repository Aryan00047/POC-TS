import mongoose, { Schema,Types, Document, model } from "mongoose";

export interface IJob extends Document{
    jobId: number;
    hrId: Types.ObjectId;
    email: string;
    name: string;
    company: string;
    designation: string;
    jobDescription: string;
    experienceRequired: number;
    salary: string

}

const JobSchema = new Schema<IJob>({
  jobId: {
    type: Number, // Numeric job ID for readability
    unique: true,
    required: true,
  },
  hrId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    immutable: true,
  },
  email: {
    type: String,
    required: true
  },
  name:{
    type: String,
    required:true
  },
  company: {
    type: String,
    required: true,
  },
  designation: {
    type: String,
    required: true,
  },
  jobDescription: {
    type: String,
    required: true,
  },
  experienceRequired: {
    type: Number,
    required: true,
  },
  salary: {
    type: String,
    required: true,
  },
});

const Job = model('Job',JobSchema)
export default Job;
