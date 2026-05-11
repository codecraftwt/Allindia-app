import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosInstance';

interface MediaParams {
  limit?: number;
  media_type?: 'image' | 'video';
  category?: string;
  media_section?: 'reel' | 'home page';
}

export const fetchAdminMedia = createAsyncThunk(
  'media/fetchAdminMedia',
  async (params: MediaParams, { rejectWithValue }) => {
    try {
      console.log('Fetching Admin Media with params:', params);
      const response = await api.get('api/media', { params });
      console.log('Admin Media Response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Admin Media Error:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch admin media');
    }
  }
);

const mediaSlice = createSlice({
  name: 'media',
  initialState: {
    reels: [] as any[],
    homeMedia: [] as any[],
    loading: false,
    error: null as string | null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminMedia.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminMedia.fulfilled, (state, action) => {
        state.loading = false;
        const { media, media_section } = action.payload.data;
        
        // We can handle storage based on section if needed, 
        // but typically the API call will be specific to a section.
        if (action.meta.arg.media_section === 'reel') {
          state.reels = action.payload.data.media;
        } else if (action.meta.arg.media_section === 'home page') {
          state.homeMedia = action.payload.data.media;
        }
      })
      .addCase(fetchAdminMedia.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default mediaSlice.reducer;
