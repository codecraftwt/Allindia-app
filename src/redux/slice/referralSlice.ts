import { createSlice } from '@reduxjs/toolkit';

const referralSlice = createSlice({
  name: 'referral',
  initialState: {
    referrals: [],
    loading: false,
    error: null,
  },
  reducers: {
    setReferrals: (state, action) => {
      state.referrals = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { setReferrals, setLoading, setError } = referralSlice.actions;
export default referralSlice.reducer;
