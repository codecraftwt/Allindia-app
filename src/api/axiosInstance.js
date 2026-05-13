import axios from 'axios';

export const BASE_URL = 'https://jobindia.ai/';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});
//https://arpeggioed-anaya-nonostensively.ngrok-free.dev/
//https://floralwhite-louse-700260.hostingersite.com   //   https://jobindia.ai/
export default api;