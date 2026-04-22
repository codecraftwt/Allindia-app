import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosInstance';

export const fetchMetaCategories = createAsyncThunk(
  'meta/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('api/meta/categories');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch categories');
    }
  }
);

export const fetchMetaCities = createAsyncThunk(
  'meta/fetchCities',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('api/meta/cities');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch cities');
    }
  }
);

export const fetchMetaQualifications = createAsyncThunk(
  'meta/fetchQualifications',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('api/meta/qualifications');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch qualifications');
    }
  }
);

const metaSlice = createSlice({
  name: 'meta',
  initialState: {
    categories: [] as any[],
    cities: [] as any[],
    qualifications: [] as any[],
    loading: false,
    error: null as string | null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMetaCategories.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMetaCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload.data.categories;
      })
      .addCase(fetchMetaCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchMetaCities.fulfilled, (state, action) => {
        state.cities = action.payload.data.cities;
      })
      .addCase(fetchMetaQualifications.fulfilled, (state, action) => {
        state.qualifications = action.payload.data.qualifications;
      });
  },
});

export default metaSlice.reducer;
