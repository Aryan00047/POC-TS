import { all } from "redux-saga/effects";
import { watchProfileSaga } from "./profileSaga";

export default function* rootSaga() {
  yield all([watchProfileSaga()]);
}
