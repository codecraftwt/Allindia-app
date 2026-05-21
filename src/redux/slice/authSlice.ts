import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosInstance';
import { clearProfile, updatePersonalProfile, updateProfilePicture, deleteProfilePicture } from './profileSlice';

interface AuthState {
  user: any | null;
  token: string | null;
  tokenType: string | null;
  isLoggedIn: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  tokenType: null,
  isLoggedIn: false,
  loading: false,
  error: null,
};

export const loginCandidate = createAsyncThunk(
  'auth/loginCandidate',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/candidate/login', credentials);
      return response?.data;
    } catch (error: any) {
      console.log("Login Error:", error?.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

export const registerCandidate = createAsyncThunk(
  'auth/registerCandidate',
  async (userData: any, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/candidate/register', userData);
      return response?.data;
    } catch (error: any) {
      console.log("Registration Error:", error?.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || 'Registration failed');
    }
  }
);

export const logoutCandidate = createAsyncThunk(
  'auth/logoutCandidate',
  async (_, { getState, dispatch, rejectWithValue }) => {
    try {
      const state = getState() as any;
      const token = state.auth.token;

      if (token) {
        await api.post('api/candidate/logout', {}, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }

      dispatch(logout());
      dispatch(clearProfile());
      return true;
    } catch (error: any) {

      // Still logout locally even if API fails (e.g. token expired)
      dispatch(logout());
      dispatch(clearProfile());
      return rejectWithValue(error.response?.data?.message || 'Logout failed');
    }
  }
);

export const forgotPasswordCandidate = createAsyncThunk(
  'auth/forgotPasswordCandidate',
  async (email: string, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/candidate/forgot-password', { email });
      return response?.data;
    } catch (error: any) {
      console.log("Forgot Password Error:", error?.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || 'Failed to send reset link');
    }
  }
);

export const resetPasswordCandidate = createAsyncThunk(
  'auth/resetPasswordCandidate',
  async (payload: any, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/candidate/reset-password', payload);
      return response?.data;
    } catch (error: any) {
      console.log("Reset Password Error:", error?.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || 'Failed to reset password');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.tokenType = null;
      state.isLoggedIn = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginCandidate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginCandidate.fulfilled, (state, action) => {
        state.loading = false;
        state.isLoggedIn = true;
        // Updated to match Swagger structure: action.payload.data.user/token
        state.user = action.payload.data?.user;
        state.token = action.payload.data?.token;
        state.tokenType = action.payload.data?.token_type;
      })
      .addCase(loginCandidate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(registerCandidate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerCandidate.fulfilled, (state, action) => {
        state.loading = false;
        state.isLoggedIn = true;
        state.user = action.payload.data?.user;
        state.token = action.payload.data?.token;
        state.tokenType = action.payload.data?.token_type;
      })
      .addCase(registerCandidate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updatePersonalProfile.fulfilled, (state, action) => {
        if (state.user) {
          if (action.meta.arg.name) {
            state.user.name = action.meta.arg.name;
          }
          if (action.meta.arg.phone) {
            state.user.phone = action.meta.arg.phone;
          }
        }
      })
      .addCase(updateProfilePicture.fulfilled, (state, action) => {
        if (state.user && action.payload.data?.user?.profile_picture_url) {
          state.user.profile_picture_url = action.payload.data.user.profile_picture_url;
        }
      })
      .addCase(deleteProfilePicture.fulfilled, (state) => {
        if (state.user) {
          state.user.profile_picture_url = null;
        }
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
