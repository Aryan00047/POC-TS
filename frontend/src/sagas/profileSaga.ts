import { call, put, takeLatest } from "redux-saga/effects";
import Api from "../components/Api";
import { PayloadAction } from "@reduxjs/toolkit";

import {
  fetchProfileRequest,
  fetchProfileSuccess,
  fetchProfileFailure,
  updateProfileRequest,
  updateProfileSuccess,
  updateProfileFailure,
  registerProfileFailure,
  registerProfileRequest,
  registerProfileSuccess,
} from "../slices/profileSlice";

interface ApiResponse {
  data: Record<string, any>;
  error?: boolean;
  message?: string;
}

// Fetch Profile Saga
function* fetchProfileSaga(): Generator<any, void, ApiResponse> {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        yield put(fetchProfileFailure("No token found."));
        return;
      }
  
      const response: ApiResponse = yield call(Api, { 
        url: "http://localhost:5000/api/candidate/profile",
        method: "get", 
        token 
      });
  
      if (!response.error) {
        yield put(fetchProfileSuccess(response.data));
      } else {
        yield put(fetchProfileFailure(response.message || "Error fetching profile"));
      }
    } catch (error) {
      yield put(fetchProfileFailure("Failed to fetch profile"));
    }
  }

function* updateProfileSaga(
  action: PayloadAction<Record<string, any>, string, { resume: File | null }>
): Generator<any, void, ApiResponse> {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      yield put(updateProfileFailure("No token found."));
      return;
    }

    const data = action.payload;
    const resume = action.meta?.resume;

    if (!data || typeof data !== "object" || Object.keys(data).length === 0) {
      yield put(updateProfileFailure("Invalid profile data."));
      return;
    }

    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });

    if (resume) {
      formData.append("resume", resume);
    }

    const response: ApiResponse = yield call(Api, {
      url: "http://localhost:5000/api/candidate/profile/update",
      method: "put",
      token,
      body: formData,
    });

    if (!response.error) {
      yield put(updateProfileSuccess(response.data));
    } else {
      yield put(updateProfileFailure(response.message || "Error updating profile"));
    }
  } catch (error) {
    console.error("Update profile error:", error);
    yield put(updateProfileFailure("Failed to update profile"));
  }
}
  
  function* registerProfileSaga(
    action: ReturnType<typeof registerProfileRequest>
  ): Generator<any, void, ApiResponse> {
    try {
      // Get token from localStorage
      const token = localStorage.getItem("token");
  
      // Handle the case where token is not found
      if (!token) {
        yield put(registerProfileFailure("No token found."));
        return;
      }
  
      // Prepare FormData
      const formDataRaw = action.payload;
      const resume = action.meta?.resume;
  
      const formData = new FormData();
      Object.entries(formDataRaw).forEach(([key, value]) => {
        formData.append(key, String(value)); // Ensure the value is a string
      });
  
      // Only append resume if it exists
      if (resume) {
        formData.append("resume", resume);
      }
  
      // Send the request to the backend
      const response: ApiResponse = yield call(Api, {
        url: "http://localhost:5000/api/candidate/profile/register",
        method: "post",
        token,
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data", // Tell Axios to treat it as form data
        },
      });
  
      // Check if the response contains an error
      if (response.error) {
        yield put(registerProfileFailure(response.message || "Error registering profile"));
      } else {
        yield put(registerProfileSuccess(response.data));
      }
    } catch (error) {
      // Catch any other errors and handle them
      console.error(error); // Optional: Log the error for debugging
      yield put(registerProfileFailure("Failed to register profile"));
    }
  }

// Watcher Saga
export function* watchProfileSaga(): Generator {
  yield takeLatest(fetchProfileRequest.type, fetchProfileSaga);
  yield takeLatest(updateProfileRequest.type, updateProfileSaga);
  yield takeLatest(registerProfileRequest.type, registerProfileSaga);
}