import { call, put, takeLatest } from "redux-saga/effects";
import Api from "../components/Api";
import {
  getJobRequest,
  getJobRequestFailure,
  getJobRequestSuccess
} from "../slices/jobsSlice";
import { Job } from "../slices/hrSlice";

interface ApiResponse {
    data: { jobs: Job[] }; 
    error?: boolean;
    message?: string;
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
        url: 'http://localhost:5000/api/candidate/profile/jobs',
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
  
  export function* watchJobSaga(): Generator {
    yield takeLatest(getJobRequest.type, getJobSaga);
  }