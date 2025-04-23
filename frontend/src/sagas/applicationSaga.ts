import { call, put, takeLatest } from "redux-saga/effects";
import { PayloadAction } from "@reduxjs/toolkit";
import Api from "../components/Api";
import {
    ApplicationItem,
    ApplyJobPayload,
    getApplicationRequest,
    getApplicationRequestFailure,
    getApplicationRequestSuccess,
    applyForJob,
    applyForJobFailure,
    applyForJobSuccess
} from "../slices/applicationSlice";


interface ApiResponse {
  data: {
    applications?: ApplicationItem[]; // For fetching applications (array)
    application?: ApplicationItem;    // For applying (single application)
  };
  error?: boolean;
  message?: string;
  status: number;
}


function* fetchApplicationsSaga(): Generator<any, void, ApiResponse> {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        yield put(getApplicationRequestFailure("Please log in first."));
        return;
      }
  
      const response: ApiResponse = yield call(Api, {
        url: 'http://localhost:5000/api/candidate/profile/applications',
        method: 'get',
        token,
      });
  
      yield put(getApplicationRequestSuccess(response.data.applications || []));
    } catch (error) {
      yield put(getApplicationRequestFailure("Failed to fetch applications. Please try again later."));
    }
  }


export function* applyForJobSaga(action: PayloadAction<ApplyJobPayload>): Generator<any, void, ApiResponse> {
  try {
    console.log("Saga: Applying for job...", action.payload);
    const { numericJobId } = action.payload;

    const token = localStorage.getItem("token");
    if (!token) {
      console.log("Saga: No token found!");
      yield put(applyForJobFailure("No token found. Please log in."));
      return;
    }

    const response: ApiResponse = yield call(() =>
      Api({
        url: `http://localhost:5000/api/candidate/apply/jobs/${numericJobId}`,
        method: "post",
        token,
        body: action.payload
      })
    );

    console.log("Saga: Job application response:", response);

    if (response.status === 201) {
      const application = response.data.application; // Extract application
      if (application) {
        // Dispatch success action only if the application is found
        console.log("Saga: Job application submitted successfully!");
        yield put(applyForJobSuccess(application));
      } else {
        console.log("Saga: Application object is undefined.");
        yield put(applyForJobFailure("Application could not be submitted. Please try again."));
      }
    } else if (response.status === 400 && response?.error) {
      console.log("Saga: Duplicate application detected.");
      yield put(applyForJobFailure("You have already applied for this job."));
    } else {
      console.log("Saga: Job application failed with status:", response.status);
      yield put(applyForJobFailure("Failed to apply."));
    }
  } catch (error) {
    console.error("Saga: Error applying for job:", error);
    yield put(applyForJobFailure("Something went wrong. Please try again."));
  }
}
  
  // function* applyForJobSaga(action: PayloadAction<number>): Generator<any, void, ApiResponse> {
  //   try {
  //     const jobId = action.payload;
  //     console.log("Saga: Applying for job ID:", jobId);
  
  //     const token = localStorage.getItem("token");
  //     if (!token) {
  //       console.log("Saga: No token found!");
  //       yield put(applyForJobFailure("No token found. Please log in."));
  //       return;
  //     }
  
  //     const response: ApiResponse = yield call(() =>
  //       Api({
  //         url: `http://localhost:5000/api/candidate/apply/jobs/${jobId}`,
  //         method: "post",
  //         token,
  //       })
  //     );
  
  //     console.log("Saga: Job application response:", response);
  
  //     if (response.status === 201) {
  //       yield put(applyForJobSuccess(response.data.application)); // application is a single object
  //       // Assuming `application` is a single object
  //     } else if (response.status === 400 && response?.error) {
  //       yield put(applyForJobFailure("You have already applied for this job."));
  //     } else {
  //       yield put(applyForJobFailure("Failed to apply."));
  //     }
  //   } catch (error) {
  //     console.error("Saga: Error applying for job:", error);
  //     yield put(applyForJobFailure("Something went wrong. Please try again."));
  //   }
  // }
  

  export function* watchApplicationSaga(): Generator {
    yield takeLatest(getApplicationRequest.type, fetchApplicationsSaga);
    yield takeLatest(applyForJob.type, applyForJobSaga);
  }

  