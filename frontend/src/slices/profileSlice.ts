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

    // ✅ Use prepareAction to handle FormData
    registerProfileRequest: {
      reducer: (state) => {
        state.loading = true;
      },
      prepare: (data: Record<string, any>, resume: File | null) => {
        return {
          payload: { data }, // ✅ Only serializable data goes in payload
          meta: { resume },  // ✅ File goes in meta
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

    // ✅ Fix updateProfileRequest similarly
    // updateProfileRequest: {
    //   reducer: (state) => {
    //     state.loading = true;
    //   },
    //   prepare: (data: Record<string, any>, resume: File | null) => {
    //     return {
    //       payload: { data },
    //       meta: { resume },
    //     };
    //   },
    // },

    // updateProfileSuccess: (state, action: PayloadAction<Record<string, any>>) => {
    //   state.loading = false;
    //   state.data = { ...state.data, ...action.payload };
    //   state.error = null;
    // },

    // updateProfileFailure: (state, action: PayloadAction<string>) => {
    //   state.loading = false;
    //   state.error = action.payload;
    // },
    updateProfileRequest: (
        state,
        action: PayloadAction<{ data: Record<string, any>; resume: File | null }>
      ) => {
        state.loading = true;
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
