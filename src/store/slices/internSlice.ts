import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { Intern } from "@/lib/types";

interface InternState {
  list: Intern[];
  loading: boolean;
}

const initialState: InternState = {
  list: [],
  loading: false,
};

const internSlice = createSlice({
  name: "intern",
  initialState,
  reducers: {
    setInterns: (state, action: PayloadAction<Intern[]>) => {
      state.list = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { setInterns, setLoading } = internSlice.actions;
export default internSlice.reducer;
