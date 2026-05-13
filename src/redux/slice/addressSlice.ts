import { createSlice } from '@reduxjs/toolkit';

const addressSlice = createSlice({
  name: 'address',
  initialState: {
    addresses: [],
    selectedCity: 'Mumbai',
    selectedArea: 'Andheri East',
    loading: false,
    error: null as string | null,
  },
  reducers: {
    setAddresses: (state, action) => {
      state.addresses = action.payload;
    },
    setSelectedLocation: (state, action: { payload: { city: string; area: string } }) => {
      state.selectedCity = action.payload.city;
      state.selectedArea = action.payload.area;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { setAddresses, setSelectedLocation, setLoading, setError } = addressSlice.actions;
export default addressSlice.reducer;
