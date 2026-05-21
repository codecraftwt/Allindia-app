import axios from 'axios';
import { store } from '../redux/store';
import { logout } from '../redux/slice/authSlice';
import { clearProfile } from '../redux/slice/profileSlice';

export const BASE_URL = 'https://jobindia.ai/';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

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


//https://arpeggioed-anaya-nonostensively.ngrok-free.dev/   //OpenAiKey:  AIzaSyAAeEVnh_bXohVJjNEHLxYVhWAIC0YDVxg
//https://floralwhite-louse-700260.hostingersite.com   //   https://jobindia.ai/