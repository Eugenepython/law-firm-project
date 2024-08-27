// client/src/redux/slices/caseSlice.js


import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  cases: [],          // Array to hold multiple cases
  selectedCase: null, // Object to hold the currently selected case
};

const caseSlice = createSlice({
  name: 'cases',
  initialState,
  reducers: {
    addCase(state, action) {
      state.cases.push(action.payload);
    },
    setCases(state, action) {
      state.cases = action.payload;
    },
    selectCase(state, action) {
      state.selectedCase = action.payload;
    },
    clearSelectedCase(state) {
      state.selectedCase = null;
    },
  },
});

export const { addCase, setCases, selectCase, clearSelectedCase } = caseSlice.actions;

export default caseSlice.reducer;

