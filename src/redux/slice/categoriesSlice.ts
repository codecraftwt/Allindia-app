import { createSlice } from '@reduxjs/toolkit';

const categoriesSlice = createSlice({
  name: 'categories',
  initialState: { data: [], loading: false },
  reducers: {},
});

export default categoriesSlice.reducer;
