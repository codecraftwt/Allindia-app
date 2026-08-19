import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosInstance';

export const fetchMetaCategories = createAsyncThunk(
  'meta/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('api/meta/job-categories');
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

export const fetchMetaCertifications = createAsyncThunk(
  'meta/fetchCertifications',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('api/meta/certifications');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch certifications');
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
    certifications: [] as any[],
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
        const rawCategories = action.payload.data?.job_categories || action.payload.data?.categories || [];
        state.categories = rawCategories.map((item: any) => ({
          ...item,
          name: item.job_category || item.name || item.job_title,
          jobs_count: item.application_count || item.jobs_count || 0
        }));
      })
      .addCase(fetchMetaCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchMetaCities.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMetaCities.fulfilled, (state, action) => {
        state.loading = false;
        const rawCities = action.payload.data.cities || [];
        const seen = new Set();
        state.cities = rawCities.filter((city: any) => {
          if (!city.id) return true; // If no id, just keep it to be safe
          if (seen.has(city.id)) return false;
          seen.add(city.id);
          return true;
        });
      })
      .addCase(fetchMetaCities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchMetaQualifications.fulfilled, (state, action) => {
        state.qualifications = action.payload.data.qualifications || [];
      })
      .addCase(fetchMetaCertifications.fulfilled, (state, action) => {
        state.certifications = action.payload.data.certifications || [];
      });
  },
});

export default metaSlice.reducer;
