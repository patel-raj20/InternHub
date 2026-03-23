import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UIState {
  sidebarOpen: boolean;
  theme: "light" | "dark" | "system";
}

const initialState: UIState = {
  sidebarOpen: true,
  theme: "system",
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebar: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    setTheme: (state, action: PayloadAction<UIState["theme"]>) => {
      state.theme = action.payload;
    },
  },
});

export const { toggleSidebar, setSidebar, setTheme } = uiSlice.actions;
export default uiSlice.reducer;
