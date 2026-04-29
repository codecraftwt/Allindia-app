import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosInstance';
import { clearProfile } from './profileSlice';

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
      console.log("credentials ", credentials)
      const response = await api.post('api/candidate/login', credentials);
      console.log("response ", response)
      return response?.data;
    } catch (error: any) {

      console.log(error?.response?.data)
      console.log("sssss", error)
      return rejectWithValue(error.response?.data?.message || 'Login failed');
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
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
