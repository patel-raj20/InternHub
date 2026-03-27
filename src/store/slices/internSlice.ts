import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Intern } from "@/lib/types";

interface InternState {
  selectedIntern: Intern | null;
  loading: boolean;
  error: string | null;
}

const initialState: InternState = {
  selectedIntern: null,
  loading: false,
  error: null,
};

const internSlice = createSlice({
  name: "intern",
  initialState,
  reducers: {
    setSelectedIntern: (state, action: PayloadAction<Intern | null>) => {
      state.selectedIntern = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setSelectedIntern, setLoading, setError } = internSlice.actions;
export default internSlice.reducer;
