import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosInstance';

export const fetchJobs = createAsyncThunk(
  'jobs/fetchJobs',
  async (params: {
    sort?: string;
    q?: string;
    category_id?: number;
    city_id?: number;
    job_type?: string;
    applied?: boolean;
    wishlisted?: boolean;
    per_page?: number;
    page?: number;
    section?: 'recommended' | 'latest' | 'trending' | 'nearby' | 'search' | 'filter';
  }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as any;
      const token = state.auth.token;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await api.get('api/candidate/jobs', { params, headers });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch jobs');
    }
  }
);

export const searchJobs = createAsyncThunk(
  'jobs/searchJobs',
  async (query: string, { rejectWithValue }) => {
    try {
      const response = await api.get('api/candidate/jobs/search', {
        params: { q: query }
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to search jobs');
    }
  }
);

export const filterJobs = createAsyncThunk(
  'jobs/filterJobs',
  async (params: {
    category_id?: number;
    subcategory_id?: number;
    city_id?: number;
    job_type?: string;
    q?: string;
    salary_min?: number;
    salary_max?: number;
    freshness?: string;
    location?: string;
  }, { rejectWithValue }) => {
    try {
      const response = await api.get('api/candidate/jobs/filter', { params });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to filter jobs');
    }
  }
);

export const fetchHomeFeed = createAsyncThunk(
  'jobs/fetchHomeFeed',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as any;
      const token = state.auth.token;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await api.get('api/candidate/jobs/home-feed', { headers });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch home feed');
    }
  }
);

export const fetchJobsByCategory = createAsyncThunk(
  'jobs/fetchJobsByCategory',
  async (params: { category_id?: number; limit?: number; jobs_per_category?: number }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as any;
      const token = state.auth.token;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await api.get('api/candidate/jobs/by-category', { params, headers });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch jobs by category');
    }
  }
);

export const fetchJobDetail = createAsyncThunk(
  'jobs/fetchJobDetail',
  async (jobId: number | string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as any;
      const token = state.auth.token;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await api.get(`api/candidate/jobs/${jobId}`, { headers });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch job detail');
    }
  }
);

import { fetchWishlist } from './profileSlice';

export const toggleWishlist = createAsyncThunk(
  'jobs/toggleWishlist',
  async ({ jobId, isWishlisted }: { jobId: number | string; isWishlisted: boolean }, { getState, dispatch, rejectWithValue }) => {
    try {
      const state = getState() as any;
      const token = state.auth.token;


      if (isWishlisted) {

        const res = await api.request({
          method: 'DELETE',
          url: `/api/candidate/jobs/${jobId}/wishlist`,
          headers: { Authorization: `Bearer ${token}` },
        });

      } else {

        const res = await api.request({
          method: 'POST',
          url: `/api/candidate/jobs/${jobId}/wishlist`,
          headers: { Authorization: `Bearer ${token}` },
        });

      }
      // Refresh wishlist in profile slice
      dispatch(fetchWishlist());
      return { jobId, isWishlisted: !isWishlisted };
    } catch (error: any) {

      return rejectWithValue(error.response?.data?.message || 'Failed to update wishlist');
    }
  }
);

export const applyJob = createAsyncThunk(
  'jobs/applyJob',
  async ({ jobId, answers }: { jobId: number | string, answers?: Record<string, number> }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as any;
      const token = state.auth.token;
      const response = await api.post(`api/candidate/jobs/${jobId}/apply`, { answers }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to apply for job');
    }
  }
);

export const reportJob = createAsyncThunk(
  'jobs/reportJob',
  async ({ jobId, reason }: { jobId: number | string, reason: string }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as any;
      const token = state.auth.token;
      const response = await api.post(`/api/candidate/jobs/${jobId}/report`, { reason }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to report job');
    }
  }
);

const jobSlice = createSlice({
  name: 'jobs',
  initialState: {
    recommended: [] as any[],
    nearby: [] as any[],
    trending: [] as any[],
    latest: [] as any[],
    searchResults: [] as any[],
    filteredJobs: [] as any[],
    jobsByCategory: [] as any[],
    currentJob: null as any,
    homeLoading: false,
    categoryLoading: false,
    searchLoading: false,
    detailLoading: false,
    loading: false, // fallback
    error: null as string | null,
    meta: null as any,
  },
  reducers: {
    clearCurrentJob: (state) => {
      state.currentJob = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchJobs.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.loading = false;
        const { section, sort } = action.meta.arg;
        const jobs = action.payload.data.jobs;

        if (section === 'recommended' || sort === 'recommended') {
          state.recommended = jobs;
        } else if (section === 'latest' || sort === 'latest') {
          state.latest = jobs;
        } else if (section === 'trending' || sort === 'trending') {
          state.trending = jobs;
        } else if (section === 'nearby') {
          state.nearby = jobs;
        } else {
          state.searchResults = jobs;
        }
        state.meta = action.payload.meta;
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(searchJobs.pending, (state) => {
        state.searchLoading = true;
        state.error = null;
      })
      .addCase(searchJobs.fulfilled, (state, action) => {
        state.searchLoading = false;
        state.searchResults = action.payload.data.jobs || [];
        state.meta = action.payload.meta;
      })
      .addCase(searchJobs.rejected, (state, action) => {
        state.searchLoading = false;
        state.error = action.payload as string;
      })
      .addCase(filterJobs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(filterJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.filteredJobs = action.payload.data.jobs || [];
        state.meta = action.payload.meta;
      })
      .addCase(filterJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchHomeFeed.pending, (state) => {
        state.homeLoading = true;
      })
      .addCase(fetchHomeFeed.fulfilled, (state, action) => {
        state.homeLoading = false;
        state.trending = action.payload.data.trending || [];
        state.nearby = action.payload.data.nearby || [];
        state.recommended = action.payload.data.recommended || [];
        state.latest = action.payload.data.latest || [];
      })
      .addCase(fetchHomeFeed.rejected, (state, action) => {
        state.homeLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchJobsByCategory.pending, (state) => {
        state.categoryLoading = true;
        state.error = null;
      })
      .addCase(fetchJobsByCategory.fulfilled, (state, action) => {
        state.categoryLoading = false;
        state.jobsByCategory = action.payload.data.categories || [];
      })
      .addCase(fetchJobsByCategory.rejected, (state, action) => {
        state.categoryLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchJobDetail.pending, (state) => {
        state.detailLoading = true;
        state.error = null;
      })
      .addCase(fetchJobDetail.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.currentJob = action.payload.data.job;
      })
      .addCase(fetchJobDetail.rejected, (state, action) => {
        state.detailLoading = false;
        state.error = action.payload as string;
      })
      .addCase(applyJob.pending, (state) => {
        state.error = null;
      })
      .addCase(applyJob.fulfilled, (state) => {
        // Handled locally
      })
      .addCase(applyJob.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(toggleWishlist.pending, (state) => {
        // Handled locally
      })
      .addCase(toggleWishlist.fulfilled, (state, action) => {
        const { jobId, isWishlisted } = action.payload;
        if (state.currentJob && state.currentJob.id === jobId) {
          state.currentJob.is_wishlisted = isWishlisted;
        }
        // Also update in other lists if necessary
        const updateJob = (job: any) => {
          if (job.id === jobId) job.is_wishlisted = isWishlisted;
        };
        state.recommended.forEach(updateJob);
        state.trending.forEach(updateJob);
        state.nearby.forEach(updateJob);
        state.latest.forEach(updateJob);
      })
      .addCase(toggleWishlist.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(reportJob.fulfilled, (state) => {
        if (state.currentJob) {
          state.currentJob.is_reported = true;
        }
      });
  },
});

export const { clearCurrentJob } = jobSlice.actions;
export default jobSlice.reducer;
