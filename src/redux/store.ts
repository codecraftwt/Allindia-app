import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore } from 'redux-persist';
import { getPersistedReducer } from './persistConfig';
import authReducer from './slice/authSlice';
import categoriesReducer from './slice/categoriesSlice';
import profileReducer from './slice/profileSlice';
import servicePurchaseReducer from './slice/servicePurchaseSlice';
import referralReducer from './slice/referralSlice';
import addressReducer from './slice/addressSlice';

const rootReducer = combineReducers({
  auth: getPersistedReducer('auth', authReducer),
  categories: categoriesReducer,
  profile: profileReducer,
  servicePurchase: servicePurchaseReducer,
  referral: referralReducer,
  address: addressReducer,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

