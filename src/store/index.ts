import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice";
import uiReducer from "./slices/uiSlice";
import internReducer from "./slices/internSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    ui: uiReducer,
    interns: internReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
