//src/redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import caseReducer from './slices/caseSlice';
import userReducer from './slices/userSlice'; // Import the user slice

const store = configureStore({
  reducer: {
    cases: caseReducer,
    user: userReducer, // Add the user reducer
  },
});

export default store;
