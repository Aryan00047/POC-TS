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

// ✅ Fetch Profile Saga
function* fetchProfileSaga(): Generator<any, void, ApiResponse> {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        yield put(fetchProfileFailure("No token found."));
        return;
      }
  
      const response: ApiResponse = yield call(Api, { 
        url: "http://localhost:5000/api/candidate/profile", // ✅ Fixed URL
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
  
// ✅ Update Profile Saga
// function* updateProfileSaga(action: ReturnType<typeof updateProfileRequest>): Generator<any, void, ApiResponse> {
//     try {
//       const token = localStorage.getItem("token");
//       if (!token) {
//         yield put(updateProfileFailure("No token found."));
//         return;
//       }
  
//       const response: ApiResponse = yield call(Api, { 
//         url: "http://localhost:5000/api/candidate/profile/update", // ✅ Fixed URL
//         method: "put",
//         token,
//         formData: action.payload 
//       });
  
//       if (!response.error) {
//         yield put(updateProfileSuccess(response.data));
//       } else {
//         yield put(updateProfileFailure(response.message || "Error updating profile"));
//       }
//     } catch (error) {
//       yield put(updateProfileFailure("Failed to update profile"));
//     }
//   }

function* updateProfileSaga(
    action: PayloadAction<{ data: Record<string, any>; resume: File | null }>
  ): Generator<any, void, ApiResponse> {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        yield put(updateProfileFailure("No token found."));
        return;
      }
  
      const { data, resume } = action.payload;
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
        formData,
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
      const token = localStorage.getItem("token");
      if (!token) {
        yield put(registerProfileFailure("No token found."));
        return;
      }
  
      const { data } = action.payload;
      const { resume } = action.meta; // ✅ Extract resume from meta
  
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
  
      if (resume) {
        formData.append("resume", resume); // ✅ Append file if available
      }
  
      const response: ApiResponse = yield call(Api, { 
        url: "http://localhost:5000/api/candidate/profile/register",
        method: "post",
        token,
        formData 
      });
  
      if (!response.error) {
        yield put(registerProfileSuccess(response.data));
      } else {
        yield put(registerProfileFailure(response.message || "Error registering profile"));
      }
    } catch (error) {
      yield put(registerProfileFailure("Failed to register profile"));
    }
  }  

// ✅ Watcher Saga
export function* watchProfileSaga(): Generator {
  yield takeLatest(fetchProfileRequest.type, fetchProfileSaga);
  yield takeLatest(updateProfileRequest.type, updateProfileSaga);
  yield takeLatest(registerProfileRequest.type, registerProfileSaga);
}
