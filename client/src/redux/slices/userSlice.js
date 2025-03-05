//client/src/redux/slices/userSlice.js

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  lawFirmId: null,
  userId: null,
  username: null,
  email: null,
  // Add any other user-related state here
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setLawFirmId(state, action) {
      state.lawFirmId = action.payload;
    },
    setUserId(state, action) {
      state.userId = action.payload;
    },
    setUsername(state, action) {
      state.username = action.payload;
    },
    setEmail(state, action) {
      state.email = action.payload;
    },
    // You can add more reducers to manage other user-related actions
    clearUserData(state) {
      state.lawFirmId = null;
      state.userId = null;
      state.username = null;
      state.email = null;
    },
  },
});

export const { setLawFirmId, setUserId, setUsername, setEmail, clearUserData } = userSlice.actions;

export default userSlice.reducer;
