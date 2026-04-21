import { createSlice } from '@reduxjs/toolkit';

const profileSlice = createSlice({
  name: 'profile',
  initialState: { data: null, loading: false },
  reducers: {},
});

export default profileSlice.reducer;
