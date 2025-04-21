import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ProfileState {
  data: Record<string, any> | null;
  loading: boolean;
  error: string | null;
}

const initialState: ProfileState = {
  data: null,
  loading: false,
  error: null,
};

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    fetchProfileRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchProfileSuccess: (state, action: PayloadAction<Record<string, any>>) => {
      state.loading = false;
      state.data = action.payload;
      state.error = null;
    },
    fetchProfileFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Use prepareAction to handle FormData
    registerProfileRequest: {
      reducer: (state) => {
        state.loading = true;
      },
      prepare: (formData: Record<string, any>, resume: File | null) => {
        return {
          payload: formData,   // Put formData directly in payload
          meta: { resume },    // Keep resume in meta
        };     
      },
    },

    registerProfileSuccess: (state, action: PayloadAction<Record<string, any>>) => {
      state.loading = false;
      state.data = { ...state.data, ...action.payload };
      state.error = null;
    },

    registerProfileFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

// In your profileSlice
  updateProfileRequest: {
    reducer: (state) => {
      state.loading = true;
    },
    prepare: (formData: Record<string, any>, resume: File | null) => {
      return {
        payload: formData,   // Put formData directly in payload
        meta: { resume },     // Store the resume in the meta field
      };
    },
  },

    updateProfileSuccess: (state, action: PayloadAction<Record<string, any>>) => {
      state.loading = false;
      state.data = { ...state.data, ...action.payload };
      state.error = null;
    },
    updateProfileFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  fetchProfileRequest,
  fetchProfileSuccess,
  fetchProfileFailure,
  registerProfileRequest,
  registerProfileSuccess,
  registerProfileFailure,
  updateProfileRequest,
  updateProfileSuccess,
  updateProfileFailure,
} = profileSlice.actions;

export default profileSlice.reducer;
