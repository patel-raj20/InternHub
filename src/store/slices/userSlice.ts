import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserState {
  id: string | null;
  name: string | null;
  email: string | null;
  role: "INTERN" | "DEPT_ADMIN" | "SUPER_ADMIN" | null;
  department: string | null;
}

const initialState: UserState = {
  id: null,
  name: null,
  email: null,
  role: null,
  department: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<UserState>) => {
      return { ...state, ...action.payload };
    },
    setRole: (state, action: PayloadAction<UserState["role"]>) => {
      state.role = action.payload;
    },
    clearUser: () => initialState,
  },
});

export const { setUser, setRole, clearUser } = userSlice.actions;
export default userSlice.reducer;
