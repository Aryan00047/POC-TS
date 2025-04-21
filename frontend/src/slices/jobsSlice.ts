import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Job } from "./hrSlice";

interface Jobs {
  data: Job[]; // Change data type to an array of Job
  loading: boolean;
  error: string | null;
}

const initialState: Jobs= {
    data: [], // Initialize as an empty array
    loading: false,
    error: null,
  };
  
  const jobsSlice = createSlice({
    name: "jobs",
    initialState,
    reducers: {
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
    getJobRequest,
    getJobRequestFailure,
    getJobRequestSuccess
  } = jobsSlice.actions;

  export default jobsSlice.reducer;