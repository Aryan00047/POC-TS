import { configureStore } from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";
import profileReducer from "./slices/profileSlice"; // Your slice file
import rootSaga from "./sagas/rootSaga"; // Your sagas

const sagaMiddleware = createSagaMiddleware();

const store = configureStore({
  reducer: {
    profile: profileReducer, // ✅ Add profile slice
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ thunk: false,
        serializableCheck: {
            ignoredActions: ["profile/updateProfileRequest"],
            ignoredPaths: ["payload.resume"],},
    }).concat(sagaMiddleware), // ✅ Use Saga instead of Thunk
  
});

sagaMiddleware.run(rootSaga); // ✅ Run Sagas

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
