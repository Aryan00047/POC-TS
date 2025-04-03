import mongoose, { Schema, Document, model } from "mongoose";

export interface IProfile extends Document {
    candidate_id: mongoose.Types.ObjectId;
    name: string;
    email: string;
    dob: Date;
    marks: number;
    university: string;
    skills: string[];
    resume?: string;
    working: boolean;
    company?: string;
    workExperience: number;
    designation?: string;
}

const ProfileSchema = new Schema<IProfile>(
  {
    candidate_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      immutable: true,
    },
    name: {
      type: String,
      required: true,
      immutable: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      immutable: true,
    },
    dob: {
      type: Date,
      required: true,
    },
    marks: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    university: {
      type: String,
      required: true,
    },
    skills: {
      type: [String],
      required: true,
      validate: {
        validator: (value: string[]) => value.length > 0,
        message: 'At least one skill is required.',
      },
    },
    resume: {
      type: String,
      required: false,
    },
    working: {
      type: Boolean,
      required: true,
    },
    company: {
      type: String,
      required: function (this: IProfile) {
        return this.working;
      },
    },
    designation: {
      type: String,
      required: function (this: IProfile) {
        return this.working;
      },
    },
    workExperience: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Profile = model('Profile', ProfileSchema);
export default Profile;