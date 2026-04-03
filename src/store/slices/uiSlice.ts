import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UIState {
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  theme: "light" | "dark" | "system";
}

const initialState: UIState = {
  sidebarOpen: true,
  sidebarCollapsed: false,
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
    toggleCollapse: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.sidebarCollapsed = action.payload;
    },
    setTheme: (state, action: PayloadAction<UIState["theme"]>) => {
      state.theme = action.payload;
    },
  },
});

export const { toggleSidebar, setSidebar, toggleCollapse, setSidebarCollapsed, setTheme } = uiSlice.actions;
export default uiSlice.reducer;
