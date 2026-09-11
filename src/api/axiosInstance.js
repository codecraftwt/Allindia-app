import axios from 'axios';
import { store } from '../redux/store';
import { logout } from '../redux/slice/authSlice';
import { clearProfile } from '../redux/slice/profileSlice';

export const BASE_URL = 'https://jobindia.ai/';
// export const BASE_URL = 'https://juvenile-cartwheel-thinner.ngrok-free.dev/';


const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

// Request interceptor to automatically attach Authorization header from Redux state
api.interceptors.request.use(
  (config) => {
    try {
      const state = store.getState();
      const token = state?.auth?.token;
      if (token && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      // Store not ready or error
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle global 401 Unauthenticated errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If server returns 401, token is invalid/expired. 
      // Automatically dispatch logout to sync the frontend with the server.
      store.dispatch(logout());
      store.dispatch(clearProfile());
    }
    return Promise.reject(error);
  }
);

export default api;

