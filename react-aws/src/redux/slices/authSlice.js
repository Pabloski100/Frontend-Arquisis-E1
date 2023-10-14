// authSlice.js
import { createSlice } from "@reduxjs/toolkit";

export const authSlice = createSlice({
  name: "auth",
  initialState: {
    userData: { name: "", email: "" },
  },
  reducers: {

    updateData: (state, action) => {
      state.userData = action.payload;
    },

  },
});

// Action creators are generated for each case reducer function
export const { updateData } = authSlice.actions;

export default authSlice.reducer;