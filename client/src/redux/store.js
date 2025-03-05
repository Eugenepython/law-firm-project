// src/redux/store.js



import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from 'redux';
import caseReducer from './slices/caseSlice';
import userReducer from './slices/userSlice';
import { createLogger } from 'redux-logger';

// Redux Persist configuration
const persistConfig = {
  key: 'root',
  storage,
};

// Root reducer
const appReducer = combineReducers({
  cases: caseReducer,
  user: userReducer,
});

// Wrap rootReducer to handle RESET_STORE action
const rootReducer = (state, action) => {
  if (action.type === 'RESET_STORE') {
    storage.removeItem('persist:root'); // Clears persisted Redux storage
    return appReducer(undefined, action); // Resets Redux state
  }
  return appReducer(state, action);
};

// Persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Logger middleware
const logger = createLogger({
  collapsed: true,
  predicate: (getState, action) => !action.type.startsWith('persist'),
});

// Configure store with middleware
const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'persist/PERSIST',
          'persist/REHYDRATE',
          'persist/FLUSH',
          'persist/PAUSE',
          'persist/PURGE',
          'persist/REGISTER',
        ],
      },
    }).concat(logger),
});

// Create persistor
export const persistor = persistStore(store);

// Helper function to reset Redux Persist on logout
export const resetReduxPersist = () => {
  persistor.purge(); // Clears Redux Persist storage
  localStorage.clear(); // Clears localStorage (Redux Persist data)
  sessionStorage.clear(); // Clears sessionStorage (if used)
  store.dispatch({ type: 'RESET_STORE' }); // Dispatch Redux reset
};

export default store;
