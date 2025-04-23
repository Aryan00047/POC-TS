import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import mongoose from "mongoose";

export interface ApplicationItem {
    _id: string;
    applicationId: number;
    candidateId: mongoose.Types.ObjectId;
    jobId: {
      designation?: string;
      company?: string;
      jobDescription?: string;
      experienceRequired?: number;
      package?: string;
    };
    numericJobId: number;
    skills: string[];
    resume: string;
    selected: boolean;
    workExperience: number;
    appliedAt: Date;
    status?: string;
  }
  

export interface ApplicationState {
  data: ApplicationItem[]; // Change data type to an array
  loading: boolean;
  error: string | null;
}

// slices/applicationSlice.ts
export interface ApplyJobPayload {
  numericJobId: number;
}



const initialState: ApplicationState= {
    data: [], // Initialize as an empty array
    loading: false,
    error: null,
  };
  
  const applicationSlice = createSlice({
    name: "jobs",
    initialState,
    reducers: {
      getApplicationRequest: (state) => {
        state.loading = true;
        state.error = null;
      },
      getApplicationRequestSuccess: (state, action: PayloadAction<ApplicationItem[]>) => {
        state.loading = false;
        state.data = action.payload; 
        state.error = null;
      },
      getApplicationRequestFailure: (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.error = action.payload;
      },
      applyForJob: (state, action: PayloadAction<ApplyJobPayload>) => {
        state.loading = true;
        state.error = null;
      },
      applyForJobSuccess: (state, action: PayloadAction<ApplicationItem>) => {
        state.loading = false;
        if (!state.data.some(app => app._id === action.payload._id)) {
          state.data.push(action.payload);
        }        
        state.error = null;
      },
      applyForJobFailure: (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.error = action.payload;
      }
    },
  });

  export const {
    getApplicationRequest,
    getApplicationRequestFailure,
    getApplicationRequestSuccess,
    applyForJob,
    applyForJobFailure,
    applyForJobSuccess
  } = applicationSlice.actions;

  export default applicationSlice.reducer;