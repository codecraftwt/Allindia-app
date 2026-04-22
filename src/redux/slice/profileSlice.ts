import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosInstance';

export const fetchProfile = createAsyncThunk(
  'profile/fetchProfile',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as any;
      const token = state.auth.token;
      const response = await api.get('api/candidate/profile', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch profile');
    }
  }
);

export const updatePersonalProfile = createAsyncThunk(
  'profile/updatePersonalProfile',
  async (personalData: {
    name: string;
    phone?: string;
    gender?: string;
    date_of_birth?: string;
    address?: string;
    bio?: string;
  }, { getState, dispatch, rejectWithValue }) => {
    try {
      const state = getState() as any;
      const token = state.auth.token;
      const response = await api.put('api/candidate/profile/personal', personalData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // Refresh profile data after update
      dispatch(fetchProfile());
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update profile');
    }
  }
);

export const updatePreferencesProfile = createAsyncThunk(
  'profile/updatePreferencesProfile',
  async (preferencesData: {
    current_city_id?: number;
    preferred_city_ids?: number[];
    job_category_id?: number;
    expected_salary_min?: number;
    expected_salary_max?: number;
    work_from_home?: boolean;
    qualification_id?: number;
    education_notes?: string;
    experience_type?: string;
    total_experience_years?: number;
  }, { getState, dispatch, rejectWithValue }) => {
    try {
      const state = getState() as any;
      const token = state.auth.token;
      const response = await api.put('api/candidate/profile/preferences', preferencesData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      dispatch(fetchProfile());
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update preferences');
    }
  }
);

export const uploadResume = createAsyncThunk(
  'profile/uploadResume',
  async (file: { uri: string; name: string; type: string }, { getState, dispatch, rejectWithValue }) => {
    try {
      const state = getState() as any;
      const token = state.auth.token;
      
      const formData = new FormData();
      formData.append('resume', {
        uri: file.uri,
        name: file.name,
        type: file.type || 'application/pdf',
      } as any);

      const response = await api.post('api/candidate/profile/resume', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      
      dispatch(fetchProfile());
      return response.data;
    } catch (error: any) {
  
      return rejectWithValue(error.response?.data?.message || 'Failed to upload resume');
    }
  }
);

export const deleteResume = createAsyncThunk(
  'profile/deleteResume',
  async (_, { getState, dispatch, rejectWithValue }) => {
    try {
      const state = getState() as any;
      const token = state.auth.token;
      const response = await api.delete('api/candidate/profile/resume', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      dispatch(fetchProfile());
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete resume');
    }
  }
);

export const fetchAppliedJobs = createAsyncThunk(
  'profile/fetchAppliedJobs',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as any;
      const token = state.auth.token;
      const response = await api.get('api/candidate/profile/applied-jobs', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch applied jobs');
    }
  }
);

export const fetchWishlist = createAsyncThunk(
  'profile/fetchWishlist',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as any;
      const token = state.auth.token;
      const response = await api.get('api/candidate/profile/wishlist', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch wishlist');
    }
  }
);

const profileSlice = createSlice({
  name: 'profile',
  initialState: { 
    data: null as any, 
    appliedJobs: [] as any[],
    wishlistJobs: [] as any[],
    loading: false,
    error: null as string | null
  },
  reducers: {
    clearProfile: (state) => {
      state.data = null;
      state.appliedJobs = [];
      state.wishlistJobs = [];
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updatePersonalProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePersonalProfile.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updatePersonalProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updatePreferencesProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePreferencesProfile.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updatePreferencesProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(uploadResume.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadResume.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(uploadResume.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteResume.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteResume.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(deleteResume.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchAppliedJobs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAppliedJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.appliedJobs = action.payload.data.jobs;
      })
      .addCase(fetchAppliedJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.wishlistJobs = action.payload.data.jobs;
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearProfile } = profileSlice.actions;
export default profileSlice.reducer;
