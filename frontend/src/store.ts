import { configureStore } from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";
import profileReducer from "./slices/profileSlice"; // Your slice file
import rootSaga from "./sagas/rootSaga"; // Your sagas

const sagaMiddleware = createSagaMiddleware();

const store = configureStore({
  reducer: {
    profile: profileReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: false,
      serializableCheck: {
        ignoredActions: ["profile/registerProfileRequest", "profile/updateProfileRequest"],
        ignoredPaths: ["meta.resume"], // Corrected here
      },
    }).concat(sagaMiddleware),
});

sagaMiddleware.run(rootSaga);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
