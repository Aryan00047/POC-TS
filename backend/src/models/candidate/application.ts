import mongoose, { Schema, Document, Model } from "mongoose";

// Define Interface (without extending Document)
interface IApplication {
  applicationId: number;
  candidateId: mongoose.Types.ObjectId;
  jobId: mongoose.Types.ObjectId;
  numericJobId: number;
  skills: string[];
  resume: string;
  workExperience: string;
  isSelected: boolean;
  appliedAt: Date;
  populateJobDetails: () => Promise<IApplication>;
}

// Extend Document properly
interface IApplicationDocument extends IApplication, Document {}

// Define Schema
const ApplicationSchema = new Schema<IApplicationDocument>({
  applicationId: {
    type: Number,
    unique: true,
    required: true,
  },
  candidateId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  jobId: {
    type: Schema.Types.ObjectId,
    ref: "Job",
    required: true,
  },
  numericJobId: {
    type: Number,
    required: true,
  },
  skills: {
    type: [String],
    required: true,
  },
  resume: {
    type: String,
    required: true,
  },
  workExperience: {
    type: String,
    required: true,
  },
  isSelected: {
    type: Boolean,
    default: false,
  },
  appliedAt: {
    type: Date,
    default: Date.now,
  },
});

// Middleware to auto-increment applicationId
ApplicationSchema.pre<IApplicationDocument>("validate", async function (next) {
  if (!this.applicationId) {
    const lastApplication = await ApplicationModel.findOne().sort({ applicationId: -1 });
    this.applicationId = lastApplication ? lastApplication.applicationId + 1 : 101;
  }
  next();
});

// Instance Method to Populate Job Details
ApplicationSchema.methods.populateJobDetails = function () {
  return this.populate("jobId", "designation jobDescription experienceRequired package");
};

// Create Model
const ApplicationModel: Model<IApplicationDocument> = mongoose.model<IApplicationDocument>(
  "Application",
  ApplicationSchema
);

export default ApplicationModel;
