import mongoose, { Schema, Document, Model, model } from "mongoose";

interface IApplication {
  applicationId: number;
  candidateId: mongoose.Types.ObjectId;
  jobId: mongoose.Types.ObjectId;
  numericJobId: number;
  skills: string[];
  resume: string;
  selected: boolean;
  workExperience: number;
  appliedAt: Date;
}

// Define the document type with Mongoose's Document
interface IApplicationDocument extends IApplication, Document {}

// Define the model type explicitly
interface IApplicationModel extends Model<IApplicationDocument> {}

const ApplicationSchema = new Schema<IApplicationDocument>({
  applicationId: {
    type: Number,
    unique: true,
    required: false, // ✅ Make optional since we auto-generate it
  },
  candidateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
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
    type: Number,
    required: true,
    min: 0,
  },
  selected: {
    type: Boolean,
    default: false,
  },
  appliedAt: {
    type: Date,
    default: Date.now,
  },
});

// ✅ Fix: Use `this.constructor` to access the model correctly
ApplicationSchema.pre<IApplicationDocument>("save", async function (next) {
  if (!this.applicationId) {
    const ApplicationModel = this.constructor as IApplicationModel; // Cast constructor to model type
    const lastApplication = await ApplicationModel.findOne().sort({ applicationId: -1 });

    this.applicationId = lastApplication ? lastApplication.applicationId + 1 : 101;
  }
  next();
});

// ✅ Fix: Use `this.model<IApplicationDocument>` in methods
ApplicationSchema.methods.populateJobDetails = async function () {
  return this.populate("jobId", "designation jobDescription experienceRequired package");
};

// ✅ Fix: Correctly type the model
const ApplicationModel = model<IApplicationDocument, IApplicationModel>("Application", ApplicationSchema);

export default ApplicationModel;
