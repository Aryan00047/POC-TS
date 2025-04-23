import { all } from "redux-saga/effects";
import { watchProfileSaga } from "./profileSaga";
import {wachHrSaga} from "./hrSaga";
import { watchJobSaga } from "./jobSaga";
import { watchApplicationSaga } from "./applicationSaga";

export default function* rootSaga() {
  yield all([
    watchProfileSaga(),
    wachHrSaga(),
    watchJobSaga(),
    watchApplicationSaga()
  ]);
}
