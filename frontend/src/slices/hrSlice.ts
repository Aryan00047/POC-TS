import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define a Job interface for better type safety
export interface Job {
  jobId: number;
  company: string;
  designation: string;
  jobDescription: string;
  experienceRequired: number;
  salary: string;
}

export interface JobPayLoad {
  company: string;
  designation: string;
  jobDescription: string;
  experienceRequired: number;
  salary: string;
}

interface HRState {
  data: Job[]; // Change data type to an array of Job
  loading: boolean;
  error: string | null;
}

const initialState: HRState = {
  data: [], // Initialize as an empty array
  loading: false,
  error: null,
};

const hrSlice = createSlice({
  name: "hr",
  initialState,
  reducers: {
    addJobRequest: (state, action: PayloadAction<JobPayLoad>) => {
      state.loading = true;
      state.error = null;
    },
    addJobRequestFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    addJobRequestSuccess: (state, action: PayloadAction<Job[]>) => {
      state.loading = false;
      state.error = null;
      // Add the new job to the data array
      state.data = [...state.data, ...action.payload];
    },
    getJobRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    getJobRequestSuccess: (state, action: PayloadAction<Job[]>) => {
      state.loading = false;
      state.data = action.payload; // Store the array of jobs
      state.error = null;
    },
    getJobRequestFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  addJobRequest,
  addJobRequestFailure,
  addJobRequestSuccess,
  getJobRequest,
  getJobRequestFailure,
  getJobRequestSuccess
} = hrSlice.actions;

export default hrSlice.reducer;