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

export const fetchEducation = createAsyncThunk(
  'profile/fetchEducation',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as any;
      const token = state.auth.token;
      const response = await api.get('api/candidate/profile/education', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch education');
    }
  }
);

export const updateEducation = createAsyncThunk(
  'profile/updateEducation',
  async (educationData: {
    qualification_id: number | null;
    education_notes: string | null;
  }, { getState, dispatch, rejectWithValue }) => {
    try {
      const state = getState() as any;
      const token = state.auth.token;
      const response = await api.put('api/candidate/profile/education', educationData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      dispatch(fetchProfile());
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update education');
    }
  }
);

export const fetchExperience = createAsyncThunk(
  'profile/fetchExperience',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as any;
      const token = state.auth.token;
      const response = await api.get('api/candidate/profile/experience', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch experience');
    }
  }
);

export const updateExperience = createAsyncThunk(
  'profile/updateExperience',
  async (experienceData: {
    experience_type: string;
    total_experience_years: number | null;
  }, { getState, dispatch, rejectWithValue }) => {
    try {
      const state = getState() as any;
      const token = state.auth.token;
      const response = await api.put('api/candidate/profile/experience', experienceData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      dispatch(fetchProfile());
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update experience');
    }
  }
);

export const updateProfilePicture = createAsyncThunk(
  'profile/updateProfilePicture',
  async (file: { uri: string; name: string; type: string }, { getState, dispatch, rejectWithValue }) => {
    try {
      const state = getState() as any;
      const token = state.auth.token;
      
      const formData = new FormData();
      formData.append('profile_picture', {
        uri: file.uri,
        name: file.name || `profile_${Date.now()}.jpg`,
        type: file.type || 'image/jpeg',
      } as any);

      const response = await api.post('api/candidate/profile/picture', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Refresh profile data after image upload
      dispatch(fetchProfile());
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update profile picture');
    }
  }
);

export const deleteProfilePicture = createAsyncThunk(
  'profile/deleteProfilePicture',
  async (_, { getState, dispatch, rejectWithValue }) => {
    try {
      const state = getState() as any;
      const token = state.auth.token;
      const response = await api.delete('api/candidate/profile/picture', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      dispatch(fetchProfile());
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete profile picture');
    }
  }
);

export const fetchProfileCompletion = createAsyncThunk(
  'profile/fetchProfileCompletion',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as any;
      const token = state.auth.token;
      const response = await api.get('api/candidate/profile/completion', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch completion status');
    }
  }
);

export const fetchApplicationCounts = createAsyncThunk(
  'profile/fetchApplicationCounts',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as any;
      const token = state.auth.token;
      const response = await api.get('api/candidate/profile/application-counts', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch application counts');
    }
  }
);

export const changePassword = createAsyncThunk(
  'profile/changePassword',
  async (passwordData: {
    current_password: string;
    password: string;
    password_confirmation: string;
  }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as any;
      const token = state.auth.token;
      const response = await api.post('api/candidate/change-password', passwordData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.response?.data?.message || 'Failed to change password');
    }
  }
);

export const deleteAccount = createAsyncThunk(
  'profile/deleteAccount',
  async (deleteData: {
    password: string;
    deletion_reason: string;
  }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as any;
      const token = state.auth.token;
      const response = await api.delete('api/candidate/account', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: deleteData, // DELETE request body
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.response?.data?.message || 'Failed to delete account');
    }
  }
);

const profileSlice = createSlice({
  name: 'profile',
  initialState: { 
    data: null as any, 
    completion: null as any,
    appliedJobs: [] as any[],
    wishlistJobs: [] as any[],
    applicationCounts: null as any,
    loading: false,
    countsLoading: false,
    error: null as string | null
  },
  reducers: {
    clearProfile: (state) => {
      state.data = null;
      state.completion = null;
      state.applicationCounts = null;
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
        state.data = action.payload.data.profile; // Map to .profile for easier access
        state.completion = action.payload.data.profile.completion;
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
      })
      .addCase(fetchEducation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEducation.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data;
      })
      .addCase(fetchEducation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateEducation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateEducation.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updateEducation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchExperience.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExperience.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data;
      })
      .addCase(fetchExperience.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateExperience.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateExperience.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updateExperience.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateProfilePicture.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfilePicture.fulfilled, (state, action) => {
        state.loading = false;
        // Safe check for data and personal object before updating
        if (state.data?.personal && action.payload.data?.user?.profile_picture_url) {
          state.data.personal.profile_picture_url = action.payload.data.user.profile_picture_url;
        }
      })
      .addCase(updateProfilePicture.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteProfilePicture.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProfilePicture.fulfilled, (state) => {
        state.loading = false;
        if (state.data?.personal) {
          state.data.personal.profile_picture_url = null;
        }
      })
      .addCase(deleteProfilePicture.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchProfileCompletion.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchProfileCompletion.fulfilled, (state, action) => {
        state.completion = action.payload.data.completion;
      })
      .addCase(fetchProfileCompletion.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(fetchApplicationCounts.pending, (state) => {
        state.countsLoading = true;
      })
      .addCase(fetchApplicationCounts.fulfilled, (state, action) => {
        state.countsLoading = false;
        state.applicationCounts = action.payload.data.counts;
      })
      .addCase(fetchApplicationCounts.rejected, (state) => {
        state.countsLoading = false;
      })
      .addCase(changePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        // Handle nested error messages if available
        const errorData = action.payload as any;
        state.error = errorData?.message || 'Failed to change password';
      })
      .addCase(deleteAccount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAccount.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(deleteAccount.rejected, (state, action) => {
        state.loading = false;
        const errorData = action.payload as any;
        state.error = errorData?.message || 'Failed to delete account';
      });
  },
});

export const { clearProfile } = profileSlice.actions;
export default profileSlice.reducer;
