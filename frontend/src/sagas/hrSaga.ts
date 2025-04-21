import { call, put, takeLatest } from "redux-saga/effects";
import { PayloadAction } from "@reduxjs/toolkit";
import Api from "../components/Api";
import {
  addJobRequest,
  addJobRequestFailure,
  addJobRequestSuccess,
  getJobRequest,
  getJobRequestFailure,
  getJobRequestSuccess
} from "../slices/hrSlice";
import { Job } from "../slices/hrSlice";

interface ApiResponse {
  data: { jobs: Job[] }; 
  error?: boolean;
  message?: string;
}


function* postJobSaga(action: PayloadAction<Job>): Generator<any, void, ApiResponse> {
  console.log("🔥 Saga triggered with payload:", action.payload);
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      yield put(addJobRequestFailure("Please log in first."));
      return;
    }

    const data = action.payload;

    if (!data || typeof data !== "object" || Object.keys(data).length === 0) {
      yield put(addJobRequestFailure("Invalid job data."));
      return;
    }

    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });

    const response: ApiResponse = yield call(Api, {
      url: "http://localhost:5000/api/hr/post-job",
      method: "post",
      token,
      body: action.payload,
    });

    if (!response.error) {
      yield put(addJobRequestSuccess(response.data.jobs));
    } else {
      yield put(addJobRequestFailure(response.message || "Error posting job"));
    }
  } catch (error) {
    console.error("Post job error:", error);
    yield put(addJobRequestFailure("Failed to post job"));
  }
}

function* getJobSaga(): Generator<any, void, ApiResponse> {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found');
      yield put(getJobRequestFailure('No token found.'));
      return;
    }

    console.log('Making API call to fetch jobs...');
    const response: ApiResponse = yield call(Api, {
      url: 'http://localhost:5000/api/hr/get-jobs',
      method: 'get',
      token,
    });

    console.log('API response received:', response);

    if (!response.error) {
      // Ensure the response data is an array of jobs
      const jobs = response.data.jobs;
      if (Array.isArray(jobs)) {
        yield put(getJobRequestSuccess(jobs)); // Send the jobs array to the reducer
      } else {
        console.error('Invalid data format:', response.data);
        yield put(getJobRequestFailure('Invalid response format'));
      }
    } else {
      console.error('API Error:', response.message);
      yield put(getJobRequestFailure(response.message || 'Error fetching jobs'));
    }
  } catch (error) {
    console.error('Error fetching jobs:', error);
    yield put(getJobRequestFailure('Failed to get jobs'));
  }
}

export function* wachHrSaga(): Generator {
  yield takeLatest(addJobRequest.type, postJobSaga);
  yield takeLatest(getJobRequest.type, getJobSaga);
}